import { Module } from '@nestjs/common';
import { TilesModule } from './tiles/tiles.module';

@Module({
  imports: [TilesModule],
})
export class AppModule {}
