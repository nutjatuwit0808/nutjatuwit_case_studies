interface MapErrorOverlayProps {
  message: string;
}

export function MapErrorOverlay({ message }: MapErrorOverlayProps) {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-gray-50/95 backdrop-blur-sm p-6">
      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
        <svg
          className="w-5 h-5 text-red-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <p className="text-sm text-red-600 text-center max-w-[280px]">{message}</p>
    </div>
  );
}
