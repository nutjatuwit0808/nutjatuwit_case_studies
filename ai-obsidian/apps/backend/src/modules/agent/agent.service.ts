import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { askAgentSchema, summarizeSchema } from "@ai-obsidian/shared";
import type { AppEnv } from "../../config/env.validation";
import {
  AGENT_SYSTEM_PROMPT,
  CONTEXT_SEPARATOR_ASK,
  CONTEXT_SEPARATOR_SUMMARIZE,
  FALLBACK_CONTEXT_MAX_CHARS,
} from "./agent.constants";
import { buildApiKeyMissingAnswer, chunksToCitations, joinChunkContents } from "./agent.helpers";
import { VectorStoreService } from "../retrieval/vector-store.service";

@Injectable()
export class AgentService {
  /** property injection: ทำงานร่วม tsx ที่ไม่ emit constructor metadata ได้สะดวก */
  @Inject(VectorStoreService)
  private readonly vectorStore!: VectorStoreService;

  @Inject(ConfigService)
  private readonly config!: ConfigService<AppEnv, true>;

  /** ตอบคำถามจาก chunk ที่ค้นได้ พร้อม citation */
  async ask(payload: unknown) {
    const input = askAgentSchema.parse(payload);
    const chunks = this.vectorStore.search(input.question, input.topK);
    const context = joinChunkContents(chunks, CONTEXT_SEPARATOR_ASK);
    const citations = chunksToCitations(chunks);

    const answer = await this.generateAnswer(input.question, context);
    return { answer, citations, chunkCount: chunks.length };
  }

  /** สรุปโน้ตหนึ่งไฟล์จาก chunk ทั้งหมดของ path นั้น */
  async summarize(payload: unknown) {
    const input = summarizeSchema.parse(payload);
    const chunks = this.vectorStore.findByNotePath(input.notePath);
    const context = joinChunkContents(chunks, CONTEXT_SEPARATOR_SUMMARIZE);
    const question = `ช่วยสรุปโน้ตไฟล์ ${input.notePath} ให้เป็น bullet points สำหรับ software engineer`;
    const answer = await this.generateAnswer(question, context);
    return { answer, citations: chunks.map((chunk) => chunk.chunkId) };
  }

  /** เรียก Gemini ถ้ามี API key; ไม่มีก็คืนข้อความ fallback สำหรับสาธิต */
  private async generateAnswer(question: string, context: string) {
    const apiKey = this.config.get("GOOGLE_API_KEY", { infer: true });
    if (!apiKey) {
      return buildApiKeyMissingAnswer(question, context, FALLBACK_CONTEXT_MAX_CHARS);
    }

    const model = this.config.get("GEMINI_MODEL", { infer: true });
    const llm = new ChatGoogleGenerativeAI({
      apiKey,
      model,
      temperature: 0.1,
    });

    const completion = await llm.invoke([
      { role: "system", content: AGENT_SYSTEM_PROMPT },
      {
        role: "user",
        content: `คำถาม: ${question}\n\nContext:\n${context}`,
      },
    ]);

    return completion.text;
  }
}
