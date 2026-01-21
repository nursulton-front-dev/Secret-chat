import { AmbientSound } from './types';

// SHA-256 hash of the magic trigger phrase: "sudo mount /dev/chat"
// We do not store the plain text trigger in the code.
export const MAGIC_TRIGGER_HASH = "50942d9972886f6a738670b39920150d032506e76878b23f85226487d6067756";

// Salt for PBKDF2. In a production app, this should be random per user and stored in the DB.
// For this single-page demo without a robust user table, we use a static app salt.
export const STATIC_APP_SALT = "DEVWAVES_SECURE_SALT_V1"; 

export const AMBIENT_SOUNDS: AmbientSound[] = [
  {
    id: '1',
    name: 'Ливень',
    icon: 'CloudRain',
    category: 'nature',
    description: 'Непрерывный сильный дождь за окном.'
  },
  {
    id: '2',
    name: 'Механическая клавиатура',
    icon: 'Keyboard',
    category: 'mechanical',
    description: 'Успокаивающий стук переключателей Cherry MX Blue.'
  },
  {
    id: '3',
    name: 'Серверная',
    icon: 'Server',
    category: 'drone',
    description: 'Гул высокоскоростных вентиляторов дата-центра.'
  },
  {
    id: '4',
    name: 'Кофейня',
    icon: 'Coffee',
    category: 'nature',
    description: 'Отдаленные разговоры и эспрессо-машины.'
  },
  {
    id: '5',
    name: 'Океанские волны',
    icon: 'Waves',
    category: 'nature',
    description: 'Ритмичный шум прибоя на берегу.'
  },
  {
    id: '6',
    name: 'Lo-Fi Помехи',
    icon: 'Radio',
    category: 'drone',
    description: 'Треск аналогового винила и белый шум.'
  }
];