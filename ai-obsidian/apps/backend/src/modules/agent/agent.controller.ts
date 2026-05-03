import { Body, Controller, Get, Inject, Post } from "@nestjs/common";
import { AgentService } from "./agent.service";
import { VectorStoreService } from "../retrieval/vector-store.service";

/** REST สำหรับ agent และ health ที่อ่านจำนวน chunk จาก vector store */
@Controller("agent")
export class AgentController {
  constructor(
    @Inject(AgentService) private readonly agentService: AgentService,
    @Inject(VectorStoreService) private readonly vectorStore: VectorStoreService,
  ) {}

  @Get("health")
  health() {
    return { ok: true, chunkCount: this.vectorStore.count() };
  }

  @Post("ask")
  ask(@Body() body: unknown) {
    return this.agentService.ask(body);
  }

  @Post("summarize")
  summarize(@Body() body: unknown) {
    return this.agentService.summarize(body);
  }
}
