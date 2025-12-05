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
          console.log('📍 Location Selected:', {
            displayName: geocoded.displayName,
            area: geocoded.area,
            pincode: geocoded.pincode,
            latitude: geocoded.latitude,
            longitude: geocoded.longitude,
            source: geocoded.source || 'manual'
          });
          setLocation(geocoded);
          return;
        }
      }
      console.log('📍 Location Selected:', {
        displayName: newLocation.displayName,
        area: newLocation.area,
        pincode: newLocation.pincode,
        latitude: newLocation.latitude,
        longitude: newLocation.longitude,
        source: newLocation.source || 'manual'
      });
      setLocation(newLocation);
    } catch (error) {
      console.warn('Geocoding failed, using location without coordinates:', error);
      console.log('📍 Location Selected (without coordinates):', {
        displayName: newLocation.displayName,
        area: newLocation.area,
        pincode: newLocation.pincode,
        latitude: newLocation.latitude,
        longitude: newLocation.longitude,
        source: newLocation.source || 'manual'
      });
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

  // Log location changes with coordinates
  useEffect(() => {
    if (location.id) {
      console.log('📍 Current Location Updated:', {
        id: location.id,
        displayName: location.displayName,
        area: location.area,
        pincode: location.pincode,
        latitude: location.latitude,
        longitude: location.longitude,
        source: location.source || 'manual'
      });
    }
  }, [location.id, location.latitude, location.longitude]);

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

