import { NextResponse } from "next/server";
import { geocode } from "@/lib/geocode";
import { geoSemanticSearch } from "@/lib/geo-semantic";
import { supabase } from "@/lib/db";

/**
 * GET /api/search/debug?query=คาเฟ่เงียบๆ&locationQuery=BTS อโศก
 * Returns diagnostic info: geocode result, venue count, config status.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query") ?? "คาเฟ่เงียบๆ";
  const locationQuery = searchParams.get("locationQuery") ?? "BTS อโศก";

  const diag: Record<string, unknown> = {
    query,
    locationQuery,
    hasMapboxToken: !!process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN,
    hasGeminiKey: !!(process.env.GOOGLE_AI_API_KEY ?? process.env.GEMINI_API_KEY),
    hasSupabase: !!supabase,
  };

  try {
    const coords = await geocode(locationQuery);
    diag.geocode = coords
      ? { lat: coords.lat, lng: coords.lng }
      : { error: "Could not geocode location" };

    if (!coords) {
      return NextResponse.json(diag);
    }

    const venues = await geoSemanticSearch({
      queryText: query,
      lat: coords.lat,
      lng: coords.lng,
      radiusMeters: 5000,
      matchLimit: 5,
    });

    diag.venueCount = venues.length;
    diag.venues = venues.map((v) => ({ name: v.name, distance_meters: v.distance_meters }));
  } catch (err) {
    diag.error = err instanceof Error ? err.message : String(err);
  }

  return NextResponse.json(diag);
}
