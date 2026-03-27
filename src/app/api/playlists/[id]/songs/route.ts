import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Playlist'e şarkı ekle
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const playlistId = params.id;
    const body = await request.json();
    const { song } = body;

    if (!song || !song.id) {
      return NextResponse.json({ error: 'Song data is required' }, { status: 400 });
    }

    // Playlist'in kullanıcıya ait olduğunu kontrol et
    const { data: playlist, error: playlistError } = await supabase
      .from('playlists')
      .select('id')
      .eq('id', playlistId)
      .eq('user_id', user.id)
      .single();

    if (playlistError || !playlist) {
      return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });
    }

    // Şarkının zaten playlist'te olup olmadığını kontrol et
    const { data: existingSong } = await supabase
      .from('playlist_songs')
      .select('id')
      .eq('playlist_id', playlistId)
      .eq('song_id', song.id)
      .single();

    if (existingSong) {
      return NextResponse.json({ error: 'Song already in playlist' }, { status: 409 });
    }

    // Mevcut şarkı sayısını al (pozisyon için)
    const { count } = await supabase
      .from('playlist_songs')
      .select('*', { count: 'exact', head: true })
      .eq('playlist_id', playlistId);

    const position = (count || 0) + 1;

    // Şarkıyı playlist'e ekle
    const { data: playlistSong, error } = await supabase
      .from('playlist_songs')
      .insert({
        playlist_id: playlistId,
        song_id: song.id,
        song_data: song,
        position: position,
        added_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Add song to playlist error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Playlist'in updated_at'ini güncelle
    await supabase
      .from('playlists')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', playlistId);

    return NextResponse.json({ 
      success: true,
      playlistSong
    });
  } catch (error: any) {
    console.error('Add song POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Playlist'ten şarkı çıkar
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const playlistId = params.id;
    const { searchParams } = new URL(request.url);
    const songId = searchParams.get('songId');

    if (!songId) {
      return NextResponse.json({ error: 'Song ID is required' }, { status: 400 });
    }

    // Playlist'in kullanıcıya ait olduğunu kontrol et
    const { data: playlist, error: playlistError } = await supabase
      .from('playlists')
      .select('id')
      .eq('id', playlistId)
      .eq('user_id', user.id)
      .single();

    if (playlistError || !playlist) {
      return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });
    }

    // Şarkıyı playlist'ten çıkar
    const { error } = await supabase
      .from('playlist_songs')
      .delete()
      .eq('playlist_id', playlistId)
      .eq('song_id', songId);

    if (error) {
      console.error('Remove song from playlist error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Playlist'in updated_at'ini güncelle
    await supabase
      .from('playlists')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', playlistId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Remove song DELETE error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}