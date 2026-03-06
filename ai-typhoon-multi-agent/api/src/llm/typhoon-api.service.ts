import { Injectable } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';

@Injectable()
export class TyphoonApiService {
  private llm: ChatOpenAI | null = null;

  getModel(): ChatOpenAI {
    if (!this.llm) {
      const apiKey = process.env.TYPHOON_API_KEY;
      const baseUrl =
        process.env.TYPHOON_API_URL || 'https://api.opentyphoon.ai/v1';
      const model =
        process.env.TYPHOON_MODEL || 'typhoon-v2.5-30b-a3b-instruct';

      if (!apiKey) {
        throw new Error('TYPHOON_API_KEY is required for cloud generation');
      }

      this.llm = new ChatOpenAI({
        apiKey,
        configuration: {
          baseURL: baseUrl,
        },
        model,
        temperature: 0.7,
        maxTokens: 1024,
      });
    }
    return this.llm;
  }
}
