import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

function getBearerToken(request: Request) {
  const auth = request.headers.get('authorization') || request.headers.get('Authorization');
  if (!auth) return null;
  const match = auth.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? null;
}

export async function POST(request: Request) {
  try {
    const token = getBearerToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseWithAuth = createClient(token);
    const { data: { user }, error: userError } = await supabaseWithAuth.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { playlist_id, song_id, song_data, position } = await request.json();
    
    if (!playlist_id || !song_id || !song_data) {
      return NextResponse.json({ 
        error: 'Playlist ID, song ID, and song data are required' 
      }, { status: 400 });
    }
    
    const supabase = createClient();
    
    // Check if user owns the playlist
    const { data: playlist, error: playlistError } = await supabase
      .from('playlists')
      .select('user_id')
      .eq('id', playlist_id)
      .single();
    
    if (playlistError || !playlist) {
      return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });
    }
    
    if (playlist.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    // Get current max position if not provided
    let finalPosition = position;
    if (finalPosition === undefined || finalPosition === null) {
      const { data: maxPos } = await supabase
        .from('playlist_songs')
        .select('position')
        .eq('playlist_id', playlist_id)
        .order('position', { ascending: false })
        .limit(1);
      
      finalPosition = (maxPos?.[0]?.position || 0) + 1;
    }
    
    const { data, error } = await supabase
      .from('playlist_songs')
      .insert({
        playlist_id,
        song_id,
        song_data,
        position: finalPosition,
      })
      .select()
      .single();
    
    if (error) {
      console.error('Add song to playlist error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // Update playlist song count and duration
    const { data: allSongs } = await supabase
      .from('playlist_songs')
      .select('song_data')
      .eq('playlist_id', playlist_id);
    
    const totalDuration = allSongs?.reduce((sum, song) => {
      return sum + (song.song_data?.duration_ms || 0);
    }, 0) || 0;
    
    await supabase
      .from('playlists')
      .update({
        song_count: allSongs?.length || 0,
        total_duration_ms: totalDuration,
        updated_at: new Date().toISOString(),
      })
      .eq('id', playlist_id);
    
    return NextResponse.json({ 
      success: true,
      message: 'Song added to playlist successfully',
      song: data
    });
  } catch (error: any) {
    console.error('Playlist songs POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const token = getBearerToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseWithAuth = createClient(token);
    const { data: { user }, error: userError } = await supabaseWithAuth.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const playlist_id = searchParams.get('playlist_id');
    const song_id = searchParams.get('song_id');
    
    if (!playlist_id || !song_id) {
      return NextResponse.json({ 
        error: 'Playlist ID and song ID are required' 
      }, { status: 400 });
    }
    
    const supabase = createClient();
    
    // Check if user owns the playlist
    const { data: playlist, error: playlistError } = await supabase
      .from('playlists')
      .select('user_id')
      .eq('id', playlist_id)
      .single();
    
    if (playlistError || !playlist) {
      return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });
    }
    
    if (playlist.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    const { error } = await supabase
      .from('playlist_songs')
      .delete()
      .eq('playlist_id', playlist_id)
      .eq('song_id', song_id);
    
    if (error) {
      console.error('Remove song from playlist error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // Update playlist song count and duration
    const { data: allSongs } = await supabase
      .from('playlist_songs')
      .select('song_data')
      .eq('playlist_id', playlist_id);
    
    const totalDuration = allSongs?.reduce((sum, song) => {
      return sum + (song.song_data?.duration_ms || 0);
    }, 0) || 0;
    
    await supabase
      .from('playlists')
      .update({
        song_count: allSongs?.length || 0,
        total_duration_ms: totalDuration,
        updated_at: new Date().toISOString(),
      })
      .eq('id', playlist_id);
    
    return NextResponse.json({ 
      success: true,
      message: 'Song removed from playlist successfully'
    });
  } catch (error: any) {
    console.error('Playlist songs DELETE error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
