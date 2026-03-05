"use client";

import type { AlertPayload } from "@/types/websocket";

interface AlertToastProps {
  alert: AlertPayload;
}

export function AlertToast({ alert }: AlertToastProps) {
  return (
    <div className="rounded-lg border border-red-500/50 bg-red-950/90 px-4 py-3 shadow-lg backdrop-blur">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
        <span className="font-semibold text-red-400">{alert.vehicle_id}</span>
      </div>
      <ul className="mt-1 text-sm text-red-200">
        {alert.anomaly_types.map((t, i) => (
          <li key={i}>{t}</li>
        ))}
      </ul>
    </div>
  );
}
