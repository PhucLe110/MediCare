import React from 'react';
import { Sun, Moon, Globe } from 'lucide-react';

/**
 * Nút đổi ngôn ngữ + sáng/tối — dùng trên Login, Register, AuthModal
 */
export default function LangThemeControls({ lang, setLang, theme, setTheme, className = '' }) {
  const setLanguage = (l) => {
    localStorage.setItem('lang', l);
    setLang(l);
    window.dispatchEvent(new Event('language-change'));
  };

  const setThemeMode = (t) => {
    localStorage.setItem('theme', t);
    setTheme(t);
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-0.5 p-0.5 bg-gray-100 rounded-lg border border-gray-200">
        <button
          type="button"
          onClick={() => setLanguage('vi')}
          className={`px-2 py-1 text-[10px] font-black rounded-md transition-all ${lang === 'vi' ? 'bg-white text-primary shadow-sm' : 'text-gray-500'}`}
        >
          VI
        </button>
        <button
          type="button"
          onClick={() => setLanguage('en')}
          className={`px-2 py-1 text-[10px] font-black rounded-md transition-all ${lang === 'en' ? 'bg-white text-primary shadow-sm' : 'text-gray-500'}`}
        >
          EN
        </button>
      </div>
      <div className="flex items-center gap-0.5 p-0.5 bg-gray-100 rounded-lg border border-gray-200">
        <button
          type="button"
          onClick={() => setThemeMode('light')}
          className={`w-7 h-7 rounded-md flex items-center justify-center transition-all ${theme === 'light' ? 'bg-white text-amber-500 shadow-sm' : 'text-gray-400'}`}
          title="Light"
        >
          <Sun size={14} />
        </button>
        <button
          type="button"
          onClick={() => setThemeMode('dark')}
          className={`w-7 h-7 rounded-md flex items-center justify-center transition-all ${theme === 'dark' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400'}`}
          title="Dark"
        >
          <Moon size={14} />
        </button>
      </div>
      <Globe size={14} className="text-gray-400 hidden sm:block" />
    </div>
  );
}
