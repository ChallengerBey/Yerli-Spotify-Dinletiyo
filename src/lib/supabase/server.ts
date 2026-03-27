import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://axcixgsyofjpwxlvikes.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_Gy2F5DmqCGyMmApmv3YgoA_qXJcGen8';

export function createClient(accessToken?: string) {
  const options: any = {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  };

  if (accessToken) {
    options.global = {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    };
  }

  return createSupabaseClient(supabaseUrl, supabaseKey, options);
}
