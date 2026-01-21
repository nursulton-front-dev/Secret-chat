import { STATIC_APP_SALT } from '../constants';

// Convert string to ArrayBuffer
const str2ab = (str: string): Uint8Array => new TextEncoder().encode(str);

// Convert ArrayBuffer to string
const ab2str = (buf: ArrayBuffer): string => new TextDecoder().decode(buf);

// Convert ArrayBuffer to Base64
const ab2base64 = (buf: ArrayBuffer): string => {
  let binary = '';
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};

// Convert Base64 to Uint8Array
const base642ab = (base64: string): Uint8Array => {
  const binary_string = window.atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes;
};

// 1. Compute SHA-256 Hash (for Trigger Check)
export const computeHash = async (message: string): Promise<string> => {
  const msgBuffer = str2ab(message);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

// 2. Derive Key from PIN (PBKDF2)
export const deriveKeyFromPin = async (pin: string): Promise<CryptoKey> => {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(pin),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: enc.encode(STATIC_APP_SALT),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false, // extractable
    ["encrypt", "decrypt"]
  );
};

// 3. Encrypt Message (AES-GCM)
export const encryptMessage = async (key: CryptoKey, text: string): Promise<{ ciphertext: string; iv: string }> => {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encoded = str2ab(text);

  const encrypted = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    encoded
  );

  return {
    ciphertext: ab2base64(encrypted),
    iv: ab2base64(iv.buffer),
  };
};

// 4. Decrypt Message (AES-GCM)
export const decryptMessage = async (key: CryptoKey, ciphertextB64: string, ivB64: string): Promise<string> => {
  const ciphertext = base642ab(ciphertextB64);
  const iv = base642ab(ivB64);

  try {
    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      key,
      ciphertext
    );
    return ab2str(decrypted);
  } catch (e) {
    console.error("Decryption failed", e);
    return "[DECRYPTION_ERROR: Invalid Key]";
  }
};
