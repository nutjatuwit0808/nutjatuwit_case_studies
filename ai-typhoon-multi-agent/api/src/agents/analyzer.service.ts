import { Injectable } from '@nestjs/common';
import { OllamaService } from '../llm/ollama.service';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { z } from 'zod';
import { extractTextContent, parseJsonFromLlmResponse } from '../common/llm.utils';

const AnalyzerOutputSchema = z.object({
  intent: z.string().default('general'),
  sentiment: z.enum(['positive', 'neutral', 'negative']).default('neutral'),
  urgency: z.enum(['low', 'medium', 'high']).default('medium'),
  masked_message: z.string().default(''),
  needs_rag: z.boolean().default(true),
  search_keywords: z.array(z.string()).default([]),
});

export type AnalyzerOutput = z.infer<typeof AnalyzerOutputSchema>;

const SYSTEM_PROMPT = `คุณเป็นระบบวิเคราะห์ข้อความลูกค้าสำหรับฝ่าย Customer Support
หน้าที่: วิเคราะห์ข้อความดิบจากลูกค้า แล้วตอบกลับเป็น JSON เท่านั้น (ไม่มีข้อความอื่น)

กฎ:
1. intent: ประเภทคำถาม เช่น technical_support, billing, order, refund, shipping, general
2. sentiment: positive | neutral | negative
3. urgency: low | medium | high (สะกด urgency ให้ถูกต้อง)
4. masked_message: ข้อความที่ลบข้อมูลส่วนตัวแล้ว (ชื่อจริง เบอร์โทร อีเมล ให้แทนที่ด้วย [MASKED])
5. needs_rag: true ถ้าต้องค้นหาคู่มือแก้ปัญหา, false ถ้าเป็นแค่ทักทายหรือขอบคุณ
6. search_keywords: รายการคำค้นสำหรับ RAG (ภาษาไทยหรือภาษาอังกฤษ) เช่น ["Error 500", "เข้าแอพไม่ได้"]

ตอบเฉพาะ JSON object เท่านั้น ห้ามใช้ markdown (ห้าม \`\`\`json) ห้ามมีคำอธิบาย`;

@Injectable()
export class AnalyzerService {
  constructor(private readonly ollama: OllamaService) {}

  async analyze(rawMessage: string): Promise<AnalyzerOutput> {
    const llm = this.ollama.getModel();
    const response = await llm.invoke([
      new SystemMessage(SYSTEM_PROMPT),
      new HumanMessage(`วิเคราะห์ข้อความลูกค้านี้:\n\n${rawMessage}`),
    ]);

    const content = extractTextContent(response.content);
    let jsonStr = parseJsonFromLlmResponse(content);

    try {
      const parsed = JSON.parse(jsonStr);

      // Normalize urgency field — fix key aliases and value aliases
      const urgencyKeyAliases = ['urggency', 'urgence'];
      for (const alias of urgencyKeyAliases) {
        if (alias in parsed && !('urgency' in parsed)) {
          parsed.urgency = parsed[alias];
          delete parsed[alias];
          break;
        }
      }
      const urgencyValueMap: Record<string, 'low' | 'medium' | 'high'> = {
        urgent: 'high',
        critical: 'high',
        สูง: 'high',
        กลาง: 'medium',
        ต่ำ: 'low',
      };
      if (parsed.urgency && urgencyValueMap[parsed.urgency]) {
        parsed.urgency = urgencyValueMap[parsed.urgency];
      }

      // Normalize sentiment — including cases where LLM puts urgency words here
      const sentimentMap: Record<string, 'positive' | 'neutral' | 'negative'> = {
        positif: 'positive',
        positiv: 'positive',
        pos: 'positive',
        บวก: 'positive',
        เชิงบวก: 'positive',
        negatif: 'negative',
        negativ: 'negative',
        neg: 'negative',
        ลบ: 'negative',
        เชิงลบ: 'negative',
        เป็นกลาง: 'neutral',
        // urgency words mistakenly placed in sentiment → treat as negative
        urgent: 'negative',
        critical: 'negative',
        high: 'negative',
        low: 'positive',
        medium: 'neutral',
      };
      if (parsed.sentiment && sentimentMap[parsed.sentiment]) {
        parsed.sentiment = sentimentMap[parsed.sentiment];
      }

      const result = AnalyzerOutputSchema.safeParse(parsed);
      console.log('Analyzer result:', result);
      if (result.success) return result.data;

      // Fallback: strip invalid fields and let Zod use defaults
      console.warn('Analyzer Zod validation failed, using defaults:', result.error.issues);
      return AnalyzerOutputSchema.parse({});
    } catch (e) {
      console.error(`Analyzer failed to produce valid JSON: ${content}`);
      return AnalyzerOutputSchema.parse({});
    }
  }
}
