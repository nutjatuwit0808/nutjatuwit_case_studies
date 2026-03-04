-- RPC for inserting venues (geography + vector not supported via REST insert)
CREATE OR REPLACE FUNCTION insert_venue(
  p_name text,
  p_description text,
  p_category text,
  p_lng double precision,
  p_lat double precision,
  p_embedding vector(768)
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO venues (name, description, category, location, embedding)
  VALUES (
    p_name,
    p_description,
    p_category,
    ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography,
    p_embedding
  )
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

-- Expose to Supabase API
GRANT EXECUTE ON FUNCTION insert_venue TO anon;
GRANT EXECUTE ON FUNCTION insert_venue TO authenticated;
GRANT EXECUTE ON FUNCTION insert_venue TO service_role;

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
