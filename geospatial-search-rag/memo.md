** table สำหรับเก็บข้อมูลพื้นที่ **
-- 1. Enable Extensions (เปิดใช้งานความสามารถทาง Spatial และ Vector)
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Create the Table
CREATE TABLE venues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT, -- ข้อความอธิบายสถานที่, รีวิว, หรือบรรยากาศ (ใช้เป็น Source สำหรับ AI)
  category TEXT, -- เช่น 'cafe', 'restaurant', 'coworking'
  
  -- 📍 แกนที่ 1: Spatial Data (พิกัดภูมิศาสตร์)
  -- ใช้ชนิดข้อมูล geography แทน geometry เพื่อให้คำนวณระยะทางบนโลกกลมเป็น "เมตร" ได้แม่นยำ
  location geography(Point, 4326) NOT NULL,
  
  -- 🧠 แกนที่ 2: Semantic Data (ตัวเลข Vector สำหรับ AI)
  -- สมมติว่าเราใช้ Model ของ Gemini (text-embedding-004) ซึ่งมีขนาด 768 มิติ
  embedding vector(768),
  
  -- 📦 แกนที่ 3: Flexible Metadata (ข้อมูลเสริมที่อาจเปลี่ยนโครงสร้างได้)
  metadata JSONB DEFAULT '{}'::jsonb, -- เก็บข้อมูลเช่น { "has_wifi": true, "rating": 4.8 }
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Indexes (หัวใจสำคัญของ Performance ขาดไม่ได้เด็ดขาด)

-- Index สำหรับการค้นหาพื้นที่ (Spatial Index) ทำให้หา Bounding Box/Radius ได้ในเสี้ยววินาที
CREATE INDEX idx_venues_location ON venues USING GIST (location);

-- Index สำหรับการค้นหา Vector (HNSW Index) ทำให้หาความคล้ายคลึงของ AI ได้เร็วกว่าการ Scan ทั้งตาราง
CREATE INDEX idx_venues_embedding ON venues USING hnsw (embedding vector_cosine_ops);

** สร้าง function geo_semantic_search เพื่อใช้ semantic search **
CREATE OR REPLACE FUNCTION geo_semantic_search(
  query_embedding vector(768),      -- 1. Vector ที่ได้จาก Gemini (เช่น คำว่า "คาเฟ่เงียบๆ")
  target_lat double precision,      -- 2. ละติจูดเป้าหมาย (เช่น BTS อโศก)
  target_lng double precision,      -- 3. ลองจิจูดเป้าหมาย
  radius_meters double precision,   -- 4. รัศมีที่ต้องการค้นหา (หน่วยเป็นเมตร)
  match_limit int DEFAULT 5         -- 5. จำนวนผลลัพธ์ที่ต้องการ (Top K)
)
-- กำหนดโครงสร้างข้อมูลที่จะ Return กลับไปให้ Frontend / AI
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  distance_meters double precision, -- บอกระยะห่างจริงบนแผนที่
  similarity double precision       -- บอกความแม่นยำของความหมาย (1.0 = ตรงเป๊ะ)
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    v.id,
    v.name,
    v.description,
    -- คำนวณระยะทางจริง (เป็นเมตร) จากจุดเป้าหมาย ถึงพิกัดของร้าน
    ST_Distance(
      v.location, 
      ST_SetSRID(ST_MakePoint(target_lng, target_lat), 4326)::geography
    ) AS distance_meters,
    
    -- คำนวณความเหมือนของ Vector (Cosine Similarity: ยิ่งใกล้ 1 ยิ่งความหมายตรงกัน)
    1 - (v.embedding <=> query_embedding) AS similarity
    
  FROM venues v
  -- 🚨 THE MAGIC IS HERE (Spatial Pre-filtering) 🚨
  -- กรองร้านที่อยู่นอกรัศมีทิ้งไปก่อนเลย ด้วย ST_DWithin (ใช้ GiST Index)
  WHERE ST_DWithin(
    v.location,
    ST_SetSRID(ST_MakePoint(target_lng, target_lat), 4326)::geography,
    radius_meters
  )
  -- นำร้านที่รอดจากการกรองพื้นที่ มาเรียงลำดับตามความหมายที่ตรงกับ Prompt ที่สุด (ใช้ HNSW Index)
  ORDER BY v.embedding <=> query_embedding
  LIMIT match_limit;
END;
$$;

