# Geospatial Search RAG

ระบบค้นหาสถานที่ด้วย **Semantic Search** และ **RAG** (Retrieval Augmented Generation) ใช้ PostgreSQL + PostGIS + pgvector บน Supabase ร่วมกับ Google Gemini และ Mapbox

## Tech Stack

- **Frontend:** Next.js 16, React 19, Mapbox GL JS, Tailwind CSS
- **Database:** Supabase (PostgreSQL + PostGIS + pgvector)
- **AI:** Google Gemini (text-embedding-004, gemini-1.5-flash)
- **Geocoding:** Mapbox Geocoding API

## Setup

### 1. Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```bash
cp .env.example .env.local
```

Required variables:

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (server-side)
- `GOOGLE_AI_API_KEY` - Google AI Studio API key
- `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` - Mapbox token

### 2. Database Migration

รัน SQL ใน `supabase/migrations/001_venues.sql` ผ่าน Supabase Dashboard:

1. เปิด [Supabase Dashboard](https://supabase.com/dashboard) → SQL Editor
2. Enable extensions: PostGIS, pgvector (ผ่าน Database → Extensions ถ้ายังไม่มี)
3. Copy เนื้อหาจาก `supabase/migrations/001_venues.sql` แล้ว Execute
4. Copy เนื้อหาจาก `supabase/migrations/002_insert_venue.sql` แล้ว Execute
5. ถ้า seed ยัง error "Could not find the function" ให้รอ 10–30 วินาที หรือกด Reload ใน Project Settings → API

### 3. Seed Data

**วิธีที่ 1:** รัน script
```bash
npm run seed
```

**วิธีที่ 2:** เรียก API (ต้องรัน `npm run dev` ก่อน)
```bash
curl -X POST http://localhost:3000/api/seed
```

หรือ insert venues แล้วเรียก `POST /api/venues/embed` เพื่อ generate embedding

### 4. Run Dev Server

```bash
npm install
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000)

## Usage

1. พิมพ์ **สิ่งที่ต้องการ** (เช่น "คาเฟ่เงียบๆ")
2. กด **ค้นหา** - แสดงผลบนแผนที่และคำแนะนำจาก AI

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/search/rag` | POST | Semantic search + RAG response |
| `/api/venues/embed` | POST | Generate embedding for venue(s) |

Request body for search:

```json
{
  "query": "คาเฟ่เงียบๆ",
  "radiusMeters": 5000,
  "matchLimit": 5
}
```

Optional: `locationQuery` (เช่น "BTS อโศก") หรือ `lat`, `lng` เพื่อระบุจุดศูนย์กลางการค้นหา ถ้าไม่ระบุจะใช้จุดศูนย์กลางกรุงเทพ (สยาม)

```json
{
  "query": "คาเฟ่เงียบๆ",
  "locationQuery": "BTS อโศก"
}
```
