interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  iconBgClassName?: string;
}

/** Empty state card ที่ใช้ซ้ำได้ - icon + title + description */
export function EmptyState({
  icon,
  title,
  description,
  iconBgClassName = "bg-sky-100",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] p-6 text-center">
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${iconBgClassName}`}
      >
        {icon}
      </div>
      <p className="text-gray-600 font-medium mb-1">{title}</p>
      <p className="text-sm text-gray-500 max-w-[260px]">{description}</p>
    </div>
  );
}
