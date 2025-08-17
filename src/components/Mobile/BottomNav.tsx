import React from 'react';
import { useTranslation } from 'react-i18next';

interface BottomNavProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export default function BottomNav({ activeView, onViewChange }: BottomNavProps) {
  const { t } = useTranslation();

  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-[375px] bg-gray-900/90 backdrop-blur-sm border-t border-gray-700 z-50">
      <div className="flex justify-around py-2">
        <button
          onClick={() => onViewChange('map')}
          className={`touch-target flex flex-col items-center p-2 transition-colors ${
            activeView === 'map' ? 'text-blue-400' : 'text-gray-400'
          }`}
        >
          <span className="text-2xl">🗺️</span>
          <span className="text-xs mt-1">{t('navigation.map')}</span>
        </button>
        
        <button
          onClick={() => onViewChange('shelters')}
          className={`touch-target flex flex-col items-center p-2 transition-colors ${
            activeView === 'shelters' ? 'text-blue-400' : 'text-gray-400'
          }`}
        >
          <span className="text-2xl">🏠</span>
          <span className="text-xs mt-1">{t('navigation.shelters')}</span>
        </button>
        
        <button
          onClick={() => onViewChange('alerts')}
          className={`touch-target flex flex-col items-center p-2 transition-colors ${
            activeView === 'alerts' ? 'text-blue-400' : 'text-gray-400'
          }`}
        >
          <span className="text-2xl">🚨</span>
          <span className="text-xs mt-1">{t('navigation.alerts')}</span>
        </button>
        
        <button
          onClick={() => onViewChange('resources')}
          className={`touch-target flex flex-col items-center p-2 transition-colors ${
            activeView === 'resources' ? 'text-blue-400' : 'text-gray-400'
          }`}
        >
          <span className="text-2xl">🏥</span>
          <span className="text-xs mt-1">{t('navigation.resources')}</span>
        </button>
      </div>
    </div>
  );
}