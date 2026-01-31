import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Playlist detaylarını getir
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const playlistId = params.id;

    const { data: playlist, error } = await supabase
      .from('playlists')
      .select(`
        *,
        playlist_songs(
          id,
          song_data,
          position,
          added_at
        )
      `)
      .eq('id', playlistId)
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Playlist fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!playlist) {
      return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });
    }

    // Şarkıları pozisyona göre sırala
    const sortedSongs = playlist.playlist_songs?.sort((a: any, b: any) => a.position - b.position) || [];

    const playlistWithSongs = {
      ...playlist,
      song_count: sortedSongs.length,
      songs: sortedSongs.map((ps: any) => ps.song_data)
    };

    return NextResponse.json({ playlist: playlistWithSongs });
  } catch (error: any) {
    console.error('Playlist GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Playlist'i güncelle
export async function PUT(
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
    const { name, description, isPublic, imageUrl } = body;

    const { data: playlist, error } = await supabase
      .from('playlists')
      .update({
        name: name?.trim(),
        description: description?.trim() || '',
        is_public: isPublic,
        image_url: imageUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', playlistId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Playlist update error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, playlist });
  } catch (error: any) {
    console.error('Playlist PUT error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Playlist'i sil
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

    // Önce playlist'teki şarkıları sil
    await supabase
      .from('playlist_songs')
      .delete()
      .eq('playlist_id', playlistId);

    // Sonra playlist'i sil
    const { error } = await supabase
      .from('playlists')
      .delete()
      .eq('id', playlistId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Playlist delete error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Playlist DELETE error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}