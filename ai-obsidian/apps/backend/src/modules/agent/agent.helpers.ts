import type { Citation, NoteChunk } from "@ai-obsidian/shared";
import { CITATION_PREVIEW_MAX_CHARS } from "@ai-obsidian/shared";

/** รวมเนื้อหา chunk เป็นข้อความเดียวสำหรับส่งให้โมเดล */
export function joinChunkContents(chunks: NoteChunk[], separator: string): string {
  return chunks.map((c) => c.content).join(separator);
}

/** แปลง chunk ที่ค้นได้เป็นรายการ citation สำหรับแสดงที่มา */
export function chunksToCitations(
  chunks: NoteChunk[],
  previewMaxChars: number = CITATION_PREVIEW_MAX_CHARS,
): Citation[] {
  return chunks.map((chunk) => ({
    notePath: chunk.notePath,
    chunkId: chunk.chunkId,
    preview: chunk.content.slice(0, previewMaxChars),
  }));
}

/** ข้อความตอบเมื่อไม่มี GOOGLE_API_KEY (โหมดสาธิต workshop) */
export function buildApiKeyMissingAnswer(question: string, context: string, contextMaxChars: number): string {
  return [
    "GOOGLE_API_KEY ยังไม่ถูกตั้งค่า จึงใช้โหมด fallback สำหรับ workshop",
    `คำถาม: ${question}`,
    "สรุปจาก context ที่ค้นเจอ:",
    context.slice(0, contextMaxChars),
  ].join("\n");
}
