import { useState, useEffect } from 'react';

export const useTranslation = (translations) => {
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'vi');

  useEffect(() => {
    const handleStorageChange = () => {
      setLang(localStorage.getItem('lang') || 'vi');
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('language-change', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('language-change', handleStorageChange);
    };
  }, []);

  const t = translations[lang] || translations['vi'];
  return { lang, t };
};
