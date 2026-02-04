import en from './en.ts';
import he from './he.ts';
import type { TranslationDictionary } from '../types/index';

const translations: Record<'en' | 'he', TranslationDictionary> = {
  en,
  he,
};

export default translations;
