import shopData from '../shop.json';
import { calculateDistance } from './distance';

export interface Shop {
  name: string;
  lat: number;
  lng: number;
}

export interface BannerWithDistance {
  banner: any;
  distance?: number;
}

/**
 * Extract shop name from banner image filename
 * Examples:
 * - "Swiggy-logo.jpg" -> "Swiggy"
 * - "Ola-Cabs-Logo-2048x1153.jpg" -> "Ola"
 * - "Nykaa_New_Logo.svg" -> "Nykaa"
 * - "Reliance-Industries-Limited-Logo.png" -> "Reliance"
 * - "ASIANPAINT.NS-6124f67e.png" -> "Asian"
 */
function extractShopNameFromImage(imageUrl: string): string | null {
  try {
    // Extract filename from path
    const filename = imageUrl.split('/').pop() || '';
    
    // Remove file extension
    const nameWithoutExt = filename.replace(/\.(jpg|jpeg|png|svg|webp|gif)$/i, '').trim();
    
    // Normalize: remove common suffixes and prefixes
    const normalized = nameWithoutExt
      .replace(/-logo$/i, '')
      .replace(/_logo$/i, '')
      .replace(/logo-/i, '')
      .replace(/logo_/i, '')
      .replace(/-cabs$/i, '')
      .replace(/-industries-limited$/i, '')
      .replace(/-new$/i, '')
      .replace(/^new-/i, '')
      .replace(/\.ns-[\w]+$/i, '') // Remove stock exchange codes like .NS-6124f67e
      .replace(/\([\d]+\)$/i, '') // Remove numbers in parentheses like (1)
      .replace(/-\d+x\d+$/i, '') // Remove dimensions like -2048x1153
      .replace(/^[\w]+-/, '') // Remove prefixes before first dash
      .trim();
    
    // Try to match with shop names from shop.json
    const shops = shopData as Shop[];
    
    // First, try exact match (case-insensitive)
    const exactMatch = shops.find(shop => 
      normalized.toLowerCase() === shop.name.toLowerCase()
    );
    if (exactMatch) return exactMatch.name;
    
    // Try if shop name is contained in normalized filename
    const containsMatch = shops.find(shop => {
      const shopNameLower = shop.name.toLowerCase();
      const normalizedLower = normalized.toLowerCase();
      return normalizedLower.includes(shopNameLower) || 
             shopNameLower.includes(normalizedLower);
    });
    if (containsMatch) return containsMatch.name;
    
    // Try matching with original filename (before normalization)
    const originalMatch = shops.find(shop => {
      const shopNameLower = shop.name.toLowerCase();
      return nameWithoutExt.toLowerCase().includes(shopNameLower) ||
             nameWithoutExt.toLowerCase().startsWith(shopNameLower);
    });
    if (originalMatch) return originalMatch.name;
    
    // Special cases for known mappings
    const specialCases: Record<string, string> = {
      'asianpaint': 'Asian',
      'asian': 'Asian',
      'indigo': 'Indigo',
      'indig': 'Indigo',
      'hdfc': 'HDFC',
      'hdfc-bank': 'HDFC',
    };
    
    const specialMatch = specialCases[normalized.toLowerCase()];
    if (specialMatch) {
      const found = shops.find(s => s.name === specialMatch);
      if (found) return found.name;
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Get shop coordinates by name
 */
function getShopCoordinates(shopName: string): { lat: number; lng: number } | null {
  const shop = (shopData as Shop[]).find(
    s => s.name.toLowerCase() === shopName.toLowerCase()
  );
  return shop ? { lat: shop.lat, lng: shop.lng } : null;
}

/**
 * Get distance for a specific banner
 * @param banner - Banner object with imageUrl, lat, lng
 * @param userLat - User's latitude
 * @param userLng - User's longitude
 * @returns Distance in kilometers or null if not found
 */
export function getBannerDistance(
  banner: any,
  userLat: number | null,
  userLng: number | null
): number | null {
  if (userLat === null || userLng === null) return null;
  
  // First, try to use lat/lng directly from banner (preferred)
  if (banner.lat !== undefined && banner.lng !== undefined && 
      banner.lat !== null && banner.lng !== null) {
    return calculateDistance(
      userLat,
      userLng,
      banner.lat,
      banner.lng
    );
  }
  
  // Fallback to shop.json lookup
  const shopName = extractShopNameFromImage(banner.imageUrl);
  if (!shopName) return null;
  
  const shopCoords = getShopCoordinates(shopName);
  if (!shopCoords) return null;
  
  return calculateDistance(
    userLat,
    userLng,
    shopCoords.lat,
    shopCoords.lng
  );
}

/**
 * Sort banners by distance from user location
 * @param banners - Array of banners to sort
 * @param userLat - User's latitude
 * @param userLng - User's longitude
 * @returns Sorted banners with distance information
 */
export function sortBannersByDistance(
  banners: any[],
  userLat: number | null,
  userLng: number | null
): BannerWithDistance[] {
  // If no user location, return banners as-is
  if (userLat === null || userLng === null) {
    return banners.map(banner => ({ banner }));
  }

  // Map banners with distances
  const bannersWithDistance: BannerWithDistance[] = banners.map(banner => {
    // First, try to use lat/lng directly from banner (preferred)
    if (banner.lat !== undefined && banner.lng !== undefined && 
        banner.lat !== null && banner.lng !== null) {
      const distance = calculateDistance(
        userLat,
        userLng,
        banner.lat,
        banner.lng
      );
      return { banner, distance };
    }
    
    // Fallback to shop.json lookup
    const shopName = extractShopNameFromImage(banner.imageUrl);
    if (shopName) {
      const shopCoords = getShopCoordinates(shopName);
      if (shopCoords) {
        const distance = calculateDistance(
          userLat,
          userLng,
          shopCoords.lat,
          shopCoords.lng
        );
        return { banner, distance };
      }
    }
    
    return { banner };
  });

  // Sort by distance (shops with distance first, then others)
  return bannersWithDistance.sort((a, b) => {
    // If both have distances, sort by distance
    if (a.distance !== undefined && b.distance !== undefined) {
      return a.distance - b.distance;
    }
    // If only one has distance, prioritize it
    if (a.distance !== undefined) return -1;
    if (b.distance !== undefined) return 1;
    // If neither has distance, maintain original order
    return 0;
  });
}

