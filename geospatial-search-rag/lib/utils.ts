/**
 * Utilities ที่ใช้ร่วมกันในโปรเจกต์
 */

/** Escape HTML เพื่อป้องกัน XSS ใน popup/markup */
export function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

/** สร้างข้อความสำหรับ embedding จาก venue (name + description) */
export function buildVenueTextForEmbedding(
  name: string,
  description?: string | null
): string {
  return [name, description].filter(Boolean).join(" ");
}
