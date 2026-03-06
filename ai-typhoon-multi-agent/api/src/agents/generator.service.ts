import { Injectable } from '@nestjs/common';
import { TyphoonApiService } from '../llm/typhoon-api.service';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { extractTextContent } from '../common/llm.utils';

@Injectable()
export class GeneratorService {
  constructor(private readonly typhoon: TyphoonApiService) {}

  async *streamResponse(
    maskedMessage: string,
    ragContext: string,
    sentiment: string,
  ): AsyncGenerator<string, void, unknown> {
    const toneGuidance =
      sentiment === 'negative'
        ? 'ลูกค้ามีอารมณ์ลบ กรุณาขออภัยและแสดงความเข้าใจก่อน แล้วค่อยให้คำแนะนำ'
        : sentiment === 'positive'
          ? 'ลูกค้ามีอารมณ์ดี ตอบอย่างเป็นมิตรและกระชับ'
          : 'ตอบอย่างเป็นกลางและเป็นมืออาชีพ';

    const systemPrompt = `คุณเป็นพนักงาน Customer Support ที่ตอบคำถามลูกค้าด้วยความเห็นอกเห็นใจ
${toneGuidance}

คำตอบต้องอ้างอิงจาก Context (คู่มือแก้ปัญหา) ที่ให้มาเท่านั้น ห้ามแต่งเรื่องหรือสัญญาสิ่งที่ไม่มีใน Context
ตอบเป็นภาษาไทย กระชับ และเป็นมิตร`;

    const userPrompt = `Context (คู่มือแก้ปัญหา):
${ragContext || '(ไม่มีข้อมูลที่เกี่ยวข้อง)'}

คำถามลูกค้า: ${maskedMessage}

ตอบคำถามลูกค้าตาม Context ข้างต้น:`;

    const llm = this.typhoon.getModel();
    const stream = await llm.stream([
      new SystemMessage(systemPrompt),
      new HumanMessage(userPrompt),
    ]);

    for await (const chunk of stream) {
      const text = extractTextContent(chunk.content);
      if (text) yield text;
    }
  }
}
