interface MapErrorOverlayProps {
  message: string;
}

export function MapErrorOverlay({ message }: MapErrorOverlayProps) {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-red-50 text-red-600">
      {message}
    </div>
  );
}
