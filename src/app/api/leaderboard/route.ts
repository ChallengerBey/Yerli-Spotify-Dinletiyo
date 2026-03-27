import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Gösterim için kullanıcı adını temizle: email veya uygunsuz içerik göstermeyelim
function sanitizeDisplayName(username: string | null | undefined, userId: string): string {
  const raw = (username || '').trim();
  if (!raw) return `Kullanıcı_${userId.slice(-4)}`;

  // E-posta formatındaysa (deneme@gmail.com_79b3 gibi) anonim göster
  if (raw.includes('@') || /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(raw)) {
    const suffix = raw.includes('_') ? raw.split('_').pop()?.slice(0, 4) : userId.slice(-4);
    return `Kullanıcı_${(suffix || userId.slice(-4)).replace(/[^a-zA-Z0-9]/g, '')}`;
  }

  const inappropriateWords = [
    'sikis', 'sik', 'amk', 'orospu', 'piç', 'göt', 'yarrak', 'am', 'pussy', 'fuck', 'shit', 'bitch',
    'sex', 'porn', 'xxx', 'anal', 'oral', 'nude', 'naked', 'dick', 'cock', 'ass', 'boob', 'tit'
  ];
  const lower = raw.toLowerCase();
  if (inappropriateWords.some(word => lower.includes(word))) {
    return `Kullanıcı_${userId.slice(-4)}`;
  }

  // Uzun veya garip karakterleri kısalt
  const cleaned = raw.replace(/\s+/g, ' ').slice(0, 25);
  return cleaned || `Kullanıcı_${userId.slice(-4)}`;
}

// Not: Bu endpoint prod'da sahte/demo leaderboard üretmez.

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'all_time';
    const userId = searchParams.get('userId'); // Kullanıcı ID'si varsa al
    
    // Get user listening stats
    const { data: stats, error } = await supabase.rpc('get_user_listening_stats');

    if (error) {
      console.error('Error fetching leaderboard RPC:', error);

      // Önce leaderboard_stats tablosundan gerçek veri dene (varsa)
      const { data: lbRows } = await supabase
        .from('leaderboard_stats')
        .select(`
          user_id,
          rank,
          points,
          songs_played,
          listening_time_ms
        `)
        .eq('period', period === 'all_time' ? 'all_time' : period)
        .order('points', { ascending: false })
        .limit(50);

      if (lbRows && lbRows.length > 0) {
        const userIds = lbRows.map((r: { user_id: string }) => r.user_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .in('id', userIds);

        const profileMap = new Map((profiles || []).map((p: { id: string; username?: string; avatar_url?: string }) => [p.id, p]));
        const leaderboard = lbRows.map((row: any, index: number) => {
          const profile = profileMap.get(row.user_id);
          return {
            rank: row.rank ?? index + 1,
            user_id: row.user_id,
            username: sanitizeDisplayName(profile?.username, row.user_id),
            avatar_url: profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${row.user_id}`,
            total_songs: row.songs_played ?? 0,
            listening_time_ms: row.listening_time_ms ?? 0,
            points: row.points ?? 0,
            current_streak: 0
          };
        });

        let currentUser = null;
        if (userId) currentUser = leaderboard.find((e: any) => e.user_id === userId) || null;

        return NextResponse.json({
          period,
          leaderboard,
          current_user: currentUser,
          source: 'live'
        });
      }

      // Gerçek veri yoksa (veya RPC başarısızsa) sahte veri üretme.
      return NextResponse.json({
        period,
        leaderboard: [],
        current_user: null,
        source: 'live'
      });
    }

    // RPC başarılı: gelen verideki kullanıcı adlarını temizle
    const leaderboard = (stats || []).map((entry: any, index: number) => ({
      ...entry,
      rank: entry.rank ?? index + 1,
      username: sanitizeDisplayName(entry.username, entry.user_id || String(index)),
      total_songs: entry.total_songs ?? entry.songs_played ?? 0,
      listening_time_ms: entry.listening_time_ms ?? 0
    }));

    return NextResponse.json({
      period,
      leaderboard,
      current_user: leaderboard.find((e: any) => e.user_id === userId) || null,
      source: 'live'
    });

  } catch (error) {
    console.error('Error in leaderboard API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}