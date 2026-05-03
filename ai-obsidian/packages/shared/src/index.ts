import { z } from "zod";
import { DEFAULT_TOP_K } from "./constants";

export * from "./constants";

export const askAgentSchema = z.object({
  question: z.string().min(3),
  topK: z.number().int().min(1).max(8).default(DEFAULT_TOP_K),
});

export const summarizeSchema = z.object({
  notePath: z.string().min(3),
});

/** body ของ POST /ingestion/vault — path เป็นทางเลือก ถ้าไม่ส่งจะใช้ค่าดีฟอลต์จาก backend */
export const ingestVaultBodySchema = z.object({
  vaultPath: z.string().min(2).optional(),
});

export type AskAgentRequest = z.infer<typeof askAgentSchema>;
export type SummarizeRequest = z.infer<typeof summarizeSchema>;
export type IngestVaultBody = z.infer<typeof ingestVaultBodySchema>;

export type NoteChunk = {
  notePath: string;
  title: string;
  content: string;
  chunkId: string;
};

export type Citation = {
  notePath: string;
  chunkId: string;
  preview: string;
};
