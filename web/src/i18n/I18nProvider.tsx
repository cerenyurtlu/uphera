import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { translations, SupportedLanguage } from './translations';

type I18nContextValue = {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>('tr');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('uphera_settings');
      if (saved) {
        const s = JSON.parse(saved);
        if (s.language === 'en' || s.language === 'tr') {
          setLanguageState(s.language);
          document.documentElement.setAttribute('lang', s.language);
        }
      } else {
        document.documentElement.setAttribute('lang', 'tr');
      }
    } catch {}
  }, []);

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    document.documentElement.setAttribute('lang', lang);
    try {
      const saved = localStorage.getItem('uphera_settings');
      const s = saved ? JSON.parse(saved) : {};
      localStorage.setItem('uphera_settings', JSON.stringify({ ...s, language: lang }));
    } catch {}
  };

  const t = useMemo(() => {
    return (key: string, params?: Record<string, string | number>) => {
      const dict = translations[language] || (translations as any).tr;
      const raw = (dict as any)[key] ?? (translations as any).tr[key] ?? key;
      if (!params) return raw;
      return Object.keys(params).reduce((acc, k) => acc.replace(new RegExp(`\\{${k}\\}`, 'g'), String(params[k])), raw);
    };
  }, [language]);

  const value = useMemo(() => ({ language, setLanguage, t }), [language, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
};


