'use client';

import React, { createContext, useContext, useEffect, useMemo, useCallback, useSyncExternalStore } from 'react';
import { locales, defaultLanguage, type Language, type LocaleDictionary } from '@/locales';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: LocaleDictionary;
  formatCurrency: (amount: number) => string;
  formatDateDisplay: (dateStr: string | null | undefined) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'planora_language';

function subscribe(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', callback);
  window.addEventListener('planora-language-change', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('planora-language-change', callback);
  };
}

function getSnapshot(): Language {
  if (typeof window === 'undefined') return defaultLanguage;
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as Language;
    if (saved === 'vi' || saved === 'en') return saved;
  } catch {
    // Ignore localStorage read errors in SSR/sandboxed mode
  }
  return defaultLanguage;
}

function getServerSnapshot(): Language {
  return defaultLanguage;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const language = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Sync document lang attribute
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  const setLanguage = useCallback((newLang: Language) => {
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
      window.dispatchEvent(new Event('planora-language-change'));
      if (typeof document !== 'undefined') {
        document.documentElement.lang = newLang;
      }
    } catch {
      // Ignore write errors
    }
  }, []);

  const t = useMemo(() => locales[language] || locales[defaultLanguage], [language]);

  const formatCurrency = useCallback((amount: number): string => {
    if (language === 'vi') {
      return `${(amount || 0).toLocaleString('vi-VN')} ₫`;
    }
    // In English, format VND or USD depending on scale
    if (amount >= 100000) {
      return `${(amount || 0).toLocaleString('en-US')} VND`;
    }
    return `$${(amount || 0).toLocaleString('en-US')}`;
  }, [language]);

  const formatDateDisplay = useCallback((dateStr: string | null | undefined): string => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return String(dateStr);
      if (language === 'vi') {
        return date.toLocaleDateString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });
      }
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return String(dateStr);
    }
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
      formatCurrency,
      formatDateDisplay,
    }),
    [language, setLanguage, t, formatCurrency, formatDateDisplay]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
