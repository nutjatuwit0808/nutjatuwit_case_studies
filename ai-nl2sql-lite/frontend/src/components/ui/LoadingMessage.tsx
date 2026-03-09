"use client";

type Props = {
  message?: string;
  className?: string;
};

/** ข้อความโหลดกลางจอ ใช้ใน SchemaPanel, ResultsPanel */
export function LoadingMessage({ message = "กำลังโหลด...", className }: Props) {
  return (
    <div
      className={`flex h-full items-center justify-center p-4 text-[#666] ${className ?? ""}`}
    >
      {message}
    </div>
  );
}
