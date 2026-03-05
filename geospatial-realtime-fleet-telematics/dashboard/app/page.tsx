"use client";

import dynamic from "next/dynamic";

const FleetMap = dynamic(
  () => import("@/components/FleetMap").then((m) => ({ default: m.FleetMap })),
  { ssr: false }
);

export default function DashboardPage() {
  return (
    <div className="flex h-screen flex-col bg-slate-900 text-slate-100">
      <header className="flex items-center justify-between border-b border-slate-700 px-6 py-4">
        <h1 className="text-xl font-bold">Fleet MVT: Real-time Fleet Telematics</h1>
        <span className="text-sm text-slate-400">200k vehicles · Spatial interpolation</span>
      </header>

      <main className="relative flex flex-1 overflow-hidden">
        <FleetMap />
      </main>
    </div>
  );
}
