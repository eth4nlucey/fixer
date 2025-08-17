import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapLoadingOverlay } from '../common/LoadingSpinner';
import { useTranslation } from 'react-i18next';

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;

// Set Mapbox access token
if (MAPBOX_TOKEN) {
  mapboxgl.accessToken = MAPBOX_TOKEN;
}

interface MapViewProps {
  reports: any[];
  userLocation: [number, number] | null;
  onBoundsChange: (bounds: any) => void;
  onReportSelect: (report: any) => void;
  onReloadRequest?: () => void;
  onLocationSelect?: (location: [number, number] | null) => void;
  onReportSubmitted?: (location: [number, number], type: 'danger' | 'safe' | 'resource') => void;
}

export default function MapView({ reports, userLocation, onBoundsChange, onReportSelect, onReloadRequest, onLocationSelect, onReportSubmitted }: MapViewProps) {
  const { t, i18n: i18nInstance } = useTranslation();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const selectedLocationMarker = useRef<mapboxgl.Marker | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showZoomHint, setShowZoomHint] = useState(true);
  const [webglContextLost, setWebglContextLost] = useState(false);
  const loadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  // Function to handle location selection
  const handleLocationSelect = (location: [number, number]) => {
    if (!map.current) return;

    // Remove existing selected location marker
    if (selectedLocationMarker.current) {
      selectedLocationMarker.current.remove();
    }

    // Create new marker for selected location
    const el = document.createElement('div');
    el.className = 'w-8 h-8 bg-blue-500 border-4 border-white rounded-full shadow-lg animate-pulse';
    el.style.cursor = 'pointer';

    selectedLocationMarker.current = new mapboxgl.Marker(el)
      .setLngLat(location)
      .addTo(map.current);

    // Vibrate to indicate selection
    navigator.vibrate?.(100);

    // Call the callback
    if (onLocationSelect) {
      onLocationSelect(location);
    }
  };

  // Function to transform selected marker into report marker
  const transformToReportMarker = (location: [number, number], type: 'danger' | 'safe' | 'resource') => {
    if (!map.current) return;

    // Remove the selection marker
    if (selectedLocationMarker.current) {
      selectedLocationMarker.current.remove();
      selectedLocationMarker.current = null;
    }

    // Create report marker
    const el = document.createElement('div');
    let bgColor, emoji;
    
    switch (type) {
      case 'danger':
        bgColor = 'bg-red-500';
        emoji = '⚠️';
        break;
      case 'safe':
        bgColor = 'bg-green-500';
        emoji = '✅';
        break;
      case 'resource':
        bgColor = 'bg-blue-500';
        emoji = '🛡️';
        break;
    }
    
    el.className = `w-8 h-8 ${bgColor} border-4 border-white rounded-full shadow-lg flex items-center justify-center cursor-pointer`;
    el.innerHTML = `<span class="text-white text-sm">${emoji}</span>`;
    
    const reportMarker = new mapboxgl.Marker(el)
      .setLngLat(location)
      .addTo(map.current);
    
    // Add to markers array so it gets cleaned up properly
    markers.current.push(reportMarker);

    // Create a temporary report object for click handling
    const tempReport = {
      id: `temp_${Date.now()}`,
      type,
      longitude: location[0],
      latitude: location[1],
      created_at: new Date().toISOString(),
      description: 'User submitted report'
    };
    
    el.addEventListener('click', () => onReportSelect(tempReport));
  };

  // Handle report submission callback
  React.useEffect(() => {
    if (onReportSubmitted) {
      // Store the function reference for parent to call
      window.mapTransformToReportMarker = transformToReportMarker;
    }
    return () => {
      delete window.mapTransformToReportMarker;
    };
  }, [onReportSubmitted]);

  // Function to initialize or reinitialize the map
  const initializeMap = () => {
    if (!mapContainer.current) return;
    
    // Clean up existing map
    if (selectedLocationMarker.current) {
      selectedLocationMarker.current.remove();
      selectedLocationMarker.current = null;
    }
    if (map.current) {
      map.current.remove();
      map.current = null;
    }

    setIsLoading(true);
    setError(null);
    setWebglContextLost(false);

    // Set timeout to show error if map doesn't load within 15 seconds
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
    }
    loadTimeoutRef.current = setTimeout(() => {
      if (isLoading) {
        setError('Map loading timeout. Please refresh the page.');
        setIsLoading(false);
      }
    }, 15000);

    try {
      // Ensure token is set
      mapboxgl.accessToken = MAPBOX_TOKEN;
      
      // Check WebGL support
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
      if (!gl) {
        setError('WebGL is not supported on this device');
        setIsLoading(false);
        return;
      }

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11', // Use more stable style
        center: userLocation || [30.5234, 50.4501],
        zoom: 12,
        pitch: 0,
        preserveDrawingBuffer: false,
        trackResize: true,
        refreshExpiredTiles: false,
        failIfMajorPerformanceCaveat: false,
        antialias: false,
        maxZoom: 16, // Reduce max zoom to prevent memory issues
        minZoom: 10,
      });

      // Add controls
      const geolocateControl = new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showUserHeading: true
      });
      map.current.addControl(geolocateControl, 'top-right');

      // Map event handlers
      map.current.on('load', () => {
        // Clear the load timeout
        if (loadTimeoutRef.current) {
          clearTimeout(loadTimeoutRef.current);
          loadTimeoutRef.current = null;
        }
        
        setIsLoading(false);
        setWebglContextLost(false);
        setError(null);
        updateMapLanguage(i18nInstance.language);
        
        setTimeout(() => setShowZoomHint(false), 5000);
      });

      // WebGL context handlers
      const canvas = map.current.getCanvas();
      
      canvas.addEventListener('webglcontextlost', (e) => {
        e.preventDefault();
        setWebglContextLost(true);
        setError('Graphics context lost. Please refresh the page if the map doesn\'t recover.');
        // Don't automatically retry - let user refresh manually
      });

      canvas.addEventListener('webglcontextrestored', () => {
        setWebglContextLost(false);
        setError(null);
        setIsLoading(false);
        // Map should automatically reload after context restoration
      });

      // Error handling
      map.current.on('error', (e) => {
        console.error('Mapbox error:', e);
        setError('Map failed to load. Please refresh the page.');
        setIsLoading(false);
      });

      // Other event handlers
      map.current.on('touchstart', (e) => {
        setShowZoomHint(false);
        
        // Start long press timer
        const touch = e.originalEvent.touches[0];
        if (touch) {
          longPressTimer.current = setTimeout(() => {
            const lngLat = map.current?.unproject([touch.clientX, touch.clientY]);
            if (lngLat && onLocationSelect) {
              handleLocationSelect([lngLat.lng, lngLat.lat]);
            }
          }, 800); // 800ms long press
        }
      });
      
      map.current.on('touchend', () => {
        // Cancel long press timer
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }
      });
      
      map.current.on('touchmove', () => {
        // Cancel long press on move
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }
      });
      
      // Mouse events for desktop
      map.current.on('mousedown', (e) => {
        longPressTimer.current = setTimeout(() => {
          if (onLocationSelect) {
            handleLocationSelect([e.lngLat.lng, e.lngLat.lat]);
          }
        }, 800);
      });
      
      map.current.on('mouseup', () => {
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }
      });
      
      map.current.on('mousemove', () => {
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }
      });
      
      map.current.on('wheel', () => {
        setShowZoomHint(false);
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

      // Visibility change handler
      const handleVisibilityChange = () => {
        if (!document.hidden && map.current) {
          setTimeout(() => {
            map.current?.resize();
          }, 100);
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
        }
        if (selectedLocationMarker.current) {
          selectedLocationMarker.current.remove();
          selectedLocationMarker.current = null;
        }
        if (map.current) {
          map.current.remove();
          map.current = null;
        }
      };

    } catch (err) {
      console.error('Error initializing map:', err);
      setError('Failed to initialize map');
      setIsLoading(false);
    }
  };

  // Function to update map language
  const updateMapLanguage = (language: string) => {
    if (!map.current || !map.current.isStyleLoaded()) return;

    // Map language codes
    const languageMap: { [key: string]: string } = {
      'uk': 'uk',  // Ukrainian
      'en': 'en',  // English
      'ru': 'ru',  // Russian
    };

    const mapLang = languageMap[language] || 'en';

    // Get all layers and filter for label layers
    const layers = map.current.getStyle().layers;
    const labelLayerIds: string[] = [];
    
    if (layers) {
      layers.forEach((layer: any) => {
        // Check if layer has text-field property (indicates it's a label layer)
        if (layer.type === 'symbol' && layer.layout && layer.layout['text-field']) {
          labelLayerIds.push(layer.id);
        }
      });
    }

    // Update text field for each label layer
    labelLayerIds.forEach((layerId) => {
      if (map.current?.getLayer(layerId)) {
        try {
          // Use coalesce to fall back to default name if language-specific name doesn't exist
          map.current.setLayoutProperty(layerId, 'text-field', [
            'coalesce',
            ['get', `name_${mapLang}`],
            ['get', 'name']
          ]);
        } catch (err) {
          console.warn(`Could not update language for layer ${layerId}:`, err);
        }
      }
    });
  };

  // Listen for language changes
  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      updateMapLanguage(lng);
    };

    i18nInstance.on('languageChanged', handleLanguageChange);

    return () => {
      i18nInstance.off('languageChanged', handleLanguageChange);
    };
  }, [i18nInstance]);

  // Update map when updateMapLanguage function changes (dependencies)
  useEffect(() => {
    if (map.current && map.current.isStyleLoaded()) {
      updateMapLanguage(i18nInstance.language);
    }
  }, [updateMapLanguage, i18nInstance.language]);

  useEffect(() => {
    if (!MAPBOX_TOKEN) {
      setError('Mapbox token is missing. Please add REACT_APP_MAPBOX_TOKEN to your .env.local file.');
      setIsLoading(false);
      return;
    }

    initializeMap();
    
    return () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
      if (selectedLocationMarker.current) {
        selectedLocationMarker.current.remove();
        selectedLocationMarker.current = null;
      }
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
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


  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-red-50">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">{webglContextLost ? '🔄' : '❌'}</div>
          <h3 className="text-lg font-bold text-red-800 mb-2">{t('map.errors.map_error')}</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            {t('map.errors.reload_page')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full bg-gray-900 overflow-hidden">
      <div ref={mapContainer} className="w-full h-full" />
      {isLoading && !error && <MapLoadingOverlay />}

      {/* Pinch to zoom hint */}
      {showZoomHint && !isLoading && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none animate-fade-in">
          <div className="bg-black/70 backdrop-blur-sm rounded-lg px-4 py-3 text-white text-center">
            <div className="text-2xl mb-2">👌</div>
            <div className="text-sm font-medium">{t('map.zoom_hint')}</div>
          </div>
        </div>
      )}

      {/* Map overlay info */}
      <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2 z-10">
        <div className="text-white font-semibold">{t('map.kyiv_map')}</div>
        <div className="text-gray-300 text-sm">{t('map.real_time_updates')}</div>
      </div>

      {/* Legend */}
      <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2 z-10">
        <div className="flex flex-col gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-600 rounded-full"></div>
            <span className="text-white">{t('map.legend.danger')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-600 rounded-full"></div>
            <span className="text-white">{t('map.legend.safe')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
            <span className="text-white">{t('map.legend.checkpoint')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
            <span className="text-white">{t('map.legend.shelter')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}