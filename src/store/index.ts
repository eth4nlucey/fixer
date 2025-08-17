import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface Shelter {
  id: string;
  location: [number, number];
  name: {
    uk: string;
    en: string;
    ru: string;
  };
  type: 'bomb_shelter' | 'metro' | 'basement' | 'parking';
  capacity: number;
  amenities: string[];
  accessibility: boolean;
  status: 'open' | 'closed' | 'unknown';
  lastUpdated: Date;
  verifiedBy: string[];
}

interface Alert {
  id: string;
  type: 'air_raid' | 'all_clear';
  region: string;
  timestamp: Date;
  active: boolean;
}

interface AppState {
  // Language
  language: 'uk' | 'en' | 'ru';
  setLanguage: (lang: 'uk' | 'en' | 'ru') => void;

  // Location
  userLocation: [number, number] | null;
  setUserLocation: (location: [number, number] | null) => void;

  // Shelters
  shelters: Shelter[];
  setShelters: (shelters: Shelter[]) => void;
  
  // Alerts
  alerts: Alert[];
  setAlerts: (alerts: Alert[]) => void;
  activeAlert: Alert | null;
  setActiveAlert: (alert: Alert | null) => void;

  // UI State
  selectedShelter: Shelter | null;
  setSelectedShelter: (shelter: Shelter | null) => void;
  
  // Emergency features
  batterySaverMode: boolean;
  setBatterySaverMode: (enabled: boolean) => void;
  
  offlineMode: boolean;
  setOfflineMode: (enabled: boolean) => void;

  // Map state
  mapBounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  } | null;
  setMapBounds: (bounds: any) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Language
      language: 'uk',
      setLanguage: (lang) => set({ language: lang }),

      // Location
      userLocation: null,
      setUserLocation: (location) => set({ userLocation: location }),

      // Shelters
      shelters: [],
      setShelters: (shelters) => set({ shelters }),

      // Alerts
      alerts: [],
      setAlerts: (alerts) => set({ alerts }),
      activeAlert: null,
      setActiveAlert: (alert) => set({ activeAlert: alert }),

      // UI State
      selectedShelter: null,
      setSelectedShelter: (shelter) => set({ selectedShelter: shelter }),

      // Emergency features
      batterySaverMode: false,
      setBatterySaverMode: (enabled) => set({ batterySaverMode: enabled }),

      offlineMode: false,
      setOfflineMode: (enabled) => set({ offlineMode: enabled }),

      // Map state
      mapBounds: null,
      setMapBounds: (bounds) => set({ mapBounds: bounds }),
    }),
    {
      name: 'fixer-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        language: state.language,
        batterySaverMode: state.batterySaverMode,
        offlineMode: state.offlineMode,
      }),
    }
  )
);