import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './i18n';

import MapView from './components/Map/MapView';
import SheltersView from './components/Views/SheltersView';
import AlertsView from './components/Views/AlertsView';
import ResourcesView from './components/Views/ResourcesView';
import ReportsView from './components/Views/ReportsView';
import BottomNav from './components/Mobile/BottomNav';
import QuickReport from './components/Reports/QuickReport';
import BottomSheet from './components/Mobile/BottomSheet';
import TopBar from './components/Mobile/TopBar';
import AlertBanner from './components/Alerts/AlertBanner';
import ErrorBoundary from './components/common/ErrorBoundary';

import { useGeolocation } from './hooks/useGeolocation';
import { useRealtimeReports } from './hooks/useRealtimeReports';
import { useAppStore } from './store';

// Extend window interface
declare global {
  interface Window {
    mapTransformToReportMarker?: (location: [number, number], type: 'danger' | 'safe' | 'resource') => void;
  }
}

function App() {
  const { i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('map');
  const [mapKey, setMapKey] = useState(0); // Force map remount
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null);
  const { 
    language, 
    userLocation, 
    setUserLocation, 
    selectedShelter, 
    setSelectedShelter,
    mapBounds,
    setMapBounds,
    activeAlert,
    batterySaverMode 
  } = useAppStore();
  
  const { location, error: locationError } = useGeolocation();
  const reports = useRealtimeReports(mapBounds);

  // Update user location in store
  useEffect(() => {
    if (location) {
      setUserLocation(location);
    }
  }, [location, setUserLocation]);

  // Set language
  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language, i18n]);

  // Simulate air raid alert for demo (remove in production)
  useEffect(() => {
    // This would typically come from an external alert API
    // setActiveAlert({
    //   id: '1',
    //   type: 'air_raid',
    //   region: 'Kyiv',
    //   timestamp: new Date(),
    //   active: true
    // });
  }, []);

  const handleTabChange = (tab: string) => {
    if (tab === 'map' && activeTab !== 'map') {
      // Only reload when switching TO map from another tab
      setMapKey(prev => prev + 1);
    }
    setActiveTab(tab);
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'map':
        return (
          <ErrorBoundary>
            <MapView
              key={mapKey} // This forces remount
              reports={reports}
              userLocation={userLocation}
              onBoundsChange={setMapBounds}
              onReportSelect={setSelectedShelter}
              onReloadRequest={() => setMapKey(prev => prev + 1)}
              onLocationSelect={setSelectedLocation}
              onReportSubmitted={(location, type) => {
                // Transform marker and clear selection
                if (window.mapTransformToReportMarker) {
                  window.mapTransformToReportMarker(location, type);
                }
                setSelectedLocation(null);
              }}
            />
          </ErrorBoundary>
        );
      case 'shelters':
        return <SheltersView />;
      case 'alerts':
        return <AlertsView />;
      case 'resources':
        return <ResourcesView />;
      case 'reports':
        return <ReportsView />;
      default:
        return (
          <ErrorBoundary>
            <MapView
              reports={reports}
              userLocation={userLocation}
              onBoundsChange={setMapBounds}
              onReportSelect={setSelectedShelter}
            />
          </ErrorBoundary>
        );
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-900 flex justify-center">
        <div className={`h-screen w-full max-w-[375px] bg-gray-900 text-white overflow-hidden relative ${
          batterySaverMode ? 'brightness-75' : ''
        }`}>
          <TopBar />
          <AlertBanner />
          
          {/* Main Content */}
          <div className={`h-full ${activeAlert ? 'pt-32' : 'pt-16'} pb-16`}>
            {renderActiveView()}
          </div>
          
          {/* Only show QuickReport on map view */}
          {activeTab === 'map' && <QuickReport 
            location={selectedLocation || userLocation} 
            selectedLocation={selectedLocation} 
            onLocationClear={() => setSelectedLocation(null)}
            onReportSubmitted={(location, type) => {
              // Transform marker and clear selection
              if (window.mapTransformToReportMarker) {
                window.mapTransformToReportMarker(location, type);
              }
              setSelectedLocation(null);
            }}
          />}
          
          {selectedShelter && (
            <BottomSheet
              report={selectedShelter}
              onClose={() => setSelectedShelter(null)}
            />
          )}
          
          <BottomNav
            activeView={activeTab}
            onViewChange={handleTabChange}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
