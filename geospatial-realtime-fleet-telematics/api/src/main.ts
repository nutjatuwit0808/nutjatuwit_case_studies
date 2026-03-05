import { config } from 'dotenv';

// โหลด .env และ .env.local (api folder)
config();
config({ path: '.env.local', override: true });

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const port = process.env.API_PORT || 3001;
  await app.listen(port);
  console.log(`Fleet MVT API running on http://localhost:${port}`);
}

bootstrap();
