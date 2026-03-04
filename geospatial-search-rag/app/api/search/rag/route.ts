import { NextResponse } from "next/server";
import { z } from "zod";
import { resolveSearchCenter } from "@/lib/geocode";
import { geoSemanticSearch } from "@/lib/geo-semantic";
import { generateRagResponse } from "@/lib/rag";
import { jsonError, getErrorMessage } from "@/lib/api-utils";

const searchSchema = z.object({
  query: z.string().min(1),
  lat: z.number().optional(),
  lng: z.number().optional(),
  locationQuery: z.string().optional(),
  radiusMeters: z.number().positive().optional(),
  matchLimit: z.number().int().positive().max(20).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = searchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { query, lat, lng, locationQuery, radiusMeters, matchLimit } =
      parsed.data;

    const center = await resolveSearchCenter({ lat, lng, locationQuery });

    if (!center) {
      return jsonError("Could not geocode location", 400, {
        hint: "Try adding 'Bangkok' or use English (e.g. 'Asok BTS Bangkok'). Ensure NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN is set.",
      });
    }

    const venues = await geoSemanticSearch({
      queryText: query,
      lat: center.lat,
      lng: center.lng,
      radiusMeters,
      matchLimit,
    });

    const ragResponse = await generateRagResponse(query, venues);

    return NextResponse.json({
      venues,
      ragResponse,
      meta: {
        count: venues.length,
        hint:
          venues.length === 0
            ? "No venues in radius. Run POST /api/seed to add sample data, or try a different location/query."
            : undefined,
      },
    });
  } catch (err) {
    console.error("RAG search error:", err);
    return jsonError(getErrorMessage(err, "RAG search failed"), 500);
  }
}
