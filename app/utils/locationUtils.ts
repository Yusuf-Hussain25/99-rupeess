import type { Location } from '../types';

export interface PatnaLocation extends Location {
  pincode: number;
  district: string;
  state: string;
  area?: string;
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

// Cache for locations fetched from API
let cachedLocations: PatnaLocation[] | null = null;
let locationsPromise: Promise<PatnaLocation[]> | null = null;

/**
 * Fetch locations from database via API
 */
async function fetchLocationsFromDB(): Promise<PatnaLocation[]> {
  try {
    const response = await fetch('/api/locations');
    const data = await response.json();
    
    if (data.success && data.locations) {
      return data.locations.map((loc: any) => ({
        id: loc.id,
        city: loc.city || 'Patna',
        state: loc.state || 'Bihar',
        country: loc.country || 'IN',
        displayName: loc.displayName || loc.city,
        pincode: loc.pincode,
        district: loc.district || 'Patna',
        area: loc.area,
        latitude: loc.latitude,
        longitude: loc.longitude,
      })) as PatnaLocation[];
    }
    
    // Fallback to default location if API fails
    return [getDefaultLocationFallback()];
  } catch (error) {
    console.error('Error fetching locations from database:', error);
    // Fallback to default location
    return [getDefaultLocationFallback()];
  }
}

/**
 * Get locations (cached or fetch from DB)
 */
async function getLocations(): Promise<PatnaLocation[]> {
  if (cachedLocations) {
    return cachedLocations;
  }
  
  if (locationsPromise) {
    return locationsPromise;
  }
  
  locationsPromise = fetchLocationsFromDB();
  cachedLocations = await locationsPromise;
  return cachedLocations;
}

/**
 * Get default location fallback (used when DB is unavailable)
 */
function getDefaultLocationFallback(): PatnaLocation {
  return {
    id: 'patna-800001',
    city: 'Patna',
    state: 'Bihar',
    country: 'IN',
    displayName: 'Patna, Patna',
    pincode: 800001,
    district: 'Patna',
    latitude: 25.5941,
    longitude: 85.1376,
  };
}

export const getPatnaLocations = async (): Promise<PatnaLocation[]> => {
  return getLocations();
};

export const getDefaultLocation = (): PatnaLocation => {
  // Return fallback immediately for synchronous use
  return getDefaultLocationFallback();
};

export const findLocationByPincode = async (pincode: string | number): Promise<PatnaLocation | undefined> => {
  const sanitized = typeof pincode === 'number' ? pincode.toString() : pincode;
  const trimmed = sanitized.replace(/\D+/g, '').slice(0, 6);
  if (!trimmed) return undefined;
  const locations = await getLocations();
  return locations.find((loc) => loc.pincode.toString() === trimmed);
};

export const findLocationByName = async (name: string): Promise<PatnaLocation | undefined> => {
  const normalized = slugify(name);
  const locations = await getLocations();
  return locations.find(
    (loc) => slugify(loc.city) === normalized || slugify(loc.displayName) === normalized
  );
};

export const searchLocations = async (query: string, limit = 50): Promise<PatnaLocation[]> => {
  const q = query.trim().toLowerCase();
  const locations = await getLocations();
  if (!q) {
    return locations.slice(0, limit);
  }

  return locations
    .filter(
      (loc) =>
        loc.city.toLowerCase().includes(q) ||
        loc.district.toLowerCase().includes(q) ||
        loc.pincode.toString().includes(q)
    )
    .slice(0, limit);
};

type ReverseAddress = {
  postcode?: string;
  city?: string;
  town?: string;
  village?: string;
  suburb?: string;
  neighbourhood?: string;
  county?: string;
  state_district?: string;
  district?: string;
};

export const matchAddressToLocation = async (address?: ReverseAddress): Promise<PatnaLocation | undefined> => {
  if (!address) return undefined;

  const locations = await getLocations();

  // First, try to match by pincode (most reliable)
  if (address.postcode) {
    const pincodeMatch = await findLocationByPincode(address.postcode);
    if (pincodeMatch) return pincodeMatch;
  }

  // Try exact name matching
  const candidates = [
    address.city,
    address.town,
    address.village,
    address.suburb,
    address.neighbourhood,
    address.district,
    address.state_district,
    address.county,
  ].filter(Boolean) as string[];

  for (const name of candidates) {
    const match = await findLocationByName(name);
    if (match) return match;
  }

  // Try fuzzy/partial matching if exact match fails
  for (const name of candidates) {
    const normalized = slugify(name);
    // Try to find locations that contain the name or vice versa
    const fuzzyMatch = locations.find((loc) => {
      const locCity = slugify(loc.city);
      const locDistrict = slugify(loc.district);
      return (
        locCity.includes(normalized) ||
        normalized.includes(locCity) ||
        locDistrict.includes(normalized) ||
        normalized.includes(locDistrict)
      );
    });
    if (fuzzyMatch) return fuzzyMatch;
  }

  return undefined;
};

const NOMINATIM_ENDPOINT = 'https://nominatim.openstreetmap.org/reverse';
const NOMINATIM_SEARCH_ENDPOINT = 'https://nominatim.openstreetmap.org/search';

/**
 * Geocode a location to get its latitude and longitude
 * @param location - Location object with city, pincode, district, etc.
 * @returns Location with latitude and longitude, or null if geocoding fails
 */
export const geocodeLocation = async (location: PatnaLocation): Promise<PatnaLocation | null> => {
  // If location already has coordinates, return it
  if (location.latitude && location.longitude) {
    console.log('Location already has coordinates:', location.displayName, location.latitude, location.longitude);
    return location;
  }

  console.log('Geocoding location:', location.displayName, location.city, location.pincode);

  try {
    // Build search query - prioritize pincode for accuracy
    let query = '';
    if (location.pincode) {
      query = `${location.pincode}, Patna, Bihar, India`;
    } else if (location.city) {
      query = `${location.city}, Patna, Bihar, India`;
    } else {
      query = 'Patna, Bihar, India';
    }
    
    const params = new URLSearchParams({
      q: query,
      format: 'json',
      limit: '1',
      addressdetails: '1',
    });

    console.log('Geocoding request:', `${NOMINATIM_SEARCH_ENDPOINT}?${params.toString()}`);

    const response = await fetch(`${NOMINATIM_SEARCH_ENDPOINT}?${params.toString()}`, {
      headers: {
        'Accept-Language': 'en',
        'User-Agent': '99-rupeess-app/1.0',
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Geocoding response:', data);
      if (data && data.length > 0) {
        const result = data[0];
        const lat = parseFloat(result.lat);
        const lon = parseFloat(result.lon);
        
        if (!isNaN(lat) && !isNaN(lon)) {
          console.log('Geocoding successful:', location.displayName, lat, lon);
          return {
            ...location,
            latitude: lat,
            longitude: lon,
          };
        }
      }
    } else {
      console.warn('Geocoding API error:', response.status, response.statusText);
    }
  } catch (error) {
    console.warn('Geocoding failed for location:', location.displayName, error);
  }

  // Fallback: Use approximate Patna center coordinates if geocoding fails
  // Patna center coordinates: 25.5941° N, 85.1376° E
  console.log('Using fallback coordinates for:', location.displayName);
  return {
    ...location,
    latitude: 25.5941,
    longitude: 85.1376,
  };
};

const getBrowserPosition = () =>
  new Promise<GeolocationPosition>((resolve, reject) => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    });
  });

export const detectBrowserLocation = async (): Promise<PatnaLocation | null> => {
  try {
    const position = await getBrowserPosition();
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    // Check if coordinates are within Patna bounds
    const PATNA_BOUNDS = {
      minLat: 25.3, // South
      maxLat: 25.8, // North
      minLon: 84.9, // West
      maxLon: 85.4, // East
    };

    const isWithinPatna = (
      lat >= PATNA_BOUNDS.minLat &&
      lat <= PATNA_BOUNDS.maxLat &&
      lon >= PATNA_BOUNDS.minLon &&
      lon <= PATNA_BOUNDS.maxLon
    );

    // Try reverse geocoding to get address details
    const params = new URLSearchParams({
      format: 'jsonv2',
      lat: String(lat),
      lon: String(lon),
      addressdetails: '1',
    });

    try {
      const response = await fetch(`${NOMINATIM_ENDPOINT}?${params.toString()}`, {
        headers: {
          'Accept-Language': 'en',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const matched = await matchAddressToLocation(data.address);
        
        // If we found a match, return it
        if (matched) {
          return matched;
        }
      }
    } catch (fetchError) {
      // Reverse geocoding failed, use fallback
    }

    // If no match found but coordinates are within Patna bounds, return default location
    // This allows users to proceed even if we can't match to a specific locality
    if (isWithinPatna) {
      const defaultLoc = getDefaultLocation();
      return defaultLoc;
    }

    // Outside Patna bounds - return null
    return null;
  } catch (error) {
    return null;
  }
};

const STORAGE_KEY = 'preferred-location';

export const loadStoredLocation = (): PatnaLocation | null => {
  if (typeof window === 'undefined') return null;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as PatnaLocation) : null;
  } catch {
    return null;
  }
};

export const persistLocation = (location: PatnaLocation) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(location));
  } catch {
    // ignore storage errors
  }
};

