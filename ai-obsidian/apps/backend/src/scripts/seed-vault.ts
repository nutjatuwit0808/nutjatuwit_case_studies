import { NestFactory } from "@nestjs/core";
import { AppModule } from "../modules/app.module";
import { IngestionService } from "../modules/ingestion/ingestion.service";

/** สคริปต์ CLI: seed sample vault เข้า in-memory store โดยไม่ต้องรัน HTTP server (โหลด ConfigModule รวม VAULT_GLOB) */
async function main() {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: false });
  try {
    const ingestion = app.get(IngestionService);
    const result = await ingestion.ingestVault(ingestion.resolveDefaultVaultPath());
    console.log("Vault seeded:", result);
  } finally {
    await app.close();
  }
}

void main();
