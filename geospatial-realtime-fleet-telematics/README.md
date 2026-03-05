# Fleet MVT: Dynamic MVT Engine for Fleet Telematics

ระบบจำลองและแสดงผลยานพาหนะ 1,000 คันบนแผนที่แบบ Real-time โดยใช้ **Spatial Interpolation** คำนวณตำแหน่งแบบ On-the-fly และเสิร์ฟเป็น Vector Tile (MVT / Protobuf) — ไม่มีการ Update State ลง Database

## Tech Stack

- **Database:** Supabase (PostgreSQL + PostGIS)
- **Cache:** Upstash Redis
- **Backend:** NestJS
- **Frontend:** Next.js 16, React 19, Mapbox GL JS

## Setup

### 1. Environment Variables

Copy `.env.example` to `.env` (api) and `.env.local` (dashboard):

```bash
# Supabase (Project Settings → Database → Connection string)
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres

# Upstash Redis (Dashboard → REST API)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

API_PORT=3001
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.your_token
```

### 2. Database Migration

1. สร้าง Supabase project
2. Enable PostGIS extension (Database → Extensions)
3. Copy เนื้อหาจาก `supabase/migrations/001_fleet_routes.sql` → SQL Editor → Execute

### 3. Upstash Redis

1. สร้าง Upstash Redis database ที่ [console.upstash.com](https://console.upstash.com)
2. Copy REST URL และ REST Token

### 4. Seed Data

```bash
cd seed
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
export DATABASE_URL="your_supabase_connection_string"
python generate_routes.py --count 1000
# สำหรับ full demo: python generate_routes.py --count 200000 --clear
```

### 5. Run

```bash
./run.sh
```

หรือรันแยก:
```bash
# API
cd api && npm install && npm run start:dev

# Dashboard (อีก terminal)
cd dashboard && npm install && npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000)

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/tiles/fleet/:z/:x/:y.pbf` | GET | Vector tile (MVT) สำหรับ fleet layer |

## Architecture

- **Spatial Interpolation:** ตำแหน่งรถคำนวณจาก `(elapsed_time * speed) / route_length` → `ST_LineInterpolatePoint`
- **Cache:** Upstash Redis TTL 5 วินาที (micro-caching)
- **Frontend:** Mapbox Vector Source + polling ทุก 5 วินาที (remove/re-add source)

### การคำนวณ Bearing (ทิศทางหันหน้าของรถ)

ไอคอนรถบนแผนที่จะหันหน้าไปตามทิศทางการเคลื่อนที่ โดยคำนวณจาก SQL ใน `api/src/tiles/tiles.service.ts`:

1. **Fraction (ตำแหน่งบนเส้นทาง)** — คำนวณจากระยะทางที่รถเคลื่อนที่แล้วหารด้วยความยาวเส้นทางทั้งหมด:
   ```
   fraction = (elapsed_seconds / 3600 × speed_kmh × 1000) / route_length_m
   ```
   ค่าถูก clamp ระหว่าง 0–1

2. **จุดอ้างอิงสองจุด** — ใช้จุดก่อนหน้าและจุดถัดไปบนเส้นทาง:
   - `point_before` = `ST_LineInterpolatePoint(route, fraction - 0.005)`
   - `point_after` = `ST_LineInterpolatePoint(route, fraction + 0.005)`
   - ใช้ `GREATEST`/`LEAST` เพื่อไม่ให้ fraction ออกนอกช่วง 0–1

3. **Bearing (มุมองศา)** — ใช้ PostGIS `ST_Azimuth` หามุมจาก North ตามเข็มนาฬิกา:
   ```
   bearing = degrees(ST_Azimuth(point_before, point_after))
   ```
   - 0° = เหนือ, 90° = ตะวันออก, 180° = ใต้, 270° = ตะวันตก

4. **ส่งต่อไป Frontend** — ค่า `bearing` ถูกใส่ใน MVT properties แล้ว Mapbox ใช้ `icon-rotate` แสดงทิศทาง

```mermaid
flowchart LR
    subgraph SQL["PostgreSQL + PostGIS"]
        A[fraction] --> B[point_before]
        A --> C[point_after]
        B --> D[ST_Azimuth]
        C --> D
        D --> E[degrees]
        E --> F[bearing]
    end
    F --> G[MVT tile]
    G --> H[Mapbox icon-rotate]
```
