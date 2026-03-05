import { Controller, Get, Param, ParseIntPipe, Res } from '@nestjs/common';
import { Response } from 'express';
import { TilesService } from './tiles.service';

@Controller('api/tiles/fleet')
export class TilesController {
  constructor(private readonly tilesService: TilesService) {}

  @Get(':z/:x/:y.pbf')
  async getFleetTile(
    @Param('z', ParseIntPipe) z: number,
    @Param('x', ParseIntPipe) x: number,
    @Param('y', ParseIntPipe) y: number,
    @Res() res: Response,
  ): Promise<void> {
    const buffer = await this.tilesService.getFleetTile(z, x, y);
    res.setHeader('Content-Type', 'application/x-protobuf');
    res.setHeader('Cache-Control', 'no-cache, max-age=0');
    res.send(buffer);
  }
}
