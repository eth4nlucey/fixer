import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapLoadingOverlay } from '../common/LoadingSpinner';
import { useTranslation } from 'react-i18next';

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;
if (MAPBOX_TOKEN) {
  mapboxgl.accessToken = MAPBOX_TOKEN;
}

interface MapViewProps {
  reports: any[];
  userLocation: [number, number] | null;
  onBoundsChange: (bounds: any) => void;
  onReportSelect: (report: any) => void;
}

export default function MapView({ reports, userLocation, onBoundsChange, onReportSelect }: MapViewProps) {
  const { t } = useTranslation();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: userLocation || [30.5234, 50.4501], // Default to Kyiv
        zoom: 12,
        pitch: 0,
      });

      map.current.on('load', () => {
        setIsLoading(false);
      });

      map.current.on('error', (e) => {
        console.error('Mapbox error:', e);
        setError('Failed to load map. Please check your internet connection.');
        setIsLoading(false);
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
    } catch (err) {
      console.error('Error initializing map:', err);
      setError('Failed to initialize map');
      setIsLoading(false);
    }
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

  // Check if token is available
  if (!MAPBOX_TOKEN) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">🗺️</div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">Map Not Available</h3>
          <p className="text-gray-600 mb-4">
            Mapbox token is missing. Please add REACT_APP_MAPBOX_TOKEN to your .env.local file.
          </p>
          <p className="text-sm text-gray-500">
            Get a free token at mapbox.com
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-red-50">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">❌</div>
          <h3 className="text-lg font-bold text-red-800 mb-2">Map Error</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full bg-gray-900">
      <div ref={mapContainer} className="w-full h-full" />
      {isLoading && <MapLoadingOverlay />}

      {/* Map overlay info */}
      <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2 z-10">
        <div className="text-white font-semibold">Kyiv Map</div>
        <div className="text-gray-300 text-sm">Real-time Updates</div>
      </div>

      {/* Legend */}
      <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2 z-10">
        <div className="flex flex-col gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-600 rounded-full"></div>
            <span className="text-white">Danger</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-600 rounded-full"></div>
            <span className="text-white">Safe</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
            <span className="text-white">Checkpoint</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
            <span className="text-white">Shelter</span>
          </div>
        </div>
      </div>
    </div>
  );
}