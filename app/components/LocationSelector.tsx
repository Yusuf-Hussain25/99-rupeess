'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import type { Location } from '../types';
import {
  detectBrowserLocation,
  getPatnaLocations,
  type PatnaLocation,
} from '../utils/locationUtils';

interface LocationSelectorProps {
  currentLocation: Location;
  onLocationChange: (location: Location) => void;
  forceOpen?: boolean;
  hideButton?: boolean;
}

const MAX_VISIBLE_RESULTS = 200;

export default function LocationSelector({ currentLocation, onLocationChange, forceOpen = false, hideButton = false }: LocationSelectorProps) {
  const [isOpen, setIsOpen] = useState(forceOpen);
  
  useEffect(() => {
    if (forceOpen !== undefined) {
      setIsOpen(forceOpen);
    }
  }, [forceOpen]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectError, setDetectError] = useState<string | null>(null);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [locations, setLocations] = useState<PatnaLocation[]>([]);
  const [visibleLocations, setVisibleLocations] = useState<PatnaLocation[]>([]);

  // Fetch locations from database
  useEffect(() => {
    getPatnaLocations()
      .then(setLocations)
      .catch(() => setLocations([]));
  }, []);

  // Update visible locations based on search query (handles both area names and pincodes)
  useEffect(() => {
    if (!searchQuery.trim()) {
      setVisibleLocations(locations.slice(0, MAX_VISIBLE_RESULTS));
    } else {
      const query = searchQuery.trim();
      // Check if query is a 6-digit pincode
      const isPincode = /^\d{6}$/.test(query);
      
      if (isPincode) {
        // Search for all locations with exact pincode match (multiple areas can share same pincode)
        const filtered = locations
          .filter((loc) => loc.pincode?.toString() === query)
          .slice(0, MAX_VISIBLE_RESULTS);
        setVisibleLocations(filtered);
      } else {
        // Search by area name, locality, city, district, or partial pincode
        const q = query.toLowerCase();
        const filtered = locations
          .filter(
            (loc) =>
              loc.city?.toLowerCase().includes(q) ||
              loc.district?.toLowerCase().includes(q) ||
              loc.displayName?.toLowerCase().includes(q) ||
              loc.area?.toLowerCase().includes(q) ||
              loc.pincode?.toString().includes(query)
          )
          .slice(0, MAX_VISIBLE_RESULTS);
        setVisibleLocations(filtered);
      }
    }
  }, [locations, searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
        setDetectError(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLocationSelect = (location: PatnaLocation, source: Location['source'] = 'manual') => {
    onLocationChange({ ...location, source });
    setIsOpen(false);
    setSearchQuery('');
    setDetectError(null);
  };


  const handleUseCurrentLocation = async () => {
    // Check if this is first time and permission not granted
    const hasSeenModal = typeof window !== 'undefined' 
      ? localStorage.getItem('location-permission-modal-seen') 
      : null;
    
    // Check permission status (if Permissions API is available)
    let permissionGranted = false;
    if (typeof window !== 'undefined' && 'permissions' in navigator) {
      try {
        const result = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
        permissionGranted = result.state === 'granted';
      } catch (e) {
        // Permissions API not supported or query failed, proceed normally
      }
    }

    // Show modal if first time and permission not granted
    if (!hasSeenModal && !permissionGranted) {
      setShowPermissionModal(true);
      return;
    }

    // Proceed with location detection
    await detectLocation();
  };

  const detectLocation = async () => {
    setIsDetecting(true);
    setDetectError(null);
    try {
      // Get GPS coordinates first
      let userLat: number | null = null;
      let userLng: number | null = null;
      
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
          });
        });
        
        userLat = position.coords.latitude;
        userLng = position.coords.longitude;
      } catch (geoError) {
        // GPS not available, continue without coordinates
      }

      const detected = await detectBrowserLocation();
      if (detected) {
        // Add GPS coordinates to detected location
        const locationWithCoords = {
          ...detected,
          latitude: userLat ?? undefined,
          longitude: userLng ?? undefined,
        };
        // Automatically set the detected location
        handleLocationSelect(locationWithCoords, 'browser');
        return; // Exit early after setting location
      }
      
      // If detectBrowserLocation didn't return a location, check if we have GPS coordinates
      if (userLat !== null && userLng !== null) {
        // Check if coordinates are roughly within Patna bounds
        const isWithinPatna = (
          userLat >= 25.3 && userLat <= 25.8 &&
          userLng >= 84.9 && userLng <= 85.4
        );
        
        if (isWithinPatna) {
          // Use default location but inform user they can still use nearby shops feature
          const defaultLoc = {
            ...locations[0],
            latitude: userLat,
            longitude: userLng,
          };
          // Automatically set the default location with coordinates
          handleLocationSelect(defaultLoc, 'browser');
          setDetectError(null); // Clear any previous error
        } else {
          setDetectError('Your location appears to be outside Patna. Please select a Patna locality manually.');
        }
      } else {
        setDetectError('Unable to fetch your current location. Please allow permission or select manually.');
      }
    } catch (error) {
      setDetectError('Unable to fetch your current location. Please allow permission or select manually.');
    } finally {
      setIsDetecting(false);
    }
  };

  const handleAllowLocation = async () => {
    // Mark modal as seen
    if (typeof window !== 'undefined') {
      localStorage.setItem('location-permission-modal-seen', 'true');
    }
    setShowPermissionModal(false);
    
    // Now proceed with location detection (this will trigger browser permission prompt)
    await detectLocation();
  };

  const handleDenyLocation = () => {
    // Mark modal as seen
    if (typeof window !== 'undefined') {
      localStorage.setItem('location-permission-modal-seen', 'true');
    }
    setShowPermissionModal(false);
  };

  const handleSearchChange = (value: string) => {
    // Allow both text and numbers
    setSearchQuery(value);
  };

  return (
    <div className="relative shrink-0 w-full sm:w-auto" ref={dropdownRef}>
      {!hideButton && (
      <button
        onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 sm:gap-2 h-9 sm:h-12 px-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-700 bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-lg sm:rounded-xl hover:border-blue-400 hover:bg-gradient-to-br hover:from-blue-50 hover:to-blue-100 transition-all shadow-sm hover:shadow-md w-full sm:min-w-[160px] sm:w-auto group"
        aria-label={`Current location: ${currentLocation.displayName}. Click to change location.`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 shrink-0 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <div className="flex flex-col text-left min-w-0 flex-1">
          <span className="truncate font-semibold text-xs sm:text-sm">
            {currentLocation.source === 'browser' ? 'Current Location' : (currentLocation.displayName || currentLocation.city || 'Select Location')}
          </span>
          {currentLocation.source !== 'browser' && currentLocation.pincode && (
            <span className="text-[9px] sm:text-[10px] text-gray-500 truncate">
              PIN {currentLocation.pincode} · {currentLocation.district || currentLocation.city}
            </span>
          )}
        </div>
        <svg className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      )}

      {isOpen && (
        <div className={`${hideButton ? 'static' : 'absolute left-0 mt-2 sm:mt-3'} ${hideButton ? 'w-full' : 'w-[calc(100vw-1rem)]'} sm:w-[26rem] ${hideButton ? 'max-w-full' : 'max-w-[calc(100vw-1rem)]'} sm:max-w-[26rem] bg-white border-2 border-gray-100 rounded-xl sm:rounded-2xl ${hideButton ? '' : 'shadow-2xl'} z-50 ${hideButton ? 'max-h-[24rem] sm:max-h-[28rem]' : 'max-h-[calc(100vh-8rem)] sm:max-h-[32rem]'} overflow-hidden flex flex-col backdrop-blur-sm`}>
          {/* Unified Search Box */}
          <div className="p-3 sm:p-4 border-b-2 border-gray-100 bg-gradient-to-r from-blue-50/50 to-orange-50/50">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search area name or enter pincode..."
                className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 sm:focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white shadow-sm transition-all"
                autoFocus
              />
              <svg className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Clear search"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <p className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs text-gray-500">
              Choose from {locations.length} Patna localities in our dataset. Type area name or 6-digit pincode.
            </p>
          </div>

          {/* Use Current Location */}
          <button
            onClick={handleUseCurrentLocation}
            className="px-3 sm:px-5 py-2.5 sm:py-3.5 text-left text-xs sm:text-sm font-semibold text-blue-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 border-b-2 border-gray-100 transition-all flex items-center gap-2 sm:gap-3 group disabled:opacity-60"
            disabled={isDetecting}
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
              {isDetecting ? (
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              )}
            </div>
            <span className="truncate">Use my current location</span>
          </button>

          {detectError && (
            <div className="px-5 py-3 text-xs text-red-500 font-medium border-b border-red-100 bg-red-50">
              {detectError}
            </div>
          )}

          {/* Permission Modal */}
          {showPermissionModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in">
                {/* Icon */}
                <div className="flex justify-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  </div>
                </div>

                {/* Content */}
                <div className="text-center space-y-3">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Allow Location Access
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600">
                    We need your location to show you nearby shops and help you find the best deals in your area.
                  </p>
                  <div className="pt-2 space-y-2 text-left bg-blue-50 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-xs sm:text-sm text-gray-700">
                        Find shops near you instantly
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-xs sm:text-sm text-gray-700">
                        Get personalized recommendations
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-xs sm:text-sm text-gray-700">
                        Your location is only used to show nearby shops
                      </p>
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={handleDenyLocation}
                    className="flex-1 px-4 py-3 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Not Now
                  </button>
                  <button
                    onClick={handleAllowLocation}
                    className="flex-1 px-4 py-3 text-sm font-semibold text-white bg-custom-gradient rounded-xl hover:opacity-90 transition-all shadow-md hover:shadow-lg"
                  >
                    Allow Location
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          <div className="overflow-y-auto flex-1">
            {visibleLocations.length > 0 ? (
              <div className="p-2 sm:p-3 space-y-1.5 sm:space-y-2">
                {visibleLocations.map((location) => (
                  <button
                    key={location.id}
                    onClick={() => handleLocationSelect(location)}
                    className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm rounded-lg sm:rounded-xl transition-all flex items-center gap-2 sm:gap-3 group ${
                      location.id === currentLocation.id
                        ? 'bg-gradient-to-r from-blue-100 to-orange-100 text-blue-700 font-bold ring-2 ring-blue-300'
                        : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-orange-50 font-medium'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shrink-0 ${
                        location.id === currentLocation.id
                          ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                          : 'bg-gray-100 group-hover:bg-blue-100'
                      }`}
                    >
                      <svg
                        className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${location.id === currentLocation.id ? 'text-white' : 'text-gray-600'}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate text-xs sm:text-sm">{location.displayName || location.city}</p>
                      <p className="text-[10px] sm:text-xs text-gray-500 truncate">
                        {location.pincode ? `PIN ${location.pincode}` : ''} {location.pincode && location.district ? '·' : ''} {location.district || location.area || ''}
                      </p>
                    </div>
                    {location.id === currentLocation.id && (
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
                {visibleLocations.length === MAX_VISIBLE_RESULTS && (
                  <p className="text-[11px] text-gray-400 text-center">
                    Showing first {MAX_VISIBLE_RESULTS} matches. Refine your search for more.
                  </p>
                )}
              </div>
            ) : (
              <div className="px-4 py-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-500">No locations found</p>
                <p className="text-xs text-gray-400 mt-1">Try another locality name or pincode.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
