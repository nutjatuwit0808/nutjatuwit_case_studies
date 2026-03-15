# Fleet MVT: Dynamic MVT Engine for Fleet Telematics

ระบบจำลองและแสดงผลยานพาหนะ 1,000 คันบนแผนที่แบบ Real-time โดยใช้ **Spatial Interpolation** คำนวณตำแหน่งแบบ On-the-fly และเสิร์ฟเป็น Vector Tile (MVT / Protobuf) — ไม่มีการ Update State ลง Database

## Table of Contents

- [System Overview](#system-overview)
- [Screenshots](#screenshots)
- [Getting Started](#getting-started)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Data Flow](#data-flow)
- [API Endpoints](#api-endpoints)
- [Components](#components)
- [Spatial Interpolation & Bearing](#spatial-interpolation--bearing)

---

## System Overview

Fleet MVT เป็นระบบ Fleet Telematics ที่แสดงตำแหน่งยานพาหนะแบบ Real-time บนแผนที่ โดยใช้แนวคิด **Static Routing Plan** — ข้อมูลเส้นทาง (route) ถูกเก็บใน Database แค่ครั้งเดียว ไม่มีการอัปเดตตำแหน่งรถลง DB ทุกวินาที

ตำแหน่งรถคำนวณแบบ **On-the-fly** ด้วย PostGIS `ST_LineInterpolatePoint` จากสูตร:
- `fraction = (elapsed_time × speed) / route_length`
- ตำแหน่งปัจจุบัน = จุดบนเส้นทางที่ fraction นั้น

ผลลัพธ์ถูกแปลงเป็น **Mapbox Vector Tiles (MVT/Protobuf)** และส่งไปยัง Frontend ที่ใช้ Mapbox GL JS แสดงผล

---

## Screenshots

| รูป | คำอธิบาย |
|-----|----------|
| ![ตัวอย่าง table เส้นทาง](assets/ex1.png) | ตัวอย่าง table เพื่อเก็บข้อมูลเส้นทางของรถแต่ละคัน |
| ![ตัวอย่าง GeoJSON LineString](assets/ex2.png) | ตัวอย่างของเส้นทางการเดินรถหลังจากแปลงจาก WKB ในรูป hexadecimal เป็น GeoJSON LineString (col: route_geom ในตัวอย่างที่ 1) |
| ![ตัวอย่างการทำงาน](assets/ex3.png) | ตัวอย่างการทำงาน |

---

## Getting Started

### Prerequisites

- **Node.js** 20+ (สำหรับ API และ Dashboard)
- **Python 3.10+** (สำหรับ seed script)
- **Supabase** account (PostgreSQL + PostGIS)
- **Upstash Redis** account (optional, สำหรับ cache)
- **Mapbox** access token

### 1. Environment Variables

Copy `.env.example` ไปยัง `.env` (ที่ root หรือใน api) และ `.env.local` (ใน dashboard):

```bash
# Supabase (Project Settings → Database → Connection string)
# ใช้ Connection pooler (port 6543) แทน Direct connection
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres

# Upstash Redis (Dashboard → REST API) — optional
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

### 3. Upstash Redis (Optional)

1. สร้าง Upstash Redis database ที่ [console.upstash.com](https://console.upstash.com)
2. Copy REST URL และ REST Token ไปใส่ใน `.env`

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

### System Startup Flow

```mermaid
flowchart TD
    A[รัน ./run.sh] --> B[โหลด .env / .env.local]
    B --> C[npm install api]
    B --> D[npm install dashboard]
    C --> E[เริ่ม NestJS API :3001]
    D --> F[รอ 3 วินาที]
    E --> F
    F --> G[เริ่ม Next.js Dashboard :3000]
    G --> H[โหลด Mapbox Map]
    H --> I[โหลด Fleet Icons]
    I --> J[เพิ่ม Vector Source + Layer]
    J --> K[ตั้ง Polling ทุก 5 วินาที]
    K --> L[พร้อมใช้งาน]
```

---

## Tech Stack

| ประเภท | เทคโนโลยี |
|--------|-----------|
| **Database** | Supabase (PostgreSQL + PostGIS) |
| **Cache** | Upstash Redis (REST API, TTL 5 วินาที) |
| **Backend** | NestJS 10, Node.js, pg, @upstash/redis |
| **Frontend** | Next.js 16, React 19, Mapbox GL JS 3.x |
| **Mapping** | Mapbox Vector Tiles (MVT/Protobuf) |
| **Seed** | Python 3, psycopg2, Shapely |
| **DevOps/Tools** | Bash (run.sh), npm |

---

## Architecture

### โครงสร้างโปรเจกต์

```
geospatial-realtime-fleet-telematics/
├── api/                    # NestJS Backend
│   └── src/
│       ├── main.ts
│       ├── app.module.ts
│       └── tiles/
│           ├── tiles.controller.ts
│           ├── tiles.service.ts
│           └── tiles.module.ts
├── dashboard/              # Next.js Frontend
│   ├── app/
│   ├── components/         # FleetMap, MapErrorOverlay
│   ├── hooks/              # useMapboxMap
│   └── lib/                # fleet-config, map-config
├── seed/
│   └── generate_routes.py  # สร้าง route data
├── supabase/migrations/
│   └── 001_fleet_routes.sql
├── assets/                 # Screenshots
└── run.sh
```

### สถาปัตยกรรมระบบ

```mermaid
flowchart TB
    subgraph Frontend["Frontend (Next.js + Mapbox)"]
        FM[FleetMap]
        MS[Mapbox Vector Source]
        ML[Symbol Layer]
        FM --> MS
        MS --> ML
    end

    subgraph API["API (NestJS)"]
        TC[TilesController]
        TS[TilesService]
        TC --> TS
    end

    subgraph Cache["Cache"]
        R[(Upstash Redis)]
    end

    subgraph DB["Database"]
        PG[(PostgreSQL + PostGIS)]
    end

    MS -->|"GET /api/tiles/fleet/{z}/{x}/{y}.pbf"| TC
    TS --> R
    TS --> PG
    R -->|cache hit| TS
    PG -->|MVT buffer| TS
    TS -->|application/x-protobuf| MS
```

### Component Interaction

```mermaid
sequenceDiagram
    participant User
    participant FleetMap
    participant useMapboxMap
    participant Mapbox
    participant API
    participant Redis
    participant PostGIS

    User->>FleetMap: เปิด Dashboard
    FleetMap->>useMapboxMap: onLoad callback
    useMapboxMap->>Mapbox: สร้าง Map, center Bangkok
    Mapbox->>FleetMap: load event
    FleetMap->>FleetMap: loadFleetIcons (truck, car)
    FleetMap->>FleetMap: refreshSource (add Vector Source)
    FleetMap->>FleetMap: setInterval 5s → refreshSource

    loop ทุก 5 วินาที
        Mapbox->>API: GET /api/tiles/fleet/{z}/{x}/{y}.pbf
        API->>Redis: get cache key
        alt cache hit
            Redis-->>API: base64 tile
            API-->>Mapbox: MVT buffer
        else cache miss
            API->>PostGIS: MVT_SQL (interpolation)
            PostGIS-->>API: MVT buffer
            API->>Redis: set cache TTL 5s
            API-->>Mapbox: MVT buffer
        end
        Mapbox->>Mapbox: remove/re-add source → แสดงตำแหน่งใหม่
    end
```

---

## Data Flow

### การไหลของข้อมูลจาก DB → API → Frontend

```mermaid
flowchart LR
    subgraph DB["Database (fleet_routes)"]
        A[vehicle_id, route_geom, start_time, speed_kmh, metadata]
    end

    subgraph API["API Processing"]
        B[ST_TileEnvelope bounds]
        C[raw_fractions: elapsed × speed / route_length]
        D[route_fractions: fraction = raw - floor]
        E[interpolated_points: ST_LineInterpolatePoint, ST_Azimuth]
        F[mvt_geoms: ST_AsMVTGeom, ST_AsMVT]
        G[Redis cache TTL 5s]
    end

    subgraph FE["Frontend"]
        H[Mapbox Vector Source]
        I[Symbol Layer: icon + bearing]
    end

    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
    G --> H
    H --> I
```

### รายละเอียด Data Pipeline

| ขั้นตอน | คำอธิบาย |
|---------|----------|
| **1. fleet_routes** | Table เก็บ route_geom (LineString), start_time, speed_kmh |
| **2. bounds** | `ST_TileEnvelope(z,x,y)` — พื้นที่ของ tile ปัจจุบัน |
| **3. raw_fractions** | คำนวณ fraction จาก `(elapsed_seconds/3600 × speed_kmh × 1000) / route_length_m` |
| **4. route_fractions** | `fraction = raw - floor(raw)` — วนกลับเมื่อถึงปลายทาง |
| **5. interpolated_points** | `ST_LineInterpolatePoint(route, fraction)` + `ST_Azimuth` สำหรับ bearing |
| **6. mvt_geoms** | แปลงเป็น Web Mercator (3857) → `ST_AsMVT` → Protobuf buffer |
| **7. Redis** | Cache tile ด้วย key `mvt:fleet:{z}:{x}:{y}`, TTL 5 วินาที |
| **8. Frontend** | Mapbox ใช้ Vector Source ดึง tiles, Symbol Layer แสดง icon + rotate ตาม bearing |

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/tiles/fleet/:z/:x/:y.pbf` | GET | Vector tile (MVT) สำหรับ fleet layer |

**Response:**
- `Content-Type: application/x-protobuf`
- `Cache-Control: no-cache, max-age=0`

**Request Flow:**

```mermaid
sequenceDiagram
    participant Mapbox
    participant API
    participant Redis
    participant PostGIS

    Mapbox->>API: GET /api/tiles/fleet/12/3456/2345.pbf
    API->>Redis: get mvt:fleet:12:3456:2345
    alt cached
        Redis-->>API: base64
        API-->>Mapbox: Buffer (MVT)
    else miss
        API->>PostGIS: MVT_SQL(z,x,y)
        PostGIS-->>API: MVT buffer
        API->>Redis: set ex 5
        API-->>Mapbox: Buffer (MVT)
    end
```

---

## Components

### Backend (api/)

| ไฟล์ | หน้าที่ |
|------|---------|
| `tiles.controller.ts` | รับ GET `:z/:x/:y.pbf` ส่ง buffer กลับ |
| `tiles.service.ts` | MVT_SQL, PostGIS query, Redis cache |

### Frontend (dashboard/)

| ไฟล์ | หน้าที่ |
|------|---------|
| `FleetMap.tsx` | Component หลัก — โหลด map, icons, source, layer, polling |
| `useMapboxMap.ts` | Hook สร้าง Mapbox map, จัดการ token/error |
| `fleet-config.ts` | Constants: source ID, layer ID, poll interval, getFleetTilesUrl, loadFleetIcons |
| `map-config.ts` | Map style, center (Bangkok), zoom |

### Seed (seed/)

| ไฟล์ | หน้าที่ |
|------|---------|
| `generate_routes.py` | สร้าง LineString แบบสุ่มใน Bangkok bounds, INSERT ลง fleet_routes |

### Database (supabase/migrations/)

| ไฟล์ | หน้าที่ |
|------|---------|
| `001_fleet_routes.sql` | สร้าง table fleet_routes + GIST index บน route_geom |

---

## Spatial Interpolation & Bearing

### Spatial Interpolation

ตำแหน่งรถคำนวณจาก `(elapsed_time × speed) / route_length` → `ST_LineInterpolatePoint`

- **elapsed_time** = `NOW() - start_time` (วินาที)
- **distance** = `(elapsed_seconds / 3600) × speed_kmh × 1000` (เมตร)
- **fraction** = `distance / route_length_m` → ใช้ `raw - floor(raw)` เพื่อวนกลับ

### การคำนวณ Bearing (ทิศทางหันหน้าของรถ)

ไอคอนรถบนแผนที่จะหันหน้าไปตามทิศทางการเคลื่อนที่ โดยคำนวณจาก SQL ใน `api/src/tiles/tiles.service.ts`:

1. **Fraction (ตำแหน่งบนเส้นทาง)** — คำนวณจากระยะทางที่รถเคลื่อนที่แล้วหารด้วยความยาวเส้นทางทั้งหมด:
   ```
   raw = (elapsed_seconds / 3600 × speed_kmh × 1000) / route_length_m
   fraction = raw - floor(raw)   // วนกลับไปเริ่มต้นเมื่อถึงปลายทาง
   ```

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
