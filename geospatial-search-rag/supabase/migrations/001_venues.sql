-- 1. Enable Extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create the Table
CREATE TABLE venues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,

  location geography(Point, 4326) NOT NULL,
  embedding vector(768),
  metadata JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Indexes
CREATE INDEX idx_venues_location ON venues USING GIST (location);
CREATE INDEX idx_venues_embedding ON venues USING hnsw (embedding vector_cosine_ops);

-- 4. geo_semantic_search function (with lat/lng in return for map plotting)
CREATE OR REPLACE FUNCTION geo_semantic_search(
  query_embedding vector(768),
  target_lat double precision,
  target_lng double precision,
  radius_meters double precision,
  match_limit int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  distance_meters double precision,
  similarity double precision,
  lat double precision,
  lng double precision
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    v.id,
    v.name,
    v.description,
    ST_Distance(
      v.location,
      ST_SetSRID(ST_MakePoint(target_lng, target_lat), 4326)::geography
    ) AS distance_meters,
    1 - (v.embedding <=> query_embedding) AS similarity,
    ST_Y(v.location::geometry) AS lat,
    ST_X(v.location::geometry) AS lng
  FROM venues v
  WHERE ST_DWithin(
    v.location,
    ST_SetSRID(ST_MakePoint(target_lng, target_lat), 4326)::geography,
    radius_meters
  )
  ORDER BY v.embedding <=> query_embedding
  LIMIT match_limit;
END;
$$;
