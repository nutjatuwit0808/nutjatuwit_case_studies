import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const port = process.env.GATEWAY_PORT || 3001;
  await app.listen(port);
  console.log(`Gateway running on http://localhost:${port}`);
}

bootstrap();
