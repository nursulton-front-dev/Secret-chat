import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { SoundBoard } from './components/SoundBoard';
import { TerminalAuth } from './components/TerminalAuth';
import { SecureLog } from './components/SecureLog';
import { AppMode } from './types';
import { deriveKeyFromPin } from './utils/crypto';

// Note: In a larger app, this state would move to a Context Provider.
const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.PUBLIC);
  const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null);

  const handleTrigger = () => {
    setMode(AppMode.AUTH_LOCKED);
  };

  const handleUnlock = async (pin: string): Promise<boolean> => {
    try {
      // Derive the key. 
      // NOTE: In a real "login", we would also verify the PIN against a hash on the server 
      // or try to decrypt a "validation" blob. 
      // For this Zero-Knowledge architecture, valid decryption of logs IS the validation.
      // We will derive the key and assume success, letting the decryption view fail gracefully if key is wrong.
      const key = await deriveKeyFromPin(pin);
      setEncryptionKey(key);
      setMode(AppMode.SECURE_TERMINAL);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const handleLogout = () => {
    // Clear key from memory completely
    setEncryptionKey(null);
    setMode(AppMode.PUBLIC);
  };

  return (
    <div className="crt min-h-screen">
      {mode === AppMode.PUBLIC && (
        <SoundBoard onTrigger={handleTrigger} />
      )}
      
      {mode === AppMode.GLITCHING && (
          <div className="min-h-screen bg-black flex items-center justify-center">
              <h1 className="text-6xl font-mono text-red-500 animate-glitch">СИСТЕМНЫЙ СБОЙ</h1>
          </div>
      )}

      {mode === AppMode.AUTH_LOCKED && (
        <TerminalAuth 
          onUnlock={handleUnlock} 
          onBack={() => setMode(AppMode.PUBLIC)} 
        />
      )}

      {mode === AppMode.SECURE_TERMINAL && encryptionKey && (
        <SecureLog 
          encryptionKey={encryptionKey} 
          onLogout={handleLogout} 
        />
      )}
    </div>
  );
};

export default App;