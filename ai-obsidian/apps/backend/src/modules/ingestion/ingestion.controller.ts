import { Body, Controller, Inject, Post } from "@nestjs/common";
import { ingestVaultBodySchema } from "@ai-obsidian/shared";
import { IngestionService } from "./ingestion.service";

/** ingest Obsidian vault เข้า vector store ใน memory */
@Controller("ingestion")
export class IngestionController {
  constructor(
    @Inject(IngestionService) private readonly ingestionService: IngestionService,
  ) {}

  @Post("vault")
  async ingestVault(@Body() body: unknown) {
    const parsed = ingestVaultBodySchema.parse(body);
    const vaultPath = parsed.vaultPath ?? this.ingestionService.resolveDefaultVaultPath();
    const result = await this.ingestionService.ingestVault(vaultPath);
    return { vaultPath, ...result };
  }
}
