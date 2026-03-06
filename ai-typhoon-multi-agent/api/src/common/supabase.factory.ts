import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * สร้าง Supabase client จาก environment variables
 * คืนค่า null ถ้าไม่มี credentials ที่จำเป็น (graceful degradation)
 */
export function createSupabaseClient(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? createClient(url, key) : null;
}
