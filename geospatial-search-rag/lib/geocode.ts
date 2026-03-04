import { DEFAULT_SEARCH_CENTER } from "@/lib/map-config";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

export interface GeocodeResult {
  lat: number;
  lng: number;
}

export interface ResolveCenterParams {
  lat?: number;
  lng?: number;
  locationQuery?: string;
}

/**
 * แปลง params เป็นจุดศูนย์กลาง (lat, lng) สำหรับการค้นหา
 * ลำดับ: lat/lng ที่ระบุ > geocode จาก locationQuery > default (สยาม)
 * คืน null เมื่อ locationQuery ระบุแต่ geocode ไม่สำเร็จ
 */
export async function resolveSearchCenter(
  params: ResolveCenterParams
): Promise<GeocodeResult | null> {
  const { lat, lng, locationQuery } = params;

  if (lat !== undefined && lng !== undefined) {
    return { lat, lng };
  }

  if (locationQuery?.trim()) {
    const coords = await geocode(locationQuery);
    return coords; // อาจเป็น null ถ้า geocode ไม่สำเร็จ
  }

  return { ...DEFAULT_SEARCH_CENTER };
}

async function fetchGeocode(q: string): Promise<GeocodeResult | null> {
  if (!MAPBOX_TOKEN) return null;

  const encoded = encodeURIComponent(q);
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encoded}.json?access_token=${MAPBOX_TOKEN}&limit=1&country=TH`;

  const response = await fetch(url);
  if (!response.ok) return null;

  const data = (await response.json()) as {
    features?: Array<{ center?: [number, number] }>;
  };
  const feature = data.features?.[0];
  if (!feature?.center) return null;

  const [lng, lat] = feature.center;
  return { lat, lng };
}

/**
 * Geocode a place name to lat/lng via Mapbox API.
 * Tries Mapbox with "Bangkok" suffix for Thai queries if initial request fails.
 */
export async function geocode(query: string): Promise<GeocodeResult | null> {
  const q = query.trim();
  if (!q) return null;

  let result = await fetchGeocode(q);
  if (!result && !/bangkok|กรุงเทพ|thailand|ไทย/i.test(q)) {
    result = await fetchGeocode(`${q} Bangkok`);
  }
  return result;
}
