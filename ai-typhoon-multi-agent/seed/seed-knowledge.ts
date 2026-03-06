/**
 * Seed script for knowledge base (คู่มือแก้ปัญหา)
 * Run: npx tsx seed/seed-knowledge.ts
 * Requires: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GOOGLE_AI_API_KEY or GEMINI_API_KEY
 */

import "./load-env";
import { createClient } from "@supabase/supabase-js";
import { embedDocument } from "./embedding";
import { KNOWLEDGE_BASE_DOCS } from "./data/knowledge-base";

const supabaseUrl =
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const geminiKey =
  process.env.GOOGLE_AI_API_KEY ?? process.env.GEMINI_API_KEY;

if (!supabaseUrl || !supabaseKey || !geminiKey) {
  console.error(
    "Missing env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GOOGLE_AI_API_KEY or GEMINI_API_KEY"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log("Seeding knowledge base...");

  for (const doc of KNOWLEDGE_BASE_DOCS) {
    const embedding = await embedDocument(doc.content);

    const { error } = await supabase.from("knowledge_base").insert({
      content: doc.content,
      embedding,
      metadata: doc.metadata,
    });

    if (error) {
      console.error(`  Failed:`, error.message);
      continue;
    }
    console.log(`  Inserted: ${doc.metadata.topic}`);
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
