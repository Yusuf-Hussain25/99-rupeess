import rawLocations from '../patna_full_locations.json';
import type { Location } from '../types';

export interface PatnaLocationRecord {
  Location: string;
  Pincode: number;
  State: string;
  District: string;
}

export interface PatnaLocation extends Location {
  pincode: number;
  district: string;
  state: string;
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const normalizeLocation = (entry: PatnaLocationRecord): PatnaLocation => {
  const locationSlug = slugify(entry.Location);
  return {
    id: `${locationSlug}-${entry.Pincode}`,
    city: entry.Location,
    state: entry.State,
    country: 'IN',
    displayName: `${entry.Location}, ${entry.District}`,
    pincode: entry.Pincode,
    district: entry.District,
  };
};

const patnaLocations: PatnaLocation[] = (rawLocations as PatnaLocationRecord[]).map(normalizeLocation);

export const getPatnaLocations = () => patnaLocations;

export const getDefaultLocation = (): PatnaLocation => patnaLocations[0];

export const findLocationByPincode = (pincode: string | number) => {
  const sanitized = typeof pincode === 'number' ? pincode.toString() : pincode;
  const trimmed = sanitized.replace(/\D+/g, '').slice(0, 6);
  if (!trimmed) return undefined;
  return patnaLocations.find((loc) => loc.pincode.toString() === trimmed);
};

export const findLocationByName = (name: string) => {
  const normalized = slugify(name);
  return patnaLocations.find(
    (loc) => slugify(loc.city) === normalized || slugify(loc.displayName) === normalized
  );
};

export const searchLocations = (query: string, limit = 50) => {
  const q = query.trim().toLowerCase();
  if (!q) {
    return patnaLocations.slice(0, limit);
  }

  return patnaLocations
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

export const matchAddressToLocation = (address?: ReverseAddress) => {
  if (!address) return undefined;

  // First, try to match by pincode (most reliable)
  if (address.postcode) {
    const pincodeMatch = findLocationByPincode(address.postcode);
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
    const match = findLocationByName(name);
    if (match) return match;
  }

  // Try fuzzy/partial matching if exact match fails
  for (const name of candidates) {
    const normalized = slugify(name);
    // Try to find locations that contain the name or vice versa
    const fuzzyMatch = patnaLocations.find((loc) => {
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
        const matched = matchAddressToLocation(data.address);
        
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

