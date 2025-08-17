import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../store';

export default function AlertBanner() {
  const { t } = useTranslation();
  const { activeAlert, setActiveAlert } = useAppStore();

  useEffect(() => {
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (activeAlert && activeAlert.type === 'air_raid') {
      // Show browser notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(t('alerts.air_raid'), {
          body: t('alerts.active'),
          icon: '/favicon.ico',
          tag: 'air-raid-alert',
        });
      }

      // Vibrate if supported
      if ('vibrate' in navigator) {
        navigator.vibrate([500, 200, 500, 200, 500]);
      }
    }
  }, [activeAlert, t]);

  if (!activeAlert) return null;

  const isAirRaid = activeAlert.type === 'air_raid';

  return (
    <div 
      className={`fixed top-0 left-0 right-0 z-40 px-4 py-3 text-center font-bold ${
        isAirRaid 
          ? 'bg-danger text-white animate-pulse' 
          : 'bg-success text-white'
      }`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-center justify-between max-w-sm mx-auto">
        <div className="flex items-center space-x-2">
          <span className="text-xl">
            {isAirRaid ? '🚨' : '✅'}
          </span>
          <span className="text-sm lg:text-base">
            {isAirRaid ? t('alerts.air_raid') : t('alerts.all_clear')}
          </span>
        </div>
        
        <button
          onClick={() => setActiveAlert(null)}
          className="touch-target p-1 text-white hover:bg-black/20 rounded"
          aria-label={t('common.close')}
        >
          ×
        </button>
      </div>
      
      {isAirRaid && (
        <div className="text-xs mt-1 opacity-90">
          {t('shelters.find_nearest')}
        </div>
      )}
    </div>
  );
}