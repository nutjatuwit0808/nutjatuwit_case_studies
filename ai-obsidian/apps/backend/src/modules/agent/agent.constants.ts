/** ข้อความระบบสำหรับ LLM: บังคับให้ตอบจาก context และสื่อสารตรงไปตรงมา */
export const AGENT_SYSTEM_PROMPT =
  "คุณคือ AI คู่คิดของวิศวกรซอฟต์แวร์ ตอบจาก context เท่านั้น ถ้าไม่พอให้บอกตรงๆ";

/** คั่นระหว่าง chunk ตอนประกอบ context สำหรับคำถามทั่วไป */
export const CONTEXT_SEPARATOR_ASK = "\n\n---\n\n";

/** คั่นระหว่าง chunk ตอนสรุปโน้ตเดียว */
export const CONTEXT_SEPARATOR_SUMMARIZE = "\n\n";

/** จำกัดความยาว context ในข้อความ fallback เมื่อไม่มี API key */
export const FALLBACK_CONTEXT_MAX_CHARS = 500;
