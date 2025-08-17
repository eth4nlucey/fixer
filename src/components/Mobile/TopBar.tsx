import React from 'react';
import { useTranslation } from 'react-i18next';
import LanguageToggle from './LanguageToggle';

export default function TopBar() {
  const { t } = useTranslation();

  return (
    <div className="fixed top-0 left-1/2 transform -translate-x-1/2 w-full max-w-[375px] h-16 bg-gray-900/90 backdrop-blur-sm border-b border-gray-700 z-50">
      <div className="flex items-center justify-between h-full px-4">
        <div className="flex items-center space-x-2">
          <div className="text-2xl">🛡️</div>
          <div>
            <h1 className="text-lg font-bold text-white">ФІКСЕР</h1>
            <p className="text-xs text-gray-400">{t('app.title')}</p>
          </div>
        </div>
        
        <LanguageToggle />
      </div>
    </div>
  );
}