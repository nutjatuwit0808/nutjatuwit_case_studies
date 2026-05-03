/** ค่า k ดีฟอลต์: จำนวน chunk สูงสุดที่นำมาประกอบคำตอบของ agent */
export const DEFAULT_TOP_K = 4;

/** ความยาวสูงสุดของข้อความตัวอย่างใน citation (นับเป็นตัวอักษร) */
export const CITATION_PREVIEW_MAX_CHARS = 180;

/** โมเดล Gemini เมื่อไม่ได้ตั้งค่า GEMINI_MODEL ใน environment */
export const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash-lite";

/** พอร์ต HTTP ดีฟอลต์ของ Nest backend (ให้ตรงกับ URL ใน DEFAULT_API_BASE_URL) */
export const DEFAULT_BACKEND_HTTP_PORT = 4000;

/** URL พื้นฐานของ backend เมื่อไม่ได้ตั้ง NEXT_PUBLIC_API_BASE (รัน local) */
export const DEFAULT_API_BASE_URL = `http://localhost:${DEFAULT_BACKEND_HTTP_PORT}`;

/**
 * path สัมพัทธ์จาก apps/backend ไปยัง sample vault ใน repo
 * (ใช้คู่กับ path.resolve(process.cwd(), ...))
 */
export const WORKSHOP_SAMPLE_VAULT_RELATIVE_PATH = "../../samples/vault";
