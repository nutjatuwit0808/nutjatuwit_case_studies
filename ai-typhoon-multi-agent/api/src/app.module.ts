import { Module } from '@nestjs/common';
import { LlmModule } from './llm/llm.module';
import { AgentsModule } from './agents/agents.module';
import { RagModule } from './rag/rag.module';
import { VocModule } from './voc/voc.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    LlmModule,
    AgentsModule,
    RagModule,
    VocModule,
    ChatModule,
  ],
})
export class AppModule {}
