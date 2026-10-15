import { vi } from './vi';
import { en } from './en';
import type { LocaleDictionary } from './types';

export type Language = 'vi' | 'en';

export const locales: Record<Language, LocaleDictionary> = {
  vi,
  en,
};

export const defaultLanguage: Language = 'vi';

export * from './types';
