import React from 'react';
import { useTranslation } from 'react-i18next';

interface BottomNavProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export default function BottomNav({ activeView, onViewChange }: BottomNavProps) {
  const { t } = useTranslation();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-gray-700 z-20">
      <div className="flex justify-around py-2">
        <button
          onClick={() => onViewChange('map')}
          className={`touch-target flex flex-col items-center p-2 ${
            activeView === 'map' ? 'text-primary' : 'text-text-secondary'
          }`}
        >
          <span className="text-2xl">🗺️</span>
          <span className="text-xs mt-1">{t('navigation.map')}</span>
        </button>
        
        <button
          onClick={() => onViewChange('shelters')}
          className={`touch-target flex flex-col items-center p-2 ${
            activeView === 'shelters' ? 'text-primary' : 'text-text-secondary'
          }`}
        >
          <span className="text-2xl">🏠</span>
          <span className="text-xs mt-1">{t('navigation.shelters')}</span>
        </button>
        
        <button
          onClick={() => onViewChange('alerts')}
          className={`touch-target flex flex-col items-center p-2 ${
            activeView === 'alerts' ? 'text-primary' : 'text-text-secondary'
          }`}
        >
          <span className="text-2xl">🚨</span>
          <span className="text-xs mt-1">{t('navigation.alerts')}</span>
        </button>
        
        <button
          onClick={() => onViewChange('resources')}
          className={`touch-target flex flex-col items-center p-2 ${
            activeView === 'resources' ? 'text-primary' : 'text-text-secondary'
          }`}
        >
          <span className="text-2xl">🏥</span>
          <span className="text-xs mt-1">{t('navigation.resources')}</span>
        </button>
      </div>
    </div>
  );
}