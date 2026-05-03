import { z } from "zod";
import { DEFAULT_GEMINI_MODEL } from "@ai-obsidian/shared";

const rawEnvSchema = z.object({
  GOOGLE_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().optional(),
  // glob สำหรับ ingest — ค่าเริ่มต้นดูที่ transform (md เท่านั้น)
  VAULT_GLOB: z.string().optional(),
});

/** อ่านค่า env ดิบแล้ว trim / ใส่ค่า default โมเดล */
export const envSchema = rawEnvSchema.transform((raw) => ({
  GOOGLE_API_KEY:
    raw.GOOGLE_API_KEY && raw.GOOGLE_API_KEY.trim().length > 0
      ? raw.GOOGLE_API_KEY.trim()
      : undefined,
  GEMINI_MODEL: raw.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL,
  VAULT_GLOB: raw.VAULT_GLOB?.trim() || "**/*.md",
}));

export type AppEnv = z.infer<typeof envSchema>;

/** ใช้กับ ConfigModule.validate — ถ้าไม่ผ่านจะ throw พร้อมรายการ field */
export function validateEnv(config: Record<string, unknown>): AppEnv {
  const parsed = envSchema.safeParse(config);
  if (!parsed.success) {
    const lines = parsed.error.issues.map(
      (issue) => `  - ${issue.path.join(".") || "(root)"}: ${issue.message}`,
    );
    throw new Error(`ตรวจสอบ environment ไม่ผ่าน:\n${lines.join("\n")}`);
  }
  return parsed.data;
}
