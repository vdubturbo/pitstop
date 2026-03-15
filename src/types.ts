export interface Location {
  label: string;
  coordinates: [number, number]; // [lng, lat]
}

export interface RouteState {
  origin: Location | null;
  destination: Location | null;
  routeGeometry: GeoJSON.LineString | null;
  isRouteActive: boolean;
}
