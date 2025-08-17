import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './i18n';

import MapView from './components/Map/MapView';
import BottomNav from './components/Mobile/BottomNav';
import QuickReport from './components/Reports/QuickReport';
import BottomSheet from './components/Mobile/BottomSheet';
import LanguageToggle from './components/Mobile/LanguageToggle';
import AlertBanner from './components/Alerts/AlertBanner';

import { useGeolocation } from './hooks/useGeolocation';
import { useRealtimeReports } from './hooks/useRealtimeReports';
import { useAppStore } from './store';

function App() {
  const { i18n } = useTranslation();
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

  return (
    <div className={`h-screen w-screen relative overflow-hidden ${
      batterySaverMode ? 'brightness-75' : ''
    }`}>
      <AlertBanner />
      
      <div className={activeAlert ? 'mt-16' : ''}>
        <MapView
          reports={reports}
          userLocation={userLocation}
          onBoundsChange={setMapBounds}
          onReportSelect={setSelectedShelter}
        />
      </div>
      
      <LanguageToggle />
      <QuickReport location={userLocation} />
      
      {selectedShelter && (
        <BottomSheet
          report={selectedShelter}
          onClose={() => setSelectedShelter(null)}
        />
      )}
      
      <BottomNav
        activeView="map"
        onViewChange={() => {}}
      />
    </div>
  );
}

export default App;
