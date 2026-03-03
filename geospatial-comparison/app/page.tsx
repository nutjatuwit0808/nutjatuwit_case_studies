import { MapComparison } from "@/components/MapComparison";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-zinc-950">
      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 md:text-3xl">
            Geospatial Comparison: GeoJSON vs PMTiles
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            เปรียบเทียบ performance การโหลดแผนที่ระหว่างไฟล์ GeoJSON และ PMTiles
            บน Mapbox GL JS
          </p>
        </header>

        <MapComparison />
      </main>
    </div>
  );
}
