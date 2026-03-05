import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { Redis } from '@upstash/redis';

const MVT_SQL = `
WITH bounds AS (
    SELECT ST_TileEnvelope($1::int, $2::int, $3::int) AS geom
),
route_fractions AS (
    SELECT
        vehicle_id,
        metadata,
        route_geom,
        LEAST(
            GREATEST(
                (EXTRACT(EPOCH FROM (NOW() - start_time)) / 3600.0 * speed_kmh * 1000.0)
                / NULLIF(ST_Length(route_geom::geography), 0),
                0.0
            ),
            1.0
        ) AS fraction
    FROM fleet_routes
    WHERE route_geom && ST_Transform((SELECT geom FROM bounds), 4326)
),
interpolated_points AS (
    SELECT
        vehicle_id,
        metadata,
        ST_LineInterpolatePoint(route_geom, fraction) AS current_point_4326,
        degrees(
            ST_Azimuth(
                ST_LineInterpolatePoint(route_geom, GREATEST(fraction - 0.005, 0)),
                ST_LineInterpolatePoint(route_geom, LEAST(fraction + 0.005, 1))
            )
        ) AS bearing
    FROM route_fractions
),
mvt_geoms AS (
    SELECT
        vehicle_id,
        metadata,
        bearing,
        ST_AsMVTGeom(
            ST_Transform(current_point_4326, 3857),
            (SELECT geom FROM bounds),
            4096,
            256,
            true
        ) AS mvt_geom
    FROM interpolated_points
    WHERE ST_Intersects(ST_Transform(current_point_4326, 3857), (SELECT geom FROM bounds))
)
SELECT ST_AsMVT(mvt_geoms.*, 'fleet_layer', 4096, 'mvt_geom') AS tile
FROM mvt_geoms
`;

const CACHE_TTL_SEC = 2;
const CACHE_KEY_PREFIX = 'mvt:fleet';

@Injectable()
export class TilesService {
  private pg: Pool;
  private redis: Redis | null = null;

  constructor() {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error('DATABASE_URL is required');
    }
    this.pg = new Pool({ connectionString: dbUrl });

    const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
    const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (redisUrl && redisToken) {
      this.redis = new Redis({ url: redisUrl, token: redisToken });
    }
  }

  async getFleetTile(z: number, x: number, y: number): Promise<Buffer> {
    const cacheKey = `${CACHE_KEY_PREFIX}:${z}:${x}:${y}`;

    if (this.redis) {
      const cached = await this.redis.get<string>(cacheKey);
      if (cached) {
        return Buffer.from(cached, 'base64');
      }
    }

    const result = await this.pg.query(MVT_SQL, [z, x, y]);
    const row = result.rows[0];
    const tileBuffer = row?.tile ?? Buffer.alloc(0);

    if (this.redis && tileBuffer.length > 0) {
      await this.redis.set(cacheKey, tileBuffer.toString('base64'), {
        ex: CACHE_TTL_SEC,
      });
    }

    return tileBuffer;
  }
}
