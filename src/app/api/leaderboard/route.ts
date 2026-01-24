import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'all_time';

    // Get user listening stats
    const { data: stats, error } = await supabase.rpc('get_user_listening_stats');

    if (error) {
      console.error('Error fetching leaderboard:', error);
      
      // Fallback: Get basic user data
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .limit(50);

      if (usersError) {
        return NextResponse.json({ 
          period,
          leaderboard: [],
          current_user: null 
        });
      }

      // Create empty leaderboard
      const emptyLeaderboard = users?.map((user, index) => ({
        rank: index + 1,
        user_id: user.id,
        username: user.username || `User${index + 1}`,
        avatar_url: user.avatar_url,
        total_songs: 0,
        listening_time_ms: 0,
        favorite_artist: 'Various Artists',
        current_streak: 0,
        points: 0
      })) || [];

      return NextResponse.json({
        period,
        leaderboard: emptyLeaderboard,
        current_user: emptyLeaderboard[0] || null
      });
    }

    return NextResponse.json({
      period,
      leaderboard: stats || [],
      current_user: stats?.[0] || null
    });

  } catch (error) {
    console.error('Error in leaderboard API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}