import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Handle missing environment variables gracefully
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export async function GET() {
  try {
    if (!supabase) {
      // Return mock data if Supabase not configured
      return NextResponse.json([
        {
          id: '1',
          email: 'demo@example.com',
          user_metadata: { full_name: 'Demo User' },
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          email: 'test@example.com',
          user_metadata: { full_name: 'Test User' },
          created_at: new Date().toISOString(),
        }
      ]);
    }

    const { data, error } = await supabase
      .from('auth.users')
      .select('id, email, user_metadata, created_at');

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
