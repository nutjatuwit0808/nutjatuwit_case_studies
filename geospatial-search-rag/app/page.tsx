"use client";

import dynamic from "next/dynamic";
import { useState, useCallback, useMemo } from "react";
import { SearchBar } from "@/components/SearchBar";
import { RAGResponse } from "@/components/RAGResponse";
import type { VenueSearchResult } from "@/types/venue";
import {
  DEFAULT_RADIUS_METERS,
  DEFAULT_MATCH_LIMIT,
  MIN_SIMILARITY_THRESHOLD,
} from "@/lib/search-config";

const VenueMap = dynamic(() => import("@/components/VenueMap").then((m) => ({ default: m.VenueMap })), {
  ssr: false,
  loading: () => (
    <div className="h-full min-h-[400px] flex items-center justify-center bg-gray-100 rounded-xl">
      <span className="text-sm text-gray-500">กำลังโหลดแผนที่...</span>
    </div>
  ),
});

export default function Home() {
  const [venues, setVenues] = useState<VenueSearchResult[]>([]);
  const [flyToPoint, setFlyToPoint] = useState<{ lat: number; lng: number } | null>(null);
  const [ragResponse, setRagResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = useCallback(async (query: string) => {
    setLoading(true);
    setError(null);
    setRagResponse(null);
    setHasSearched(true);

    try {
      const res = await fetch("/api/search/rag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          radiusMeters: DEFAULT_RADIUS_METERS,
          matchLimit: DEFAULT_MATCH_LIMIT,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = [data.error, data.hint].filter(Boolean).join(" ");
        throw new Error(msg || "Search failed");
      }

      setVenues(data.venues ?? []);
      setRagResponse(data.ragResponse ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
      setVenues([]);
      setRagResponse(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const matchedVenues = useMemo(
    () => venues.filter((v) => v.similarity >= MIN_SIMILARITY_THRESHOLD),
    [venues]
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="px-4 py-5 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-xl font-bold text-gray-800 tracking-tight">
            ค้นหาสถานที่ด้วย AI
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            ค้นหาด้วยความหมาย และถาม AI เพื่อคำแนะนำ
          </p>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row gap-4 p-4 max-w-7xl w-full mx-auto">
        <aside className="lg:w-[380px] flex flex-col gap-4 shrink-0">
          <SearchBar onSearch={handleSearch} loading={loading} />
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
              {error}
            </div>
          )}
          <section className="flex-1 min-h-0 bg-white rounded-xl shadow-sm border border-gray-100 overflow-auto">
            <RAGResponse
              ragResponse={ragResponse}
              venues={matchedVenues}
              hasSearched={hasSearched}
              onVenueClick={(v) => setFlyToPoint({ lat: v.lat, lng: v.lng })}
            />
          </section>
        </aside>

        <section className="flex-1 min-h-[400px] rounded-xl overflow-hidden shadow-sm border border-gray-100">
          <VenueMap venues={matchedVenues} flyToPoint={flyToPoint} />
        </section>
      </main>
    </div>
  );
}
