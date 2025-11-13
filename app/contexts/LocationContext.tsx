'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import type { Location } from '../types';

interface LocationContextType {
  location: Location;
  setLocation: (location: Location) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

const defaultLocation: Location = {
  id: 'mumbai',
  city: 'Mumbai',
  state: 'Maharashtra',
  country: 'IN',
  displayName: 'Mumbai'
};

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<Location>(defaultLocation);

  return (
    <LocationContext.Provider value={{ location, setLocation }}>
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

