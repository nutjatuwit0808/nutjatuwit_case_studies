"use client";

interface MapErrorOverlayProps {
  message: string;
}

export function MapErrorOverlay({ message }: MapErrorOverlayProps) {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/80 backdrop-blur">
      <div className="rounded-lg border border-red-500/50 bg-red-950/90 px-6 py-4 text-red-200">
        {message}
      </div>
    </div>
  );
}
