import { GoogleGenerativeAI } from "@google/generative-ai";
import type { VenueSearchResult } from "@/types/venue";

const apiKey =
  process.env.GOOGLE_AI_API_KEY ?? process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
const model = genAI?.getGenerativeModel({ model: "gemini-2.5-flash" });

function formatVenuesForContext(venues: VenueSearchResult[]): string {
  return venues
    .map(
      (v, i) =>
        `${i + 1}. ${v.name} - ${v.description ?? "(ไม่มีคำอธิบาย)"} (ระยะ ${Math.round(v.distance_meters)} ม.)`
    )
    .join("\n");
}

/**
 * Generate RAG response using retrieved venues as context.
 */
export async function generateRagResponse(
  query: string,
  venues: VenueSearchResult[]
): Promise<string> {
  if (!model) {
    throw new Error("GOOGLE_AI_API_KEY or GEMINI_API_KEY is not set");
  }

  if (venues.length === 0) {
    return "ไม่พบสถานที่ที่ตรงกับคำค้นหาในบริเวณนี้ กรุณาลองขยายรัศมีการค้นหาหรือเปลี่ยนคำค้นหา";
  }

  const systemPrompt = `คุณเป็นผู้ช่วยแนะนำสถานที่ในกรุงเทพฯ ตอบคำถามโดยอ้างอิงจากรายการสถานที่ที่ให้มาเท่านั้น ใช้ภาษาที่เป็นกันเองและกระชับ`;

  const userPrompt = `สถานที่ที่ค้นเจอ:
${formatVenuesForContext(venues)}

คำถาม: ${query}

ให้ตอบโดยอ้างอิงจาก Context เท่านั้น และบอกเหตุผลสั้นๆ`;

  const result = await model.generateContent([systemPrompt, userPrompt]);
  const response = result.response;

  if (!response || !response.text) {
    throw new Error("Failed to generate RAG response");
  }

  return response.text();
}
