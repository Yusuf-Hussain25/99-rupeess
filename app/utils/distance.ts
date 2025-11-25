/**
 * Calculate the distance between two coordinates using the Haversine formula
 * @param userLat - User's latitude in degrees
 * @param userLng - User's longitude in degrees
 * @param shopLat - Shop's latitude in degrees
 * @param shopLng - Shop's longitude in degrees
 * @returns Distance in kilometers, rounded to 1 decimal place
 */
export function calculateDistance(
  userLat: number,
  userLng: number,
  shopLat: number,
  shopLng: number
): number {
  // Earth's radius in kilometers
  const R = 6371;

  // Convert degrees to radians
  const dLat = toRadians(shopLat - userLat);
  const dLng = toRadians(shopLng - userLng);

  // Haversine formula
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(userLat)) *
      Math.cos(toRadians(shopLat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  // Round to 1 decimal place
  return Math.round(distance * 10) / 10;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

