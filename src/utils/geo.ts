/**
 * Geolocation calculations for Singapore Bus tracking
 */

// Singapore bounding box coordinates
export const SG_BOUNDS = {
  minLat: 1.15,
  maxLat: 1.48,
  minLng: 103.58,
  maxLng: 104.10,
};

/**
 * Checks if coordinates are realistically inside Singapore territory
 */
export function isWithinSingapore(lat: number, lng: number): boolean {
  return (
    lat >= SG_BOUNDS.minLat &&
    lat <= SG_BOUNDS.maxLat &&
    lng >= SG_BOUNDS.minLng &&
    lng <= SG_BOUNDS.maxLng
  );
}

/**
 * Calculates Haversine distance in meters between two lat/lng points
 */
export function calculateHaversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Calculates bearing in degrees (0 = North, 90 = East, 180 = South, 270 = West)
 */
export function calculateBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);
  const theta = Math.atan2(y, x);

  const bearing = ((theta * 180) / Math.PI + 360) % 360;
  return Math.round(bearing);
}

/**
 * Converts bearing degrees to compass label (e.g. "NE", "SSE")
 */
export function bearingToCompass(bearing: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(bearing / 45) % 8;
  return directions[index];
}

/**
 * Estimates walking time in minutes assuming 80 meters/min (4.8 km/h walking speed)
 */
export function estimateWalkingMinutes(distanceMeters: number): number {
  const mins = Math.ceil(distanceMeters / 80);
  return Math.max(1, mins);
}

/**
 * Formats distance for clean display (e.g. "85m" or "1.2km")
 */
export function formatDistance(distanceMeters: number): string {
  if (distanceMeters < 1000) {
    return `${distanceMeters}m`;
  }
  return `${(distanceMeters / 1000).toFixed(1)}km`;
}
