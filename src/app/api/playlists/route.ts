import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Kullanıcının playlist'lerini getir
export async function GET(request: NextRequest) {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: playlists, error } = await supabase
      .from('playlists')
      .select(`
        *,
        playlist_songs(
          id,
          song_data
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Playlists fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Playlist'lere şarkı sayısı ekle
    const playlistsWithCounts = playlists?.map(playlist => ({
      ...playlist,
      song_count: playlist.playlist_songs?.length || 0,
      songs: playlist.playlist_songs?.map((ps: any) => ps.song_data) || []
    })) || [];

    return NextResponse.json({ playlists: playlistsWithCounts });
  } catch (error: any) {
    console.error('Playlists GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Yeni playlist oluştur
export async function POST(request: NextRequest) {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, isPublic, imageUrl } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Playlist name is required' }, { status: 400 });
    }

    const { data: playlist, error } = await supabase
      .from('playlists')
      .insert({
        user_id: user.id,
        name: name.trim(),
        description: description?.trim() || '',
        is_public: isPublic !== false, // Default true
        image_url: imageUrl || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Playlist create error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      playlist: {
        ...playlist,
        song_count: 0,
        songs: []
      }
    });
  } catch (error: any) {
    console.error('Playlist POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}