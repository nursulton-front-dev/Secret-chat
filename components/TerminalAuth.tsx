import React, { useState, useEffect, useRef } from 'react';
import { Lock, ShieldAlert, ChevronRight } from 'lucide-react';

interface TerminalAuthProps {
  onUnlock: (pin: string) => Promise<boolean>;
  onBack: () => void;
}

export const TerminalAuth: React.FC<TerminalAuthProps> = ({ onUnlock, onBack }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate processing delay for dramatic effect
    await new Promise(r => setTimeout(r, 600));

    const success = await onUnlock(pin);
    if (!success) {
      setError('ДОСТУП ЗАПРЕЩЕН: ОШИБКА ГЕНЕРАЦИИ КЛЮЧА');
      setPin('');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black font-mono text-terminal-text flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Matrix/Scanline Effects */}
      <div className="absolute inset-0 pointer-events-none opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      <div className="absolute inset-0 pointer-events-none animate-scanline bg-gradient-to-b from-transparent via-terminal-text/5 to-transparent h-4"></div>

      <div className="w-full max-w-md border border-terminal-dim p-8 bg-black/90 relative z-10 shadow-[0_0_30px_rgba(0,143,17,0.1)]">
        <div className="flex items-center gap-4 mb-8 text-terminal-alert animate-pulse">
            <ShieldAlert className="w-8 h-8" />
            <h2 className="text-xl font-bold tracking-widest">ЗАЩИЩЕННЫЙ ШЛЮЗ</h2>
        </div>

        <div className="mb-6 space-y-2 text-sm text-terminal-dim">
            <p>> ОБНАРУЖЕНО: ПОПЫТКА НЕСАНКЦИОНИРОВАННОГО ДОСТУПА</p>
            <p>> ПРОТОКОЛ: ШИФРОВАНИЕ С НУЛЕВЫМ РАЗГЛАШЕНИЕМ</p>
            <p>> ОЖИДАНИЕ КЛЮЧА СЕССИИ...</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-terminal-dim" />
                </div>
                <input
                    ref={inputRef}
                    type="password"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="block w-full pl-10 pr-10 py-3 bg-[#050505] border border-terminal-dim text-terminal-text placeholder-terminal-dim/30 focus:outline-none focus:border-terminal-text focus:ring-1 focus:ring-terminal-text sm:text-sm tracking-[0.5em] text-center"
                    placeholder="ВВЕДИТЕ PIN"
                    autoComplete="off"
                />
            </div>

            {error && (
                <div className="text-terminal-alert text-xs font-bold border border-terminal-alert/50 p-2 bg-terminal-alert/10 text-center">
                    {error}
                </div>
            )}

            <div className="flex justify-between items-center mt-8">
                <button
                    type="button"
                    onClick={onBack}
                    className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
                >
                    {'< ОТМЕНА'}
                </button>

                <button
                    type="submit"
                    disabled={loading || !pin}
                    className={`
                        flex items-center gap-2 px-6 py-2 bg-terminal-dim/10 border border-terminal-dim text-terminal-text hover:bg-terminal-dim/20 transition-all
                        ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                >
                    {loading ? 'РАСШИФРОВКА...' : 'АВТОРИЗАЦИЯ'}
                    {!loading && <ChevronRight className="w-4 h-4" />}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};