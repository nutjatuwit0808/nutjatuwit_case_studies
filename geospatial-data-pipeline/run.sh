#!/bin/bash
set -e
cd "$(dirname "$0")"

# ใช้ Python จาก .venv ถ้ามี (แก้ปัญหา externally-managed-environment บน macOS)
if [ -d ".venv" ]; then
  PYTHON=".venv/bin/python"
else
  PYTHON="python3"
fi

echo "Step 1: Generating GeoJSON (10,000 points)..."
$PYTHON generate_sample.py

echo "Step 2: Processing GeoJSON to PMTiles..."
$PYTHON processor_geojson_to_vector_tile.py

echo "Done! Output: vector-tile/sample.pmtiles"
