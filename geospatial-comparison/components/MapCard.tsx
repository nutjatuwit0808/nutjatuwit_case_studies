import type { MapMetrics } from "@/types/map";

type MapCardTheme = "blue" | "emerald";

const THEME_CLASSES: Record<
  MapCardTheme,
  { header: string; title: string }
> = {
  blue: {
    header: "border-b border-zinc-200 bg-blue-50 px-4 py-3 dark:border-zinc-700 dark:bg-blue-900/20",
    title: "font-semibold text-blue-700 dark:text-blue-300",
  },
  emerald: {
    header: "border-b border-zinc-200 bg-emerald-50 px-4 py-3 dark:border-zinc-700 dark:bg-emerald-900/20",
    title: "font-semibold text-emerald-700 dark:text-emerald-300",
  },
};

interface MapCardProps {
  title: string;
  subtitle: string;
  theme: MapCardTheme;
  metrics: MapMetrics | null;
  children: React.ReactNode;
}

export function MapCard({
  title,
  subtitle,
  theme,
  metrics,
  children,
}: MapCardProps) {
  const classes = THEME_CLASSES[theme];

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <div className={classes.header}>
        <h3 className={classes.title}>{title}</h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{subtitle}</p>
      </div>
      <div className="min-h-[300px] flex-1 md:min-h-[400px]">{children}</div>
      {metrics && (
        <div className="border-t border-zinc-200 px-4 py-2 text-xs text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
          Load: {metrics.loadTimeMs.toFixed(0)}ms | Size:{" "}
          {metrics.fileSizeKb.toFixed(2)} KB
        </div>
      )}
    </div>
  );
}
