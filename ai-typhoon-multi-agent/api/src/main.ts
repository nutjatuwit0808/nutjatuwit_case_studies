import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env from api/ and project root
config({ path: resolve(__dirname, '../.env') });
config({ path: resolve(__dirname, '../.env.local') });
config({ path: resolve(__dirname, '../../.env') });
config({ path: resolve(__dirname, '../../.env.local') });

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const port = process.env.API_PORT || 3001;
  await app.listen(port);
  console.log(`Omni-Typhoon API running on http://localhost:${port}`);
}

bootstrap();
