import { Injectable } from '@nestjs/common';
import { OllamaService } from '../llm/ollama.service';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { z } from 'zod';
import { extractTextContent, parseJsonFromLlmResponse } from '../common/llm.utils';

const GuardrailOutputSchema = z.object({
  pass: z.boolean(),
  reason: z.string().optional(),
});

export type GuardrailOutput = z.infer<typeof GuardrailOutputSchema>;

const SYSTEM_PROMPT = `คุณเป็น Guardrail ตรวจสอบคำตอบของ AI ก่อนส่งให้ลูกค้า
ตอบเป็น JSON เท่านั้น: { "pass": true/false, "reason": "เหตุผลสั้นๆ ถ้า pass=false" }

เกณฑ์การตรวจ:
1. คำตอบต้องอิงจาก Context/RAG ที่ให้มา ไม่หลุดประเด็นหรือแต่งเรื่อง
2. ห้ามสัญญาเกินจริง (เช่น "จะแก้ให้ภายใน 1 ชม." เมื่อไม่มีในคู่มือ)
3. ห้ามมีคำหยาบหรือไม่เหมาะสม

pass: true = ปล่อยผ่าน, false = ไม่ผ่าน ต้องใช้ fallback`;

@Injectable()
export class GuardrailService {
  constructor(private readonly ollama: OllamaService) {}

  async evaluate(
    customerQuestion: string,
    agentResponse: string,
  ): Promise<GuardrailOutput> {
    const llm = this.ollama.getModel();
    const response = await llm.invoke([
      new SystemMessage(SYSTEM_PROMPT),
      new HumanMessage(
        `คำถามลูกค้า: ${customerQuestion}\n\nคำตอบของ AI: ${agentResponse}\n\nตรวจสอบและตอบ JSON:`,
      ),
    ]);

    const content = extractTextContent(response.content);
    const jsonStr = parseJsonFromLlmResponse(content);

    try {
      const parsed = JSON.parse(jsonStr);
      return GuardrailOutputSchema.parse(parsed);
    } catch (e) {
      return { pass: false, reason: 'Failed to parse guardrail output' };
    }
  }
}
