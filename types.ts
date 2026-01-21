export interface AmbientSound {
  id: string;
  name: string;
  icon: string;
  category: 'nature' | 'mechanical' | 'drone';
  description: string;
}

export interface SecureLogEntry {
  id: string;
  user_id: string;
  content_encrypted: string; // Base64
  iv: string; // Base64
  created_at: string;
  decryptedContent?: string; // Client-side only
}

export enum AppMode {
  PUBLIC = 'PUBLIC',
  GLITCHING = 'GLITCHING',
  AUTH_LOCKED = 'AUTH_LOCKED',
  SECURE_TERMINAL = 'SECURE_TERMINAL'
}

export interface SecurityContextType {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  encryptionKey: CryptoKey | null;
  deriveAndStoreKey: (pin: string) => Promise<boolean>;
  lockTerminal: () => void;
}
