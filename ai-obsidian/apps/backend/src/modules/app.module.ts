import path from "node:path";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { validateEnv } from "../config/env.validation";
import { AgentModule } from "./agent/agent.module";
import { IngestionModule } from "./ingestion/ingestion.module";
import { RetrievalModule } from "./retrieval/retrieval.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // โหลด .env ที่รากโมโนเรปก่อน แล้วค่อยให้ apps/backend/.env ทับ (ลำดับหลังชนะ)
      envFilePath: [
        path.join(process.cwd(), "../../.env"),
        path.join(process.cwd(), ".env"),
      ],
      validate: validateEnv,
    }),
    IngestionModule,
    RetrievalModule,
    AgentModule,
  ],
})
export class AppModule {}
