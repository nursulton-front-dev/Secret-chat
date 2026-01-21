import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, CloudRain, Keyboard, Server, Coffee, Waves, Radio, Search, Terminal } from 'lucide-react';
import { AMBIENT_SOUNDS, MAGIC_TRIGGER_HASH } from '../constants';
import { computeHash } from '../utils/crypto';

// Map icon strings to components
const IconMap: Record<string, React.FC<any>> = {
  CloudRain, Keyboard, Server, Coffee, Waves, Radio
};

const CategoryMap: Record<string, string> = {
  nature: 'ПРИРОДА',
  mechanical: 'МЕХАНИКА',
  drone: 'ФОН'
};

interface SoundBoardProps {
  onTrigger: () => void;
}

export const SoundBoard: React.FC<SoundBoardProps> = ({ onTrigger }) => {
  const [activeSound, setActiveSound] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isGlitching, setIsGlitching] = useState(false);
  const triggerLocked = useRef(false); // Prevents double-firing

  // Logic to check the hash and trigger the event
  const attemptUnlock = async (term: string) => {
      if (triggerLocked.current) return;
      
      const normalizedTerm = term.trim().toLowerCase();
      if (!normalizedTerm) return;

      try {
          const hash = await computeHash(normalizedTerm);
          if (hash === MAGIC_TRIGGER_HASH) {
              triggerLocked.current = true;
              setIsGlitching(true);
              setTimeout(() => {
                  onTrigger();
              }, 1500);
          }
      } catch (e) {
          console.error("Hash check failed", e);
      }
  };

  // Auto-check with delay (existing behavior)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
        attemptUnlock(searchTerm);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
          attemptUnlock(searchTerm);
      }
  };

  const filteredSounds = AMBIENT_SOUNDS.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`min-h-screen bg-[#0a0a0a] text-gray-300 font-mono p-8 transition-all duration-200 ${isGlitching ? 'animate-glitch filter hue-rotate-90' : ''}`}>
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header - Added onClick for manual trigger */}
        <div 
            className="flex items-center justify-between border-b border-gray-800 pb-4 cursor-pointer select-none hover:opacity-80 transition-opacity"
            onClick={() => attemptUnlock(searchTerm)}
            title="DevWaves v2.4.0"
        >
            <div>
                <h1 className="text-3xl font-bold text-terminal-accent tracking-tighter flex items-center gap-2">
                    <Terminal className="w-8 h-8" />
                    DevWaves
                </h1>
                <p className="text-sm text-gray-500 mt-1">Аудио-окружение v2.4.0</p>
            </div>
            <div className="text-xs text-gray-600">
                СТАТУС: <span className="text-green-500">ОНЛАЙН</span>
            </div>
        </div>

        {/* Search - Added onKeyDown */}
        <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-500 group-focus-within:text-terminal-accent" />
            </div>
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                className="block w-full pl-10 pr-3 py-3 border border-gray-800 rounded-md leading-5 bg-[#111] placeholder-gray-600 focus:outline-none focus:bg-[#050505] focus:border-terminal-accent focus:ring-1 focus:ring-terminal-accent sm:text-sm transition-colors"
                placeholder="Фильтр звуков..."
                spellCheck={false}
                autoComplete="off"
            />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSounds.map((sound) => {
                const Icon = IconMap[sound.icon] || Radio;
                const isActive = activeSound === sound.id;

                return (
                    <div 
                        key={sound.id}
                        onClick={() => setActiveSound(isActive ? null : sound.id)}
                        className={`
                            relative overflow-hidden p-6 rounded-lg border cursor-pointer transition-all duration-300 group
                            ${isActive 
                                ? 'border-terminal-accent bg-[#0f1a1a] shadow-[0_0_15px_rgba(0,219,255,0.15)]' 
                                : 'border-gray-800 bg-[#0e0e0e] hover:border-gray-600'
                            }
                        `}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-md ${isActive ? 'bg-terminal-accent/10 text-terminal-accent' : 'bg-gray-800/50 text-gray-400'}`}>
                                <Icon className="w-6 h-6" />
                            </div>
                            {isActive && (
                                <div className="animate-pulse">
                                    <div className="h-2 w-2 rounded-full bg-terminal-accent"></div>
                                </div>
                            )}
                        </div>
                        <h3 className={`text-lg font-medium mb-1 ${isActive ? 'text-terminal-accent' : 'text-gray-200'}`}>
                            {sound.name}
                        </h3>
                        <p className="text-xs text-gray-500 mb-4 h-10">
                            {sound.description}
                        </p>
                        
                        <div className="flex items-center justify-between mt-auto">
                           <span className="text-[10px] uppercase tracking-wider text-gray-600 border border-gray-800 px-2 py-1 rounded">
                             {CategoryMap[sound.category] || sound.category}
                           </span>
                           {isActive ? <Pause className="w-5 h-5 text-terminal-accent" /> : <Play className="w-5 h-5 text-gray-600 group-hover:text-gray-400" />}
                        </div>
                    </div>
                );
            })}
        </div>
      </div>
    </div>
  );
};