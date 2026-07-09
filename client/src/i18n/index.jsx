import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import en from './locales/en';
import hi from './locales/hi';
import es from './locales/es';
import fr from './locales/fr';
import de from './locales/de';
import ar from './locales/ar';
import zh from './locales/zh';
import pt from './locales/pt';
import ja from './locales/ja';
import it from './locales/it';
import ru from './locales/ru';
import ko from './locales/ko';
import tr from './locales/tr';
import vi from './locales/vi';

const LOCALES = { en, hi, es, fr, de, ar, zh, pt, ja, it, ru, ko, tr, vi };

export const RTL_LANGUAGES = ['ar'];

export const LANGUAGES = [
  { code: 'en', label: 'English',    native: 'English',    flag: '🇬🇧' },
  { code: 'hi', label: 'Hindi',      native: 'हिंदी',       flag: '🇮🇳' },
  { code: 'es', label: 'Spanish',    native: 'Español',    flag: '🇪🇸' },
  { code: 'fr', label: 'French',     native: 'Français',   flag: '🇫🇷' },
  { code: 'de', label: 'German',     native: 'Deutsch',    flag: '🇩🇪' },
  { code: 'ar', label: 'Arabic',     native: 'العربية',    flag: '🇸🇦' },
  { code: 'zh', label: 'Chinese',    native: '中文',        flag: '🇨🇳' },
  { code: 'pt', label: 'Portuguese', native: 'Português',  flag: '🇧🇷' },
  { code: 'ja', label: 'Japanese',   native: '日本語',      flag: '🇯🇵' },
  { code: 'it', label: 'Italian',    native: 'Italiano',   flag: '🇮🇹' },
  { code: 'ru', label: 'Russian',    native: 'Русский',    flag: '🇷🇺' },
  { code: 'ko', label: 'Korean',     native: '한국어',      flag: '🇰🇷' },
  { code: 'tr', label: 'Turkish',    native: 'Türkçe',     flag: '🇹🇷' },
  { code: 'vi', label: 'Vietnamese', native: 'Tiếng Việt', flag: '🇻🇳' },
];

const LanguageContext = createContext(null);

/** Resolve a dot-notation key in a nested object */
function resolve(obj, key) {
  return key.split('.').reduce((o, k) => (o ? o[k] : undefined), obj);
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => localStorage.getItem('language') || 'en');

  const applyDirection = useCallback((code) => {
    const dir = RTL_LANGUAGES.includes(code) ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', code);
  }, []);

  useEffect(() => { applyDirection(lang); }, [lang, applyDirection]);

  const setLang = useCallback((code) => {
    localStorage.setItem('language', code);
    setLangState(code);
  }, []);

  /** t('key.sub') – falls back to English */
  const t = useCallback((key, vars = {}) => {
    const locale = LOCALES[lang] || en;
    let str = resolve(locale, key) ?? resolve(en, key) ?? key;
    // Simple variable interpolation: {{name}}
    Object.entries(vars).forEach(([k, v]) => {
      str = str.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), v);
    });
    return str;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, languages: LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useTranslation must be used inside <LanguageProvider>');
  return ctx;
}
