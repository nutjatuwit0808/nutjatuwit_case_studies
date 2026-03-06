import { Module } from '@nestjs/common';
import { VocService } from './voc.service';

@Module({
  providers: [VocService],
  exports: [VocService],
})
export class VocModule {}
