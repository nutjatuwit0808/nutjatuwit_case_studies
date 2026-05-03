import { DEFAULT_API_BASE_URL, DEFAULT_TOP_K, type Citation } from "@ai-obsidian/shared";

/** ฐาน URL ของ backend — ใช้ env ของ Next ถ้ามี */
export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE ?? DEFAULT_API_BASE_URL;
}

/** POST JSON ไปยัง backend — ลดการซ้ำของ fetch + headers + body */
async function postJson<T>(pathname: string, body: unknown): Promise<T> {
  const res = await fetch(`${getApiBaseUrl()}${pathname}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  return (await res.json()) as T;
}

/** คำถามเริ่มต้นในหน้าเดโว */
export const DEFAULT_WORKSHOP_QUESTION =
  "ช่วยสรุปแนวทางเขียน RFC จากโน้ตให้หน่อย";

/** คำถามตัวอย่างสำหรับทดสอบ retrieval + agent (เลือกคำให้ตรงกับเนื้อหาใน samples/vault) */
export type WorkshopSampleQuestion = { label: string; question: string };

export const WORKSHOP_SAMPLE_QUESTIONS: WorkshopSampleQuestion[] = [
  { label: "RFC", question: DEFAULT_WORKSHOP_QUESTION },
  {
    label: "On-call",
    question:
      "incident commander postmortem triage และ communication ตอน incident ทำอย่างไร",
  },
  {
    label: "REST API",
    question: "REST API versioning idempotency pagination และ error body ควรออกแบบอย่างไร",
  },
  {
    label: "Migration",
    question: "zero-downtime database migration rollback และ backfill ควรวางแผนอย่างไร",
  },
  {
    label: "Code review",
    question: "Pull Request review ควรเช็ค correctness tests performance security อย่างไร",
  },
  {
    label: "SLO",
    question: "SLO SLI error budget และ alerting ควรใช้ policy อย่างไร",
  },
  {
    label: "Secrets",
    question: "secrets rotation KMS และกรณี secret leak ควรจัดการอย่างไร",
  },
];

/** POST /ingestion/vault */
export async function postIngestVault(vaultPath: string): Promise<{
  noteCount?: number;
  chunkCount?: number;
}> {
  return postJson("/ingestion/vault", { vaultPath });
}

/** POST /agent/ask */
export async function postAskAgent(
  question: string,
  topK: number = DEFAULT_TOP_K,
): Promise<{ answer?: string; citations?: Citation[]; chunkCount?: number }> {
  return postJson("/agent/ask", { question, topK });
}
