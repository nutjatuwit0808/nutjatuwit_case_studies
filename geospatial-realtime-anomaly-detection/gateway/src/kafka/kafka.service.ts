import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Kafka, Consumer, EachMessagePayload } from 'kafkajs';
import { WebSocketGatewayService } from '../websocket/websocket.gateway';
import { TOPIC_GPS, TOPIC_ALERTS, getKafkaBrokers } from '../config/constants';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private consumer: Consumer;

  constructor(private readonly wsGateway: WebSocketGatewayService) {
    const brokers = getKafkaBrokers();
    this.kafka = new Kafka({
      clientId: 'geo-stream-gateway',
      brokers,
    });
    this.consumer = this.kafka.consumer({ groupId: 'gateway-dashboard' });
  }

  async onModuleInit() {
    await this.consumer.connect();
    await this.consumer.subscribe({
      topics: [TOPIC_GPS, TOPIC_ALERTS],
      fromBeginning: false,
    });
    await this.consumer.run({
      eachMessage: async (payload: EachMessagePayload) => {
        await this.handleMessage(payload);
      },
    });
    console.log('Kafka consumer connected to', TOPIC_GPS, TOPIC_ALERTS);
  }

  async onModuleDestroy() {
    await this.consumer.disconnect();
  }

  private async handleMessage(payload: EachMessagePayload) {
    const { topic, message } = payload;
    const value = message.value?.toString();
    if (!value) return;

    try {
      const data = JSON.parse(value);
      if (topic === TOPIC_GPS) {
        this.wsGateway.broadcastGps(data);
      } else if (topic === TOPIC_ALERTS) {
        this.wsGateway.broadcastAlert(data);
      }
    } catch (e) {
      console.error('Kafka message parse error:', e);
    }
  }
}
