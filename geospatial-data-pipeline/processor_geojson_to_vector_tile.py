"""
ประมวลผล GeoJSON อสังหาริมทรัพย์เป็น PMTiles
Input: geojson/sample.geojson
Output: vector-tile/sample.pmtiles
"""

import argparse
import subprocess
import sys
from pathlib import Path

def get_default_paths() -> tuple[Path, Path]:
    """คืนค่า (path GeoJSON เริ่มต้น, path PMTiles output เริ่มต้น)"""
    base = Path(__file__).resolve().parent
    return base / "geojson" / "sample.geojson", base / "vector-tile" / "sample.pmtiles"


def process_geojson_to_pmtiles(geojson_path: Path, pmtiles_path: Path) -> None:
    """
    อ่าน GeoJSON และสร้าง PMTiles ผ่าน tippecanoe
    สร้างโฟลเดอร์ output ถ้ายังไม่มี
    """
    if not geojson_path.exists():
        print(f"Error: GeoJSON file not found: {geojson_path}", file=sys.stderr)
        sys.exit(1)

    pmtiles_path.parent.mkdir(parents=True, exist_ok=True)

    # สร้าง PMTiles (ผ่าน tippecanoe)
    try:
        print(f"Reading GeoJSON: {geojson_path}")
        print(f"Building PMTiles with tippecanoe: {pmtiles_path}")
        result = subprocess.run(
            [
                "tippecanoe",
                "-zg",  # ตรวจจับ minzoom/maxzoom อัตโนมัติจากข้อมูล
                "-r1",  # ปิด drop rate — ไม่ drop จุดที่ zoom ต่ำ (default 2.5 จะ drop เยอะ)
                "--force",  # เขียนทับไฟล์ PMTiles เดิม
                "--no-feature-limit",  # ไม่จำกัดจำนวน feature ต่อ tile (default 200K)
                "--no-tile-size-limit",  # ไม่จำกัดขนาด tile (default 500KB)
                "--layer=sample",  # ชื่อ layer = "sample"
                "-o",
                str(pmtiles_path),
                str(geojson_path),
            ],
            capture_output=True,
            text=True,
        )
        if result.returncode != 0:
            if result.stderr:
                print(result.stderr, file=sys.stderr)
            if result.stdout:
                print(result.stdout, file=sys.stderr)
            print("tippecanoe ล้มเหลว", file=sys.stderr)
            sys.exit(1)
        print("PMTiles done.")
    except FileNotFoundError:
        print(
            "ไม่พบ tippecanoe — ติดตั้ง (เช่น brew install tippecanoe) เพื่อสร้าง .pmtiles",
            file=sys.stderr,
        )
        sys.exit(1)


def main() -> None:
    default_geojson, default_pmtiles = get_default_paths()
    parser = argparse.ArgumentParser(
        description="ประมวลผล GeoJSON อสังหาริมทรัพย์เป็น PMTiles"
    )
    parser.add_argument(
        "geojson",
        type=Path,
        nargs="?",
        default=default_geojson,
        help=f"Path ไฟล์ GeoJSON (default: {default_geojson})",
    )
    parser.add_argument(
        "-o",
        "--output",
        type=Path,
        default=default_pmtiles,
        help=f"Path ไฟล์ PMTiles output (default: {default_pmtiles})",
    )
    args = parser.parse_args()
    process_geojson_to_pmtiles(args.geojson, args.output)


if __name__ == "__main__":
    main()
