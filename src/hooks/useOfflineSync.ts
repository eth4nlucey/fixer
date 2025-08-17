import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface PendingReport {
  id: string;
  type: 'danger' | 'safe' | 'checkpoint';
  severity: 'high' | 'medium';
  location: string;
  anonymous: boolean;
  device_id: string;
  timestamp: number;
}

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingReports, setPendingReports] = useState<PendingReport[]>([]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load pending reports from localStorage
    const stored = localStorage.getItem('pendingReports');
    if (stored) {
      setPendingReports(JSON.parse(stored));
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (isOnline && pendingReports.length > 0) {
      syncPendingReports();
    }
  }, [isOnline, pendingReports]);

  const addPendingReport = (report: Omit<PendingReport, 'id' | 'timestamp'>) => {
    const newReport: PendingReport = {
      ...report,
      id: `pending_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    const updated = [...pendingReports, newReport];
    setPendingReports(updated);
    localStorage.setItem('pendingReports', JSON.stringify(updated));
  };

  const syncPendingReports = async () => {
    const reportsToSync = [...pendingReports];
    
    for (const report of reportsToSync) {
      try {
        const { error } = await supabase.from('reports').insert({
          type: report.type,
          severity: report.severity,
          location: report.location,
          anonymous: report.anonymous,
        });

        if (!error) {
          const remaining = pendingReports.filter(p => p.id !== report.id);
          setPendingReports(remaining);
          localStorage.setItem('pendingReports', JSON.stringify(remaining));
        }
      } catch (error) {
        console.error('Failed to sync report:', error);
      }
    }
  };

  return {
    isOnline,
    pendingReports,
    addPendingReport,
    syncPendingReports,
  };
}