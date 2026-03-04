import { supabase } from "./db";
import { embedText } from "./embedding";
import {
  DEFAULT_RADIUS_METERS,
  DEFAULT_MATCH_LIMIT,
} from "@/lib/search-config";
import type { VenueSearchResult } from "@/types/venue";

export interface GeoSemanticSearchParams {
  queryText: string;
  lat: number;
  lng: number;
  radiusMeters?: number;
  matchLimit?: number;
}

/**
 * Run geo_semantic_search via Supabase RPC.
 */
export async function geoSemanticSearch(
  params: GeoSemanticSearchParams
): Promise<VenueSearchResult[]> {
  if (!supabase) {
    throw new Error("Supabase is not configured");
  }

  const {
    queryText,
    lat,
    lng,
    radiusMeters = DEFAULT_RADIUS_METERS,
    matchLimit = DEFAULT_MATCH_LIMIT,
  } = params;

  const embedding = await embedText(queryText);

  const { data, error } = await supabase.rpc("geo_semantic_search", {
    query_embedding: embedding,
    target_lat: lat,
    target_lng: lng,
    radius_meters: radiusMeters,
    match_limit: matchLimit,
  });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row: VenueSearchResult) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    distance_meters: Number(row.distance_meters),
    similarity: Number(row.similarity),
    lat: Number(row.lat),
    lng: Number(row.lng),
  }));
}
