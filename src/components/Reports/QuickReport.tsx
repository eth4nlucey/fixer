import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase, getDeviceId } from '../../lib/supabase';
import { useAppStore } from '../../store';
import { ButtonSpinner } from '../common/LoadingSpinner';

interface QuickReportProps {
  location: [number, number] | null;
}

export default function QuickReport({ location }: QuickReportProps) {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { offlineMode } = useAppStore();

  const submitReport = async (type: 'shelter_open' | 'resource' | 'all_clear') => {
    if (!location) {
      alert(t('common.error') + ': Location not available');
      return;
    }

    setIsSubmitting(true);
    
    if (offlineMode) {
      // Queue for offline sync
      const report = {
        type,
        location: `POINT(${location[1]} ${location[0]})`,
        timestamp: new Date().toISOString(),
        anonymous: true,
        device_id: getDeviceId(),
      };
      
      // Save to localStorage for offline sync
      const queuedReports = JSON.parse(localStorage.getItem('queuedReports') || '[]');
      queuedReports.push(report);
      localStorage.setItem('queuedReports', JSON.stringify(queuedReports));
      
      setIsSubmitting(false);
      navigator.vibrate?.(200);
      return;
    }

    try {
      const { error } = await supabase.from('reports').insert({
        type,
        location: `POINT(${location[1]} ${location[0]})`,
        anonymous: true,
      });

      if (!error) {
        navigator.vibrate?.(200);
      } else {
        alert(t('common.error'));
      }
    } catch (error) {
      alert(t('common.error'));
    }

    setIsSubmitting(false);
  };

  return (
    <div className="fixed bottom-20 right-4 flex flex-col gap-3 z-40">
      {/* Air Raid Alert */}
      <button
        onClick={() => submitReport('shelter_open')}
        disabled={isSubmitting}
        className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 shadow-lg flex items-center justify-center active:scale-95 transition-all disabled:opacity-50"
        aria-label={t('alerts.air_raid')}
        title={t('alerts.air_raid')}
      >
        {isSubmitting ? <ButtonSpinner /> : <span className="text-white text-2xl">⚠️</span>}
      </button>
      
      {/* All Clear */}
      <button
        onClick={() => submitReport('all_clear')}
        disabled={isSubmitting}
        className="w-14 h-14 rounded-full bg-green-600 hover:bg-green-700 shadow-lg flex items-center justify-center active:scale-95 transition-all disabled:opacity-50"
        aria-label={t('alerts.all_clear')}
        title={t('alerts.all_clear')}
      >
        {isSubmitting ? <ButtonSpinner /> : <span className="text-white text-2xl">✅</span>}
      </button>
      
      {/* Shelter Open */}
      <button
        onClick={() => submitReport('resource')}
        disabled={isSubmitting}
        className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg flex items-center justify-center active:scale-95 transition-all disabled:opacity-50"
        aria-label={t('reports.shelter_open')}
        title={t('reports.shelter_open')}
      >
        {isSubmitting ? <ButtonSpinner /> : <span className="text-white text-2xl">🛡️</span>}
      </button>

      {/* Offline indicator */}
      {offlineMode && (
        <div className="text-xs text-yellow-400 text-center bg-black/50 rounded px-2 py-1 backdrop-blur-sm">
          {t('emergency.offline_mode')}
        </div>
      )}
    </div>
  );
}