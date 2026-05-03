import type { Citation } from "@ai-obsidian/shared";

/** แปลง citations เป็นข้อความบรรทัดละหนึ่ง citation สำหรับแสดงใน `<pre>` */
export function formatCitationsPlainText(citations: Citation[]): string {
  if (citations.length === 0) {
    return "ยังไม่มี citation";
  }
  return citations.map((item) => `- ${item.chunkId} (${item.notePath})`).join("\n");
}
