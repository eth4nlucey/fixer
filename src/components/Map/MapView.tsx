import React, { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN!;

interface MapViewProps {
  reports: any[];
  userLocation: [number, number] | null;
  onBoundsChange: (bounds: any) => void;
  onReportSelect: (report: any) => void;
}

export default function MapView({ reports, userLocation, onBoundsChange, onReportSelect }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: userLocation || [0, 0],
      zoom: 14,
      pitch: 0,
    });

    map.current.on('moveend', () => {
      if (map.current) {
        const bounds = map.current.getBounds();
        if (bounds) {
          onBoundsChange({
            north: bounds.getNorth(),
            south: bounds.getSouth(),
            east: bounds.getEast(),
            west: bounds.getWest(),
          });
        }
      }
    });

    return () => {
      map.current?.remove();
    };
  }, []);

  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Add report markers
    reports.forEach(report => {
      const el = document.createElement('div');
      el.className = `w-6 h-6 rounded-full cursor-pointer ${
        report.type === 'danger' ? 'bg-red-500' : 
        report.type === 'safe' ? 'bg-green-500' : 
        'bg-yellow-500'
      }`;
      
      const marker = new mapboxgl.Marker(el)
        .setLngLat([report.longitude, report.latitude])
        .addTo(map.current!);
      
      el.addEventListener('click', () => onReportSelect(report));
      markers.current.push(marker);
    });
  }, [reports]);

  return <div ref={mapContainer} className="w-full h-full" />;
}