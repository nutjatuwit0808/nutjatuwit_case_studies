/**
 * Helper สำหรับ API routes - ลดความซ้ำซ้อนของ error handling
 */

import { NextResponse } from "next/server";

/** แปลง error เป็นข้อความ string */
export function getErrorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

/** สร้าง JSON error response แบบมาตรฐาน */
export function jsonError(
  error: string,
  status: number,
  extra?: Record<string, unknown>
) {
  return NextResponse.json({ error, ...extra }, { status });
}
