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
    <div className="bg-gray-800/50 rounded-lg p-1 backdrop-blur-sm">
      <div className="flex space-x-1">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code as 'uk' | 'en' | 'ru')}
            className={`px-2 py-1 text-sm font-medium rounded transition-colors ${
              language === lang.code
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
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