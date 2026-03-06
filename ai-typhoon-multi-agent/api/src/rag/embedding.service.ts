import { Injectable } from '@nestjs/common';
import {
  GoogleGenerativeAI,
  TaskType,
  type EmbedContentRequest,
} from '@google/generative-ai';

const EMBEDDING_DIM = 768;

@Injectable()
export class EmbeddingService {
  private readonly model: ReturnType<
    GoogleGenerativeAI['getGenerativeModel']
  > | null;

  constructor() {
    const apiKey =
      process.env.GOOGLE_AI_API_KEY ?? process.env.GEMINI_API_KEY;
    const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
    this.model = genAI?.getGenerativeModel({ model: 'gemini-embedding-001' }) ?? null;
  }

  async embedQuery(text: string): Promise<number[]> {
    return this.embedWithTaskType(text, TaskType.RETRIEVAL_QUERY);
  }

  private async embedWithTaskType(
    text: string,
    taskType: TaskType.RETRIEVAL_QUERY | TaskType.RETRIEVAL_DOCUMENT,
  ): Promise<number[]> {
    if (!this.model) {
      throw new Error('GOOGLE_AI_API_KEY or GEMINI_API_KEY is not set');
    }

    const request: EmbedContentRequest & { outputDimensionality?: number } = {
      content: { role: 'user', parts: [{ text }] },
      taskType,
      outputDimensionality: EMBEDDING_DIM,
    };

    const result = await this.model.embedContent(request);
    const values = result.embedding.values;

    if (!values || values.length !== EMBEDDING_DIM) {
      throw new Error(
        `Expected ${EMBEDDING_DIM}-dimensional embedding, got ${values?.length ?? 0}`,
      );
    }

    return values;
  }
}
