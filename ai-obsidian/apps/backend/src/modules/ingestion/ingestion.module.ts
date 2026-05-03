import { Module } from "@nestjs/common";
import { RetrievalModule } from "../retrieval/retrieval.module";
import { IngestionController } from "./ingestion.controller";
import { IngestionService } from "./ingestion.service";

@Module({
  imports: [RetrievalModule],
  controllers: [IngestionController],
  providers: [IngestionService],
  exports: [IngestionService],
})
export class IngestionModule {}
