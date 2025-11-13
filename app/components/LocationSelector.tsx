'use client';

import { useState, useRef, useEffect } from 'react';
import type { Location } from '../types';

interface LocationSelectorProps {
  currentLocation: Location;
  onLocationChange: (location: Location) => void;
}

export default function LocationSelector({ currentLocation, onLocationChange }: LocationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [recentLocations] = useState<Location[]>([
    { id: 'mumbai', city: 'Mumbai', state: 'Maharashtra', country: 'IN', displayName: 'Mumbai' },
    { id: 'patna', city: 'Patna', state: 'Bihar', country: 'IN', displayName: 'Patna' },
    { id: 'delhi', city: 'Delhi', state: 'Delhi', country: 'IN', displayName: 'Delhi' },
    { id: 'bangalore', city: 'Bangalore', state: 'Karnataka', country: 'IN', displayName: 'Bangalore' },
    { id: 'hyderabad', city: 'Hyderabad', state: 'Telangana', country: 'IN', displayName: 'Hyderabad' },
  ]);
  const [searchResults, setSearchResults] = useState<Location[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      const results = recentLocations.filter(loc =>
        loc.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.displayName.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, recentLocations]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation: Location = {
            id: 'current',
            city: 'Current Location',
            country: 'IN',
            displayName: 'Current Location'
          };
          onLocationChange(newLocation);
          setIsOpen(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your location. Please select manually.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  const handleLocationSelect = (location: Location) => {
    onLocationChange(location);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="relative shrink-0" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 h-12 px-4 text-sm font-medium text-gray-700 bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl hover:border-blue-400 hover:bg-gradient-to-br hover:from-blue-50 hover:to-blue-100 transition-all shadow-sm hover:shadow-md min-w-[140px] group"
        aria-label={`Current location: ${currentLocation.displayName}. Click to change location.`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <svg className="w-5 h-5 text-blue-600 shrink-0 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span className="truncate font-semibold">{currentLocation.city || currentLocation.displayName}</span>
        <svg className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-3 w-96 bg-white border-2 border-gray-100 rounded-2xl shadow-2xl z-50 max-h-96 overflow-hidden flex flex-col backdrop-blur-sm">
          {/* Search Box - Enhanced */}
          <div className="p-4 border-b-2 border-gray-100 bg-gradient-to-r from-blue-50/50 to-orange-50/50">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search city or locality..."
                className="w-full pl-10 pr-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white shadow-sm transition-all"
                autoFocus
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Use Current Location - Enhanced */}
          <button
            onClick={handleUseCurrentLocation}
            className="px-5 py-3.5 text-left text-sm font-semibold text-blue-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 border-b-2 border-gray-100 transition-all flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <span>Use my current location</span>
          </button>

          {/* Results - Enhanced */}
          <div className="overflow-y-auto flex-1">
            {searchQuery.length >= 2 && searchResults.length > 0 && (
              <div className="p-3">
                <div className="text-xs font-bold text-gray-500 uppercase px-3 py-2 tracking-wider">Search Results</div>
                {searchResults.map((location) => (
                  <button
                    key={location.id}
                    onClick={() => handleLocationSelect(location)}
                    className="w-full px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-orange-50 rounded-xl transition-all flex items-center gap-3 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <span>{location.displayName}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Recent Locations - Enhanced */}
            {searchQuery.length < 2 && (
              <div className="p-3">
                <div className="text-xs font-bold text-gray-500 uppercase px-3 py-2 tracking-wider">Popular Cities</div>
                {recentLocations.map((location) => (
                  <button
                    key={location.id}
                    onClick={() => handleLocationSelect(location)}
                    className={`w-full px-4 py-3 text-left text-sm rounded-xl transition-all flex items-center gap-3 group ${
                      location.id === currentLocation.id
                        ? 'bg-gradient-to-r from-blue-100 to-orange-100 text-blue-700 font-bold ring-2 ring-blue-300'
                        : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-orange-50 font-medium'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform ${
                      location.id === currentLocation.id
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                        : 'bg-gray-100 group-hover:bg-blue-100'
                    }`}>
                      <svg className={`w-4 h-4 ${location.id === currentLocation.id ? 'text-white' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <span>{location.displayName}</span>
                    {location.id === currentLocation.id && (
                      <svg className="w-4 h-4 text-blue-600 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}

            {searchQuery.length >= 2 && searchResults.length === 0 && (
              <div className="px-4 py-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-500">No locations found</p>
                <p className="text-xs text-gray-400 mt-1">Try searching with a different term</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
