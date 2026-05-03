import { NOTE_CHUNK_LINE_COUNT } from "./ingestion.constants";

/** สร้าง chunkId แบบเดียวกันทั้ง ingest และอ้างอิงใน citation */
export function makeChunkId(notePath: string, oneBasedIndex: number): string {
  return `${notePath}::${oneBasedIndex}`;
}

/** ประกอบข้อความหนึ่ง chunk พร้อมหัวข้อและ path อ้างอิง */
function formatChunkBlock(title: string, notePath: string, body: string): string {
  return `# ${title}\n> note: ${notePath}\n${body}`;
}

/**
 * แบ่งเนื้อหาโน้ตเป็นหลายช่วง (ตัดบรรทัดว่างออก แล้วรวมทีละ NOTE_CHUNK_LINE_COUNT บรรทัด)
 * ถ้าไม่มีบรรทัดที่ไม่ว่าง จะคืนช่วงเดียวที่มีทั้งก้อน
 */
export function splitNoteIntoChunkTexts(notePath: string, title: string, content: string): string[] {
  const lines = content.split("\n").filter((line) => line.trim().length > 0);
  const chunks: string[] = [];

  for (let i = 0; i < lines.length; i += NOTE_CHUNK_LINE_COUNT) {
    const body = lines.slice(i, i + NOTE_CHUNK_LINE_COUNT).join("\n");
    chunks.push(formatChunkBlock(title, notePath, body));
  }

  return chunks.length > 0 ? chunks : [`# ${title}\n${content}`];
}
