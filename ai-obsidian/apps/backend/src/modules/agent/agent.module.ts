import { Module } from "@nestjs/common";
import { RetrievalModule } from "../retrieval/retrieval.module";
import { AgentController } from "./agent.controller";
import { AgentService } from "./agent.service";

@Module({
  imports: [RetrievalModule],
  controllers: [AgentController],
  providers: [AgentService],
})
export class AgentModule {}
