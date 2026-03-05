/**
 * Kafka topic names and broker configuration.
 * Centralized to avoid duplication across services.
 */
export const TOPIC_GPS = 'vehicle-gps-stream';
export const TOPIC_ALERTS = 'vehicle-alerts';

export const getKafkaBrokers = (): string[] =>
  (process.env.KAFKA_BROKERS || 'localhost:9092').split(',');
