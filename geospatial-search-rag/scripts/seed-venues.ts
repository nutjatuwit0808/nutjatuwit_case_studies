/**
 * Seed script for venues.
 * Run with: npm run seed (loads .env.local via dotenv)
 * Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GOOGLE_AI_API_KEY or GEMINI_API_KEY
 */

import "./load-env";
import { createClient } from "@supabase/supabase-js";
import { embedDocument } from "../lib/embedding";
import { SEED_VENUES } from "../data/seed-venues";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const geminiKey =
  process.env.GOOGLE_AI_API_KEY ?? process.env.GEMINI_API_KEY;

if (!supabaseUrl || !supabaseKey || !geminiKey) {
  console.error(
    "Missing env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GOOGLE_AI_API_KEY or GEMINI_API_KEY"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log("Seeding venues...");

  for (const v of SEED_VENUES) {
    const textToEmbed = `${v.name} ${v.description}`;
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
      console.error(`  Failed ${v.name}:`, error.message);
      continue;
    }
    console.log(`  Inserted: ${v.name} (${data})`);
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
