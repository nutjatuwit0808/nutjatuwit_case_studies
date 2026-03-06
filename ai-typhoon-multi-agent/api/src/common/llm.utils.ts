/**
 * แปลง content จาก LLM response เป็น string
 * รองรับทั้ง string และ complex content types
 */
export function extractTextContent(content: unknown): string {
  return typeof content === 'string' ? content : '';
}

/**
 * ลบ markdown code fence และดึง JSON object ออกจาก string
 * รองรับกรณีที่ LLM ตอบกลับมาพร้อม ```json ... ``` หรือ smart quotes
 */
export function parseJsonFromLlmResponse(raw: string): string {
  const stripped = raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim();

  const jsonMatch = stripped.match(/\{[\s\S]*\}/);
  let jsonStr = jsonMatch ? jsonMatch[0] : stripped;

  // แทนที่ smart quotes ที่ทำให้ JSON.parse ล้มเหลว
  jsonStr = jsonStr.replace(/[\u201C\u201D\u201E\u201F\u2033\u2036]/g, '"');

  return jsonStr;
}
