"""
สร้างข้อมูลอสังหาริมทรัพย์จำลองเป็น GeoJSON
Output: sample.geojson ใน geojson/
"""

import time
from pathlib import Path

import geopandas as gpd  # type: ignore[import-untyped]
import numpy as np
import pandas as pd

# ค่าคงที่
N_POINTS = 100_000  # จำนวนจุด
THAILAND_BBOX = {"lon_min": 97.35, "lon_max": 105.64, "lat_min": 5.61, "lat_max": 20.46}
PROPERTY_TYPE_PROBS = [0.40, 0.30, 0.20, 0.10]  # Condo, Townhouse, Detached House, Land
BEDROOM_RANGE = (1, 6)  # 1-5 ห้อง
BASE_AREA_PER_BEDROOM = 25  # ตร.ม. ต่อห้อง
AREA_VARIANCE = (10, 50)  # ความแปรปรวนพื้นที่
PRICE_PER_SQM_RANGE = (50_000, 150_000)  # บาท/ตร.ม.
LAND_AREA_RANGE = (100, 2000)  # พื้นที่ดิน ตร.ม.


def generate_realestate_data():
    print(f"🚀 เริ่มสร้างข้อมูลอสังหาฯ จำลอง {N_POINTS:,} รายการ...")
    start_time = time.time()

    # 1. สุ่มพิกัดให้ครอบคลุมทั่วประเทศไทย
    lons = np.random.uniform(
        low=THAILAND_BBOX["lon_min"],
        high=THAILAND_BBOX["lon_max"],
        size=N_POINTS,
    )
    lats = np.random.uniform(
        low=THAILAND_BBOX["lat_min"],
        high=THAILAND_BBOX["lat_max"],
        size=N_POINTS,
    )

    # 2. กำหนดประเภทอสังหาฯ แบบกำหนดสัดส่วนความน่าจะเป็น
    property_types = np.random.choice(
        ["Condo", "Townhouse", "Detached House", "Land"],
        p=PROPERTY_TYPE_PROBS,
        size=N_POINTS,
    )

    # 3. สุ่มจำนวนห้องนอน และห้องน้ำ
    bedrooms = np.random.randint(BEDROOM_RANGE[0], BEDROOM_RANGE[1], size=N_POINTS)
    bathrooms = np.where(
        bedrooms > 1, bedrooms - np.random.randint(0, 2, size=N_POINTS), 1
    )

    # 4. คำนวณพื้นที่ใช้สอย (ตร.ม.) ให้สอดคล้องกับจำนวนห้อง
    base_area = bedrooms * BASE_AREA_PER_BEDROOM
    usable_area = base_area + np.random.randint(
        AREA_VARIANCE[0], AREA_VARIANCE[1], size=N_POINTS
    )

    # 5. สุ่มราคาประเมินต่อตารางเมตร เพื่อคำนวณราคาสุทธิ
    price_per_sqm = np.random.randint(
        PRICE_PER_SQM_RANGE[0], PRICE_PER_SQM_RANGE[1], size=N_POINTS
    )
    prices = usable_area * price_per_sqm

    # 6. สร้าง DataFrame
    df = pd.DataFrame(
        {
            "id": np.arange(1, N_POINTS + 1),
            "property_type": property_types,
            "price": prices,
            "bedrooms": bedrooms,
            "bathrooms": bathrooms,
            "usable_area_sqm": usable_area,
            "Longitude": lons,
            "Latitude": lats,
        }
    )

    # 7. คลีนข้อมูล: ที่ดิน (Land) ต้องไม่มีห้องนอน/ห้องน้ำ
    is_land = df["property_type"] == "Land"
    df.loc[is_land, "bedrooms"] = 0
    df.loc[is_land, "bathrooms"] = 0
    df.loc[is_land, "usable_area_sqm"] = np.random.randint(
        LAND_AREA_RANGE[0], LAND_AREA_RANGE[1], size=is_land.sum()
    )

    # 8. แปลงเป็น GeoDataFrame
    print("🗺️ กำลังแปลงโครงสร้างเป็น GeoDataFrame...")
    gdf = gpd.GeoDataFrame(
        df,
        geometry=gpd.points_from_xy(df.Longitude, df.Latitude),
        crs="EPSG:4326",
    )
    gdf = gdf.drop(columns=["Longitude", "Latitude"])

    # 9. บันทึก GeoJSON ลง geojson/
    output_dir = Path(__file__).resolve().parent / "geojson"
    output_dir.mkdir(parents=True, exist_ok=True)
    geojson_file = output_dir / "sample.geojson"
    print(f"💾 กำลังเซฟเป็นไฟล์ {geojson_file}...")
    gdf.to_file(str(geojson_file), driver="GeoJSON")

    end_time = time.time()
    print(f"✅ เสร็จเรียบร้อย! ใช้เวลาไปทั้งหมด {round(end_time - start_time, 2)} วินาที")


if __name__ == "__main__":
    generate_realestate_data()
