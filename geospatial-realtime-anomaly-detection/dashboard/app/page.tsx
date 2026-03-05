"use client";

import dynamic from "next/dynamic";
import { useWebSocket } from "@/hooks/useWebSocket";
import { AlertToast } from "@/components/AlertToast";
import { ConnectionStatus } from "@/components/ConnectionStatus";
import { DEFAULT_WS_URL } from "@/lib/constants";

const VehicleMap = dynamic(
  () => import("@/components/VehicleMap").then((m) => ({ default: m.VehicleMap })),
  { ssr: false }
);

export default function DashboardPage() {
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || DEFAULT_WS_URL;
  const { connected, vehicles, alerts, alertedIds } = useWebSocket(wsUrl);

  return (
    <div className="flex h-screen flex-col bg-slate-900 text-slate-100">
      <header className="flex items-center justify-between border-b border-slate-700 px-6 py-4">
        <h1 className="text-xl font-bold">Geo-Stream: Real-time Anomaly Detection</h1>
        <ConnectionStatus connected={connected} vehicleCount={vehicles.size} />
      </header>

      <div className="relative flex flex-1 overflow-hidden">
        <main className="flex-1">
          <VehicleMap vehicles={vehicles} alertedIds={alertedIds} />
        </main>

        <aside className="w-80 shrink-0 overflow-y-auto border-l border-slate-700 bg-slate-900/50 p-4">
          <h2 className="mb-3 font-semibold text-slate-300">Alerts</h2>
          {alerts.length === 0 ? (
            <p className="text-sm text-slate-500">No alerts yet</p>
          ) : (
            <div className="space-y-2">
              {alerts.map((a, i) => (
                <AlertToast key={`${a.vehicle_id}-${a.timestamp}-${i}`} alert={a} />
              ))}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
