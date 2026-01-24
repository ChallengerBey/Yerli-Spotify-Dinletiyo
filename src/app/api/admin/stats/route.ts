import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Build sırasında environment variables olmayabilir
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Sadece environment variables varsa client oluştur
const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export async function GET() {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    // Get total users
    const { count: totalUsers } = await supabase
      .from('auth.users')
      .select('*', { count: 'exact' });

    // Get total songs
    const { data: songs } = await supabase
      .from('songs')
      .select('play_count');

    const totalPlays = songs?.reduce((sum, song) => sum + (song.play_count || 0), 0) || 0;

    // Get recent signups (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { count: recentSignups } = await supabase
      .from('auth.users')
      .select('*', { count: 'exact' })
      .gte('created_at', sevenDaysAgo);

    return NextResponse.json({
      total_users: totalUsers || 0,
      total_songs: songs?.length || 0,
      total_plays: totalPlays,
      recent_signups: recentSignups || 0,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
