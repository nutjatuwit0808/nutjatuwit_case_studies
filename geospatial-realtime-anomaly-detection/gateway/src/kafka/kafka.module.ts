import { Module, forwardRef } from '@nestjs/common';
import { KafkaService } from './kafka.service';
import { WebSocketModule } from '../websocket/websocket.module';

@Module({
  imports: [forwardRef(() => WebSocketModule)],
  providers: [KafkaService],
  exports: [KafkaService],
})
export class KafkaModule {}
