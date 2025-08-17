import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../store';

export default function LanguageToggle() {
  const { i18n } = useTranslation();
  const { language, setLanguage } = useAppStore();

  const languages = [
    { code: 'uk', name: 'УК', flag: '🇺🇦' },
    { code: 'en', name: 'EN', flag: '🇬🇧' },
    { code: 'ru', name: 'РУ', flag: '🇷🇺' },
  ];

  const handleLanguageChange = (langCode: 'uk' | 'en' | 'ru') => {
    setLanguage(langCode);
    i18n.changeLanguage(langCode);
  };

  return (
    <div className="fixed top-4 right-4 z-30 bg-surface rounded-lg p-1 shadow-lg">
      <div className="flex space-x-1">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code as 'uk' | 'en' | 'ru')}
            className={`touch-target px-2 py-1 text-sm font-medium rounded transition-colors ${
              language === lang.code
                ? 'bg-primary text-white'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface'
            }`}
            aria-label={`Switch to ${lang.name}`}
          >
            <span className="mr-1">{lang.flag}</span>
            {lang.name}
          </button>
        ))}
      </div>
    </div>
  );
}