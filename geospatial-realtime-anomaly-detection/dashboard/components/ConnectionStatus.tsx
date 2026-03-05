"use client";

interface ConnectionStatusProps {
  connected: boolean;
  vehicleCount: number;
}

export function ConnectionStatus({ connected, vehicleCount }: ConnectionStatusProps) {
  return (
    <div className="flex items-center gap-4">
      <span
        className={`flex items-center gap-2 text-sm ${
          connected ? "text-emerald-400" : "text-amber-400"
        }`}
      >
        <span
          className={`h-2 w-2 rounded-full ${connected ? "bg-emerald-500" : "bg-amber-500"}`}
        />
        {connected ? "Connected" : "Disconnected"}
      </span>
      <span className="text-sm text-slate-400">{vehicleCount} vehicles</span>
    </div>
  );
}
