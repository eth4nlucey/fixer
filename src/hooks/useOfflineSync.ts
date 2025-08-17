import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface QueuedReport {
  id: string;
  type: string;
  location: string;
  timestamp: string;
  anonymous: boolean;
  device_id: string;
  priority: 'high' | 'medium' | 'low';
  retryCount: number;
}

interface QueuedVerification {
  id: string;
  report_id: string;
  device_id: string;
  is_accurate: boolean;
  timestamp: string;
  retryCount: number;
}

interface CachedShelter {
  id: string;
  name: string;
  location: [number, number];
  type: string;
  status: string;
  details: any;
  cachedAt: string;
}

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');
  const [queuedReports, setQueuedReports] = useState<QueuedReport[]>([]);
  const [queuedVerifications, setQueuedVerifications] = useState<QueuedVerification[]>([]);
  const [cachedShelters, setCachedShelters] = useState<CachedShelter[]>([]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Wait a moment for connection to stabilize
      setTimeout(() => {
        syncQueuedData();
      }, 1000);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load all cached data on mount
    loadCachedData();

    // Sync when component mounts if online
    if (navigator.onLine) {
      syncQueuedData();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadCachedData = () => {
    try {
      // Load queued reports
      const storedReports = localStorage.getItem('queuedReports');
      if (storedReports) {
        setQueuedReports(JSON.parse(storedReports));
      }

      // Load queued verifications
      const storedVerifications = localStorage.getItem('queuedVerifications');
      if (storedVerifications) {
        setQueuedVerifications(JSON.parse(storedVerifications));
      }

      // Load cached shelters
      const storedShelters = localStorage.getItem('cachedShelters');
      if (storedShelters) {
        const shelters = JSON.parse(storedShelters);
        // Remove expired cached data (older than 24 hours)
        const validShelters = shelters.filter((shelter: CachedShelter) => {
          const cacheAge = Date.now() - new Date(shelter.cachedAt).getTime();
          return cacheAge < 24 * 60 * 60 * 1000; // 24 hours
        });
        setCachedShelters(validShelters);
        localStorage.setItem('cachedShelters', JSON.stringify(validShelters));
      }
    } catch (error) {
      console.error('Error loading cached data:', error);
    }
  };

  const syncQueuedData = async () => {
    if (!isOnline) return;

    setSyncStatus('syncing');
    
    try {
      let hasErrors = false;

      // Sync reports with priority queue (high priority first)
      const sortedReports = [...queuedReports].sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });

      const successfulReports: string[] = [];
      
      for (const report of sortedReports) {
        try {
          const { error } = await supabase.from('reports').insert({
            type: report.type,
            location: report.location,
            anonymous: report.anonymous,
          });

          if (!error) {
            successfulReports.push(report.id);
          } else {
            hasErrors = true;
            // Increment retry count
            report.retryCount = (report.retryCount || 0) + 1;
            
            // Remove if too many retries
            if (report.retryCount > 5) {
              successfulReports.push(report.id); // Remove failed report
            }
          }
        } catch (error) {
          hasErrors = true;
          console.error('Error syncing report:', error);
        }
      }

      // Sync verifications
      const successfulVerifications: string[] = [];
      
      for (const verification of queuedVerifications) {
        try {
          const { error } = await supabase.from('verifications').insert({
            report_id: verification.report_id,
            device_id: verification.device_id,
            is_accurate: verification.is_accurate,
          });

          if (!error) {
            successfulVerifications.push(verification.id);
          } else {
            hasErrors = true;
            verification.retryCount = (verification.retryCount || 0) + 1;
            
            if (verification.retryCount > 3) {
              successfulVerifications.push(verification.id);
            }
          }
        } catch (error) {
          hasErrors = true;
          console.error('Error syncing verification:', error);
        }
      }

      // Remove successfully synced items
      const remainingReports = queuedReports.filter(
        report => !successfulReports.includes(report.id)
      );
      const remainingVerifications = queuedVerifications.filter(
        verification => !successfulVerifications.includes(verification.id)
      );

      setQueuedReports(remainingReports);
      setQueuedVerifications(remainingVerifications);
      
      localStorage.setItem('queuedReports', JSON.stringify(remainingReports));
      localStorage.setItem('queuedVerifications', JSON.stringify(remainingVerifications));
      
      // Update fresh shelter data when online
      await refreshShelterCache();
      
      setSyncStatus(hasErrors ? 'error' : 'idle');
    } catch (error) {
      console.error('Sync error:', error);
      setSyncStatus('error');
    }
  };

  const refreshShelterCache = async () => {
    try {
      const { data: shelters, error } = await supabase
        .from('resources')
        .select('*')
        .eq('type', 'shelter')
        .eq('status', 'operational');

      if (!error && shelters) {
        const cacheShelters: CachedShelter[] = shelters.map(shelter => ({
          id: shelter.id,
          name: shelter.name,
          location: [shelter.longitude, shelter.latitude],
          type: shelter.type,
          status: shelter.status,
          details: shelter.details,
          cachedAt: new Date().toISOString()
        }));

        setCachedShelters(cacheShelters);
        localStorage.setItem('cachedShelters', JSON.stringify(cacheShelters));
      }
    } catch (error) {
      console.error('Error refreshing shelter cache:', error);
    }
  };

  const queueReport = (report: Omit<QueuedReport, 'id' | 'retryCount'>) => {
    const queuedReport: QueuedReport = {
      ...report,
      id: `queued_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      retryCount: 0
    };

    const updatedReports = [...queuedReports, queuedReport];
    setQueuedReports(updatedReports);
    localStorage.setItem('queuedReports', JSON.stringify(updatedReports));
  };

  const queueVerification = (verification: Omit<QueuedVerification, 'id' | 'retryCount'>) => {
    const queuedVerification: QueuedVerification = {
      ...verification,
      id: `queued_ver_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      retryCount: 0
    };

    const updatedVerifications = [...queuedVerifications, queuedVerification];
    setQueuedVerifications(updatedVerifications);
    localStorage.setItem('queuedVerifications', JSON.stringify(updatedVerifications));
  };

  const getCachedShelters = (location?: [number, number], radius?: number) => {
    if (!location || !radius) return cachedShelters;

    // Filter shelters within radius
    return cachedShelters.filter(shelter => {
      const distance = calculateDistance(location, shelter.location);
      return distance <= radius;
    });
  };

  const calculateDistance = (point1: [number, number], point2: [number, number]): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = point1[1] * Math.PI/180;
    const φ2 = point2[1] * Math.PI/180;
    const Δφ = (point2[1]-point1[1]) * Math.PI/180;
    const Δλ = (point2[0]-point1[0]) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  };

  return {
    isOnline,
    syncStatus,
    queuedReportsCount: queuedReports.length,
    queuedVerificationsCount: queuedVerifications.length,
    cachedSheltersCount: cachedShelters.length,
    syncQueuedData,
    queueReport,
    queueVerification,
    getCachedShelters,
    refreshShelterCache
  };
}