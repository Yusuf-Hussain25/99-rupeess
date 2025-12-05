'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Location } from '../types';
import {
  detectBrowserLocation,
  getDefaultLocation,
  loadStoredLocation,
  persistLocation,
  geocodeLocation,
} from '../utils/locationUtils';
import type { PatnaLocation } from '../utils/locationUtils';

interface LocationContextType {
  location: Location;
  setLocation: (location: Location) => Promise<void>;
  isGeocoding: boolean;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

const defaultLocation: Location = {
  ...getDefaultLocation(),
  source: 'manual',
};

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<Location>(defaultLocation);
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Function to set location with geocoding
  const setLocationWithGeocoding = async (newLocation: Location) => {
    setIsGeocoding(true);
    try {
      // If location doesn't have coordinates, geocode it
      if (!newLocation.latitude || !newLocation.longitude) {
        const geocoded = await geocodeLocation(newLocation as PatnaLocation);
        if (geocoded) {
          setLocation(geocoded);
          return;
        }
      }
      setLocation(newLocation);
    } catch (error) {
      console.warn('Geocoding failed, using location without coordinates:', error);
      setLocation(newLocation);
    } finally {
      setIsGeocoding(false);
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const stored = loadStoredLocation();
    if (stored) {
      setLocationWithGeocoding({ ...stored, source: stored.source ?? 'manual' });
      return;
    }

    const detect = async () => {
      try {
        const detected = await detectBrowserLocation();
        if (detected) {
          setLocationWithGeocoding({ ...detected, source: 'auto' });
        }
      } catch (error) {
        console.warn('Automatic location detection failed:', error);
      }
    };

    detect();
  }, []);

  useEffect(() => {
    if (!location.pincode) return;
    persistLocation(location as PatnaLocation);
  }, [location]);

  return (
    <LocationContext.Provider value={{ location, setLocation: setLocationWithGeocoding, isGeocoding }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}

