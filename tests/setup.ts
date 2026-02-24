import { TextEncoder, TextDecoder } from 'util';
// Polyfill TextEncoder/TextDecoder for react-router-dom v7 in jsdom
(global as unknown as Record<string, unknown>).TextEncoder = TextEncoder;
(global as unknown as Record<string, unknown>).TextDecoder = TextDecoder;
