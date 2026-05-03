import type { NoteChunk } from "@ai-obsidian/shared";

/** รวม title + content เป็นข้อความเดียว (lower) สำหรับนับ lexical overlap กับคำถาม */
export function buildChunkLexicalHaystack(chunk: NoteChunk): string {
  return `${chunk.title}\n${chunk.content}`.toLowerCase();
}

/**
 * แยกคำถามเป็นคำค้น (lower case) สำหรับคะแนนแบบนับว่ามีคำปรากฏใน chunk หรือไม่
 */
export function tokenizeQuestionTerms(question: string): string[] {
  return question
    .toLowerCase()
    .split(/\s+/)
    .map((term) => term.trim())
    .filter(Boolean);
}

/** นับว่ามีคำใน terms กี่คำที่ปรากฏใน haystack (lower case แล้ว) */
export function scoreLexicalOverlap(haystackLower: string, terms: string[]): number {
  return terms.reduce((sum, term) => sum + (haystackLower.includes(term) ? 1 : 0), 0);
}
