import { Module, Global } from '@nestjs/common';
import { OllamaService } from './ollama.service';
import { TyphoonApiService } from './typhoon-api.service';

@Global()
@Module({
  providers: [OllamaService, TyphoonApiService],
  exports: [OllamaService, TyphoonApiService],
})
export class LlmModule {}
