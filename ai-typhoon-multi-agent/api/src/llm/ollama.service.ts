import { Injectable } from '@nestjs/common';
import { ChatOllama } from '@langchain/ollama';

@Injectable()
export class OllamaService {
  private readonly llm: ChatOllama;

  constructor() {
    const baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    const model = process.env.OLLAMA_MODEL || 'scb10x/typhoon2.1-gemma3-4b';

    this.llm = new ChatOllama({
      baseUrl,
      model,
      temperature: 0.3,
    });
  }

  getModel(): ChatOllama {
    return this.llm;
  }
}
