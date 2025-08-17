import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase, getDeviceId } from '../../lib/supabase';
import { useAppStore } from '../../store';

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
    <div className="fixed bottom-24 right-4 space-y-3 z-10">
      {/* Shelter Open Report */}
      <button
        onClick={() => submitReport('shelter_open')}
        disabled={isSubmitting}
        className="touch-target w-14 h-14 bg-shelter rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform"
        aria-label={t('reports.shelter_open')}
      >
        <span className="text-2xl">🏠</span>
      </button>
      
      {/* Resource Available */}
      <button
        onClick={() => submitReport('resource')}
        disabled={isSubmitting}
        className="touch-target w-14 h-14 bg-success rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform"
        aria-label={t('reports.resource_available')}
      >
        <span className="text-2xl">✅</span>
      </button>
      
      {/* All Clear */}
      <button
        onClick={() => submitReport('all_clear')}
        disabled={isSubmitting}
        className="touch-target w-14 h-14 bg-secondary rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform"
        aria-label={t('alerts.all_clear')}
      >
        <span className="text-2xl">☮️</span>
      </button>

      {/* Offline indicator */}
      {offlineMode && (
        <div className="text-xs text-text-secondary text-center bg-surface rounded px-2 py-1">
          {t('emergency.offline_mode')}
        </div>
      )}
    </div>
  );
}