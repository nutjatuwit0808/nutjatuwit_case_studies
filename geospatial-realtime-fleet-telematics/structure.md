# Fleet MVT: Dynamic MVT Engine for Fleet Telematics - Project Structure

## Overview

ระบบจำลองและแสดงผลยานพาหนะ 200,000 คันบนแผนที่แบบ Real-time โดยไม่ใช้การ Update State ลง Database แต่ใช้คณิตศาสตร์เชิงพื้นที่ (Spatial Interpolation) คำนวณตำแหน่งแบบ On-the-fly และเสิร์ฟเป็น Vector Tile (MVT / Protobuf)

**Tech Stack:** Supabase (PostgreSQL + PostGIS), Upstash Redis, NestJS, Next.js 16, Mapbox GL JS

## Directory Structure

```
geospatial-realtime-fleet-telematics/
├── api/                    # NestJS backend - Tile API
│   ├── src/
│   │   ├── tiles/
│   │   │   ├── tiles.controller.ts
│   │   │   ├── tiles.service.ts
│   │   │   └── tiles.module.ts
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── package.json
│   ├── nest-cli.json
│   └── tsconfig.json
├── dashboard/              # Next.js + Mapbox frontend
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── FleetMap.tsx
│   │   └── MapErrorOverlay.tsx
│   ├── hooks/
│   │   └── useMapboxMap.ts
│   ├── lib/
│   │   └── map-config.ts
│   └── package.json
├── seed/                   # Route data generator
│   ├── generate_routes.py
│   └── requirements.txt
├── supabase/
│   └── migrations/
│       └── 001_fleet_routes.sql
├── run.sh               # รัน API + Dashboard พร้อมกัน
├── structure.md
├── README.md
└── .env.example
```

## Data Flow

```
Dashboard (Mapbox) --GET /api/tiles/fleet/{z}/{x}/{y}.pbf--> NestJS API
                                                                    |
                                    +-------------------------------+-------------------------------+
                                    |                               |                               |
                              Cache Hit?                        Cache Miss                    Return Buffer
                                    |                               |
                              Upstash Redis                   Supabase (PostGIS)
                                    |                               |
                                    |                         MVT SQL Query
                                    |                         (Spatial Interpolation)
                                    |                               |
                                    +-------------------------------+-------------------------------+
                                                                    |
                                                              Store in Upstash (2s TTL)
                                                                    |
                                                              Return PBF to Client
```

## Key Dependencies

| Component | Dependencies |
|-----------|--------------|
| api | @nestjs/core, pg, @upstash/redis |
| dashboard | next, react, mapbox-gl |
| seed | psycopg2-binary, shapely |
