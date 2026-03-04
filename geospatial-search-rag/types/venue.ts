export interface VenueSearchResult {
  id: string;
  name: string;
  description: string | null;
  distance_meters: number;
  similarity: number;
  lat: number;
  lng: number;
}
