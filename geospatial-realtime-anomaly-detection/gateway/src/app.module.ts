import { Module } from '@nestjs/common';
import { KafkaModule } from './kafka/kafka.module';
import { WebSocketModule } from './websocket/websocket.module';

@Module({
  imports: [KafkaModule, WebSocketModule],
})
export class AppModule {}
