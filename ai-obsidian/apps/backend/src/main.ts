import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { DEFAULT_BACKEND_HTTP_PORT } from "@ai-obsidian/shared";
import { AppModule } from "./modules/app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(DEFAULT_BACKEND_HTTP_PORT);
}

void bootstrap();
