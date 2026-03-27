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
          title: 'Demo Song 1',
          artist: 'Demo Artist',
          duration_ms: 180000,
          uploaded_by: 'admin',
          play_count: 1250,
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'Demo Song 2',
          artist: 'Another Artist',
          duration_ms: 210000,
          uploaded_by: 'admin',
          play_count: 890,
          created_at: new Date().toISOString(),
        }
      ]);
    }

    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching songs:', error);
    return NextResponse.json({ error: 'Failed to fetch songs' }, { status: 500 });
  }
}
