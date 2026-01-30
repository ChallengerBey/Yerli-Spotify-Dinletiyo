import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://axcixgsyofjpwxlvikes.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_Gy2F5DmqCGyMmApmv3YgoA_qXJcGen8';

// Export the client for use in other files (like auth.ts)
export const supabase = createClient(supabaseUrl, supabaseKey)

// Wrapper functions below are kept for backward compatibility if used anywhere else directly,
// but they now just wrap the logic we might want to consolidate.
// In a full refactor, we might move all logic to auth.ts or a service layer,
// but for now, ensuring they use the DB is the goal.

export async function getSession() {
  const { data, error } = await supabase.auth.getSession()
  return { session: data.session, error }
}