# Geospatial Comparison: GeoJSON vs PMTiles

เปรียบเทียบ performance การโหลดแผนที่ระหว่างไฟล์ GeoJSON และ PMTiles บน Mapbox GL JS แบบ side-by-side พร้อม responsive design และการแสดงผลเชิงตัวเลข

## Setup

1. **ติดตั้ง dependencies**

```bash
npm install
```

   (postinstall จะแก้ไข type stub สำหรับ @types/mapbox__point-geometry อัตโนมัติ)

2. **ตั้งค่า Mapbox Access Token**

สร้างไฟล์ `.env.local` และเพิ่ม token:

```bash
cp .env.example .env.local
```

แก้ไข `.env.local` และใส่ Mapbox token ของคุณ (สมัครได้ที่ [mapbox.com](https://account.mapbox.com/)):

```
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.your_actual_token_here
```

3. **รัน development server**

```bash
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000)

## PMTiles API

PMTiles ใช้ HTTP Range requests เพื่อโหลดเฉพาะส่วนของไฟล์ จึงต้องใช้ API route แทน static file:

- **Endpoint**: `GET /api/pmtiles/[filename]`
- **ตัวอย่าง**: `/api/pmtiles/sample.pmtiles`
- รองรับ `Range: bytes=offset-length` สำหรับการโหลดแบบ streaming

## โครงสร้างข้อมูล

ไฟล์ GeoJSON และ PMTiles เก็บไว้ที่ `public/data/`:

- `sample.geojson` - ข้อมูลจุดตัวอย่างในประเทศไทย
- `sample.pmtiles` - ข้อมูลเดียวกันแปลงเป็น PMTiles

## Tech Stack

- **Map**: Mapbox GL JS
- **PMTiles**: mapbox-pmtiles
- **Framework**: Next.js 16, React 19
- **Styling**: Tailwind CSS 4
