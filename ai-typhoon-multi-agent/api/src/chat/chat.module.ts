import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { AgentsModule } from '../agents/agents.module';
import { RagModule } from '../rag/rag.module';
import { VocModule } from '../voc/voc.module';

@Module({
  imports: [AgentsModule, RagModule, VocModule],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
