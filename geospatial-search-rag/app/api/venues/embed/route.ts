import { NextResponse } from "next/server";
import { z } from "zod";
import { supabase } from "@/lib/db";
import { embedDocument } from "@/lib/embedding";
import { buildVenueTextForEmbedding } from "@/lib/utils";
import { jsonError, getErrorMessage } from "@/lib/api-utils";

const embedSchema = z.object({
  venueId: z.string().uuid().optional(),
  venueIds: z.array(z.string().uuid()).optional(),
}).refine(
  (data) => data.venueId !== undefined || (data.venueIds !== undefined && data.venueIds.length > 0),
  { message: "Provide venueId or venueIds" }
);

export async function POST(request: Request) {
  try {
    if (!supabase) {
      return jsonError("Supabase is not configured", 500);
    }

    const body = await request.json();
    const parsed = embedSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const ids = parsed.data.venueIds ?? (parsed.data.venueId ? [parsed.data.venueId] : []);

    const { data: venues, error: fetchError } = await supabase
      .from("venues")
      .select("id, name, description")
      .in("id", ids);

    if (fetchError) {
      return jsonError(fetchError.message, 500);
    }

    if (!venues?.length) {
      return jsonError("No venues found", 404);
    }

    const results: Array<{ id: string; success: boolean; error?: string }> = [];

    for (const venue of venues) {
      try {
        const textToEmbed = buildVenueTextForEmbedding(venue.name, venue.description);
        const embedding = await embedDocument(textToEmbed);

        const { error: updateError } = await supabase
          .from("venues")
          .update({ embedding })
          .eq("id", venue.id);

        if (updateError) {
          results.push({ id: venue.id, success: false, error: updateError.message });
        } else {
          results.push({ id: venue.id, success: true });
        }
      } catch (err) {
        results.push({
          id: venue.id,
          success: false,
          error: getErrorMessage(err, "Embedding failed"),
        });
      }
    }

    return NextResponse.json({ results });
  } catch (err) {
    console.error("Embed error:", err);
    return jsonError(getErrorMessage(err, "Embed failed"), 500);
  }
}
