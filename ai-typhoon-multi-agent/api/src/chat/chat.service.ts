import { Injectable } from '@nestjs/common';
import { AnalyzerService } from '../agents/analyzer.service';
import { GeneratorService } from '../agents/generator.service';
import { GuardrailService } from '../agents/guardrail.service';
import { RagService } from '../rag/rag.service';
import { VocService, type VocAnalytics } from '../voc/voc.service';
import { FALLBACK_MESSAGE } from '../common/constants';

@Injectable()
export class ChatService {
  constructor(
    private readonly analyzer: AnalyzerService,
    private readonly generator: GeneratorService,
    private readonly guardrail: GuardrailService,
    private readonly rag: RagService,
    private readonly voc: VocService,
  ) {}

  async *processMessage(
    rawMessage: string,
    sessionId: string,
  ): AsyncGenerator<string, void, unknown> {
    const analysis = await this.analyzer.analyze(rawMessage);

    await this.voc.saveInteraction(sessionId, rawMessage, analysis);

    const searchKeywords = analysis.needs_rag ? analysis.search_keywords : [];
    const matches = await this.rag.search(searchKeywords);
    const ragContext = this.rag.formatContext(matches);

    const chunks: string[] = [];
    for await (const chunk of this.generator.streamResponse(
      analysis.masked_message,
      ragContext,
      analysis.sentiment,
    )) {
      chunks.push(chunk);
    }
    const fullResponse = chunks.join('');

    const guardrailResult = await this.guardrail.evaluate(
      analysis.masked_message,
      fullResponse,
    );

    if (guardrailResult.pass) {
      for (const c of chunks) {
        yield c;
      }
    } else {
      yield FALLBACK_MESSAGE;
    }
  }

  async getAnalytics(): Promise<VocAnalytics> {
    return this.voc.getAnalytics();
  }
}
