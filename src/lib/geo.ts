// Haversine distance in miles between two [lng, lat] points
export function haversineDistance(
  a: [number, number],
  b: [number, number]
): number {
  const R = 3958.8; // Earth radius in miles
  const dLat = toRad(b[1] - a[1]);
  const dLng = toRad(b[0] - a[0]);
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h =
    sinLat * sinLat +
    Math.cos(toRad(a[1])) * Math.cos(toRad(b[1])) * sinLng * sinLng;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

// Find the index of the nearest point on a route coordinate array to a given point
export function nearestPointOnRoute(
  point: [number, number],
  routeCoords: [number, number][]
): { index: number; distance: number } {
  let minDist = Infinity;
  let minIndex = 0;

  for (let i = 0; i < routeCoords.length; i++) {
    const d = haversineDistance(point, routeCoords[i]);
    if (d < minDist) {
      minDist = d;
      minIndex = i;
    }
  }

  return { index: minIndex, distance: minDist };
}

// Calculate cumulative distance along route from startIndex to endIndex (in miles)
export function distanceAlongRoute(
  routeCoords: [number, number][],
  startIndex: number,
  endIndex: number
): number {
  let total = 0;
  const from = Math.min(startIndex, endIndex);
  const to = Math.max(startIndex, endIndex);
  for (let i = from; i < to; i++) {
    total += haversineDistance(routeCoords[i], routeCoords[i + 1]);
  }
  return total;
}

// Find the minimum distance from a point to any segment of the route (simplified: checks each vertex)
export function minDistanceToRoute(
  point: [number, number],
  routeCoords: [number, number][]
): { distance: number; nearestIndex: number } {
  let minDist = Infinity;
  let nearestIndex = 0;

  for (let i = 0; i < routeCoords.length; i++) {
    const d = haversineDistance(point, routeCoords[i]);
    if (d < minDist) {
      minDist = d;
      nearestIndex = i;
    }
  }

  return { distance: minDist, nearestIndex };
}

// Interpolate a point along the route at a given fraction (0-1) of total length
export function interpolateAlongRoute(
  routeCoords: [number, number][],
  fraction: number
): [number, number] {
  if (fraction <= 0) return routeCoords[0];
  if (fraction >= 1) return routeCoords[routeCoords.length - 1];

  const totalDist = distanceAlongRoute(routeCoords, 0, routeCoords.length - 1);
  const targetDist = totalDist * fraction;

  let accumulated = 0;
  for (let i = 0; i < routeCoords.length - 1; i++) {
    const segDist = haversineDistance(routeCoords[i], routeCoords[i + 1]);
    if (accumulated + segDist >= targetDist) {
      const segFraction = (targetDist - accumulated) / segDist;
      return [
        routeCoords[i][0] + (routeCoords[i + 1][0] - routeCoords[i][0]) * segFraction,
        routeCoords[i][1] + (routeCoords[i + 1][1] - routeCoords[i][1]) * segFraction,
      ];
    }
    accumulated += segDist;
  }

  return routeCoords[routeCoords.length - 1];
}
