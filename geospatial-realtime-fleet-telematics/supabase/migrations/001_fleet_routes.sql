-- Enable PostGIS (enable via Supabase Dashboard → Database → Extensions if not already)
CREATE EXTENSION IF NOT EXISTS postgis;

-- Static Routing Plan: ข้อมูล Insert แค่ครั้งเดียว
CREATE TABLE fleet_routes (
    vehicle_id VARCHAR(50) PRIMARY KEY,
    route_geom GEOMETRY(LineString, 4326) NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    speed_kmh NUMERIC NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_fleet_routes_geom ON fleet_routes USING GIST (route_geom);
