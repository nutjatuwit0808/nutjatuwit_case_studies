#!/usr/bin/env python3
"""
Generate synthetic fleet routes for MVT demo.
Usage: python generate_routes.py --count 1000
"""
import argparse
import json
import os
import random
from datetime import datetime, timedelta, timezone

import psycopg2
from psycopg2.extras import execute_values
from shapely.geometry import LineString

# Bangkok bounds (lng, lat)
BANGKOK_BOUNDS = {
    "min_lng": 99.5,
    "max_lng": 101.0,
    "min_lat": 13.0,
    "max_lat": 14.5,
}


def random_point() -> tuple[float, float]:
    lng = random.uniform(BANGKOK_BOUNDS["min_lng"], BANGKOK_BOUNDS["max_lng"])
    lat = random.uniform(BANGKOK_BOUNDS["min_lat"], BANGKOK_BOUNDS["max_lat"])
    return (lng, lat)


def generate_route(num_points: int = None) -> LineString:
    n = num_points or random.randint(5, 20)
    coords = [random_point() for _ in range(n)]
    return LineString(coords)


def main():
    parser = argparse.ArgumentParser(description="Generate fleet routes for MVT demo")
    parser.add_argument("--count", type=int, default=1000, help="Number of vehicles (default: 1000)")
    parser.add_argument("--clear", action="store_true", help="Clear existing data before insert")
    args = parser.parse_args()

    db_url = os.environ.get("DATABASE_URL")
    if not db_url:
        print("Error: DATABASE_URL environment variable is required")
        exit(1)

    try:
        conn = psycopg2.connect(db_url)
    except psycopg2.OperationalError as e:
        if "password authentication failed" in str(e):
            print("Error: Supabase connection failed - password authentication failed")
            print("  - ใช้ Connection string จาก Supabase Dashboard → Project Settings → Database")
            print("  - เลือก 'Connection pooler' (port 6543) แทน Direct connection (port 5432)")
            print("  - รูปแบบ: postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres")
            print("  - ถ้ารหัสผ่านมีอักขระพิเศษ (@#% ฯลฯ) ให้ URL-encode")
        else:
            print(f"Error: {e}")
        exit(1)
    conn.autocommit = False

    try:
        with conn.cursor() as cur:
            if args.clear:
                cur.execute("TRUNCATE fleet_routes")
                print(f"Cleared fleet_routes")

            now = datetime.now(timezone.utc)
            rows = []
            for i in range(args.count):
                vehicle_id = f"vehicle-{i:06d}"
                route = generate_route()
                wkt = route.wkt
                # start_time: random offset in past 24h so vehicles are at different positions
                hours_ago = random.uniform(0, 24)
                start_time = now - timedelta(hours=hours_ago)
                speed_kmh = round(random.uniform(20, 80), 1)
                metadata = json.dumps({"type": random.choice(["truck", "van", "car"])})

                rows.append((vehicle_id, wkt, start_time, speed_kmh, metadata))

            execute_values(
                cur,
                """
                INSERT INTO fleet_routes (vehicle_id, route_geom, start_time, speed_kmh, metadata)
                VALUES %s
                ON CONFLICT (vehicle_id) DO UPDATE SET
                    route_geom = EXCLUDED.route_geom,
                    start_time = EXCLUDED.start_time,
                    speed_kmh = EXCLUDED.speed_kmh,
                    metadata = EXCLUDED.metadata
                """,
                [(r[0], f"SRID=4326;{r[1]}", r[2], r[3], r[4]) for r in rows],
                template="(%s, ST_GeomFromEWKT(%s), %s, %s, %s::jsonb)",
                page_size=500,
            )

        conn.commit()
        print(f"Inserted {args.count} routes successfully")
    except Exception as e:
        conn.rollback()
        raise
    finally:
        conn.close()


if __name__ == "__main__":
    main()
