import { Injectable } from "@nestjs/common";
import type { NoteChunk } from "@ai-obsidian/shared";
import { buildChunkLexicalHaystack, scoreLexicalOverlap, tokenizeQuestionTerms } from "./vector-search.util";

@Injectable()
export class VectorStoreService {
  private chunks: NoteChunk[] = [];

  /** แทนที่ chunk ทั้งหมดหลัง ingest รอบใหม่ */
  replaceAll(chunks: NoteChunk[]) {
    this.chunks = chunks;
  }

  /**
   * ค้นหา chunk ที่เกี่ยวข้องแบบง่าย: นับว่าคำในคำถามปรากฏใน title+content กี่คำ
   * เหมาะกับ workshop ที่ไม่ต้องพึ่ง embedding service
   */
  search(question: string, topK: number): NoteChunk[] {
    const terms = tokenizeQuestionTerms(question);

    return this.chunks
      .map((chunk) => {
        const haystack = buildChunkLexicalHaystack(chunk);
        const score = scoreLexicalOverlap(haystack, terms);
        return { chunk, score };
      })
      .filter((row) => row.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map((row) => row.chunk);
  }

  /** ดึง chunk ทั้งหมดของ path โน้ตเดียว (ใช้กับ summarize) */
  findByNotePath(notePath: string): NoteChunk[] {
    return this.chunks.filter((chunk) => chunk.notePath === notePath);
  }

  count(): number {
    return this.chunks.length;
  }
}
