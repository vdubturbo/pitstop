export interface Location {
  label: string;
  coordinates: [number, number]; // [lng, lat]
}

export interface BathroomResult {
  name: string;
  brand: string;
  coordinates: [number, number]; // [lng, lat]
  detourMinutes: number;
  milesAhead: number;
}
