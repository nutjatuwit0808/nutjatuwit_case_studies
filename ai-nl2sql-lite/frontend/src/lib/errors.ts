/**
 * แปลง error เป็นข้อความที่แสดงให้ผู้ใช้เห็น
 * ใช้เมื่อ catch exception จาก try/catch
 */
export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
}
