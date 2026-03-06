import { Module } from '@nestjs/common';
import { AnalyzerService } from './analyzer.service';
import { GeneratorService } from './generator.service';
import { GuardrailService } from './guardrail.service';

@Module({
  providers: [AnalyzerService, GeneratorService, GuardrailService],
  exports: [AnalyzerService, GeneratorService, GuardrailService],
})
export class AgentsModule {}
