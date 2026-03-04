import { NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import { embedDocument } from "@/lib/embedding";
import { buildVenueTextForEmbedding } from "@/lib/utils";
import { jsonError, getErrorMessage } from "@/lib/api-utils";
import { SEED_VENUES } from "@/data/seed-venues";

export async function POST() {
  try {
    if (!supabase) {
      return jsonError("Supabase is not configured", 500);
    }

    const results: Array<{ name: string; success: boolean; id?: string; error?: string }> = [];

    for (const v of SEED_VENUES) {
      try {
        const textToEmbed = buildVenueTextForEmbedding(v.name, v.description);
        const embedding = await embedDocument(textToEmbed);

        const { data, error } = await supabase.rpc("insert_venue", {
          p_name: v.name,
          p_description: v.description,
          p_category: v.category,
          p_lng: v.lng,
          p_lat: v.lat,
          p_embedding: embedding,
        });

        if (error) {
          results.push({ name: v.name, success: false, error: error.message });
        } else {
          results.push({ name: v.name, success: true, id: data });
        }
      } catch (err) {
        results.push({
          name: v.name,
          success: false,
          error: getErrorMessage(err, "Unknown error"),
        });
      }
    }

    return NextResponse.json({ results });
  } catch (err) {
    console.error("Seed error:", err);
    return jsonError(getErrorMessage(err, "Seed failed"), 500);
  }
}
