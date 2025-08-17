import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export function useRealtimeReports(bounds: MapBounds | null) {
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    if (!bounds) return;

    const fetchReports = async () => {
      const { data, error } = await supabase.rpc('get_reports_in_bounds', {
        lat_min: bounds.south,
        lat_max: bounds.north,
        lng_min: bounds.west,
        lng_max: bounds.east,
      });

      if (data) {
        setReports(data);
      }
    };

    fetchReports();

    // Subscribe to new reports
    const channel = supabase
      .channel('reports-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'reports',
        },
        (payload) => {
          // Check if new report is within bounds
          const lng = parseFloat(payload.new.location.match(/POINT\(([-\d.]+)/)[1]);
          const lat = parseFloat(payload.new.location.match(/POINT\([-\d.]+ ([-\d.]+)/)[1]);
          
          if (
            lng >= bounds.west &&
            lng <= bounds.east &&
            lat >= bounds.south &&
            lat <= bounds.north
          ) {
            setReports(prev => [...prev, { ...payload.new, longitude: lng, latitude: lat }]);
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [bounds]);

  return reports;
}