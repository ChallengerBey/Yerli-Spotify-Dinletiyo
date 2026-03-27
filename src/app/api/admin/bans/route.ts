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
          user_id: 'demo-user-1',
          ban_reason: 'Spam behavior',
          ban_type: 'temporary',
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          is_active: true,
        },
        {
          id: '2',
          user_id: 'demo-user-2',
          ban_reason: 'Inappropriate content',
          ban_type: 'permanent',
          expires_at: null,
          is_active: true,
        }
      ]);
    }

    const { data, error } = await supabase
      .from('user_bans')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching bans:', error);
    return NextResponse.json({ error: 'Failed to fetch bans' }, { status: 500 });
  }
}