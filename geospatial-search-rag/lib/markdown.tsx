import type { ReactNode } from "react";

/**
 * แปลง **bold** markdown เป็น <strong>
 * ใช้สำหรับแสดง RAG response ที่มี bold
 */
export function renderMarkdownBold(text: string): ReactNode[] {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : part
  );
}
