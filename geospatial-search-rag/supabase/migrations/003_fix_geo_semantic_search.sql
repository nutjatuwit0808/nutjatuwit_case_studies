-- Fix: Filter out venues without embedding and ensure proper ordering
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
    )::double precision AS distance_meters,
    (1 - (v.embedding <=> query_embedding))::double precision AS similarity,
    ST_Y(v.location::geometry)::double precision AS lat,
    ST_X(v.location::geometry)::double precision AS lng
  FROM venues v
  WHERE ST_DWithin(
    v.location,
    ST_SetSRID(ST_MakePoint(target_lng, target_lat), 4326)::geography,
    radius_meters
  )
  AND v.embedding IS NOT NULL
  ORDER BY v.embedding <=> query_embedding
  LIMIT match_limit;
END;
$$;
