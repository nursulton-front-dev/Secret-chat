import React, { useState, useEffect, useRef } from 'react';
import { Send, LogOut, Lock, Database, User, Terminal } from 'lucide-react';
import { encryptMessage, decryptMessage } from '../utils/crypto';
import { supabase } from '../services/supabase';
import { SecureLogEntry } from '../types';

interface SecureLogProps {
  encryptionKey: CryptoKey;
  onLogout: () => void;
}

export const SecureLog: React.FC<SecureLogProps> = ({ encryptionKey, onLogout }) => {
  const [logs, setLogs] = useState<SecureLogEntry[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<'ОЖИДАНИЕ' | 'СИНХРОНИЗАЦИЯ' | 'ШИФРОВАНИЕ'>('ОЖИДАНИЕ');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchAndDecryptLogs();
    
    // Simple polling for real-time updates (Supabase Realtime could also be used)
    const interval = setInterval(fetchAndDecryptLogs, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const fetchAndDecryptLogs = async () => {
    setStatus('СИНХРОНИЗАЦИЯ');
    
    let data: SecureLogEntry[] = [];
    
    if (supabase) {
        // Try to fetch from Supabase
        const { data: remoteData, error } = await supabase
            .from('secure_logs')
            .select('*')
            .order('created_at', { ascending: true });
        
        if (!error && remoteData) {
            data = remoteData;
        }
    } else {
        // Fallback for demo without backend
        console.warn("Supabase not connected. Using local mock data.");
        // We might want to read from local state if we want persistence in demo
    }

    // Decrypt content
    const decryptedLogs = await Promise.all(
        data.map(async (log) => {
            const plain = await decryptMessage(encryptionKey, log.content_encrypted, log.iv);
            return { ...log, decryptedContent: plain };
        })
    );

    setLogs(decryptedLogs);
    setStatus('ОЖИДАНИЕ');
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setSending(true);
    setStatus('ШИФРОВАНИЕ');

    try {
        // 1. Encrypt locally
        const { ciphertext, iv } = await encryptMessage(encryptionKey, input);

        // 2. Send to server
        if (supabase) {
             // In a real app, user_id comes from supabase auth session
             // Here we just insert. RLS would normally block this if not authenticated.
             // For the demo we assume anonymous insert or auth is handled.
             const { error } = await supabase.from('secure_logs').insert({
                 content_encrypted: ciphertext,
                 iv: iv,
                 // user_id is usually auto-assigned by default to auth.uid() in schema
             });
             
             if (error) throw error;
        } else {
            // Mock local addition
            const newLog: SecureLogEntry = {
                id: Date.now().toString(),
                user_id: 'local',
                content_encrypted: ciphertext,
                iv: iv,
                created_at: new Date().toISOString(),
                decryptedContent: input
            };
            setLogs(prev => [...prev, newLog]);
        }

        setInput('');
        if (supabase) await fetchAndDecryptLogs(); // Refresh
    } catch (err) {
        console.error("Failed to send log:", err);
        alert("Ошибка передачи. В соединении отказано.");
    } finally {
        setSending(false);
        setStatus('ОЖИДАНИЕ');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-black text-terminal-text font-mono overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-terminal-dim bg-[#020202]">
        <div className="flex items-center gap-3">
            <div className="p-2 border border-terminal-text rounded bg-terminal-text/10 animate-pulse">
                <Terminal className="w-5 h-5" />
            </div>
            <div>
                <h1 className="text-lg font-bold tracking-widest">ROOT_ДОСТУП // ЗАЩИЩЕННЫЕ_ЛОГИ</h1>
                <p className="text-[10px] text-terminal-dim flex items-center gap-2">
                    <Lock className="w-3 h-3" />
                    ШИФРОВАНИЕ AES-256-GCM
                </p>
            </div>
        </div>
        <button 
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 text-xs border border-terminal-alert text-terminal-alert hover:bg-terminal-alert/10 transition-colors"
        >
            <LogOut className="w-3 h-3" />
            ЗАВЕРШИТЬ_СЕССИЮ
        </button>
      </header>

      {/* Log Feed */}
      <main className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-terminal-dim scrollbar-track-transparent">
         {logs.length === 0 && (
             <div className="text-center text-terminal-dim mt-20 opacity-50">
                 <Database className="w-12 h-12 mx-auto mb-4" />
                 <p>ЗАПИСИ НЕ НАЙДЕНЫ НА ЗАШИФРОВАННОМ РАЗДЕЛЕ</p>
             </div>
         )}
         
         {logs.map((log) => (
             <div key={log.id} className="group relative">
                 <div className="flex gap-4 items-start max-w-3xl">
                     <div className="mt-1 text-terminal-dim">
                        <User className="w-4 h-4" />
                     </div>
                     <div className="flex-1">
                         <div className="flex items-baseline gap-3 mb-1">
                             <span className="text-[10px] text-terminal-dim">{new Date(log.created_at).toLocaleString()}</span>
                             <span className="text-[10px] text-gray-700">ID: {log.id.slice(0, 8)}</span>
                         </div>
                         <div className="text-sm leading-relaxed text-gray-300 break-words">
                             {log.decryptedContent?.startsWith('[DECRYPTION_ERROR') 
                                ? <span className="text-terminal-alert">{log.decryptedContent}</span>
                                : <span className="text-terminal-text">{log.decryptedContent}</span>
                             }
                         </div>
                         {/* Raw Data Hover Peek (For developers to see proof of encryption) */}
                         <div className="hidden group-hover:block mt-2 text-[10px] text-gray-700 bg-gray-900 p-2 rounded border border-gray-800 font-mono break-all">
                             СЫРОЙ_ШИФР: {log.content_encrypted.substring(0, 50)}...
                         </div>
                     </div>
                 </div>
             </div>
         ))}
         <div ref={bottomRef} />
      </main>

      {/* Input Area */}
      <footer className="p-4 border-t border-terminal-dim bg-[#020202]">
        <div className="flex items-center gap-2 mb-2 text-[10px] text-terminal-dim">
            <span>СТАТУС: {status}</span>
        </div>
        <form onSubmit={handleSend} className="flex gap-4">
            <div className="relative flex-1">
                <span className="absolute left-3 top-3 text-terminal-text">></span>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="w-full bg-[#080808] border border-terminal-dim text-terminal-text p-3 pl-8 focus:outline-none focus:border-terminal-accent focus:ring-1 focus:ring-terminal-accent font-mono placeholder-gray-700"
                    placeholder="Введите команду или запись лога..."
                    autoFocus
                />
            </div>
            <button 
                type="submit" 
                disabled={sending || !input}
                className="px-6 bg-terminal-text text-black font-bold hover:bg-terminal-dim disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <Send className="w-5 h-5" />
            </button>
        </form>
      </footer>
    </div>
  );
};