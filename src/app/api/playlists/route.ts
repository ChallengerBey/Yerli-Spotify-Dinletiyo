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
      .from('user_playlists')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Playlists fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Playlist'lere şarkı sayısı ekle ve dön
    const playlistsWithCounts = playlists?.map(playlist => ({
      ...playlist,
      id: playlist.id,
      name: playlist.title, // Frontend expects 'name', DB serves 'title'
      songCount: playlist.songs ? playlist.songs.length : 0,
      songs: playlist.songs || []
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
    const { name, title, description, isPublic, imageUrl, songs } = body;

    // Frontend might send 'name' but DB expects 'title'
    const playlistTitle = title || name;

    if (!playlistTitle?.trim()) {
      return NextResponse.json({ error: 'Playlist name is required' }, { status: 400 });
    }

    const { data: playlist, error } = await supabase
      .from('user_playlists')
      .insert({
        user_id: user.id,
        title: playlistTitle.trim(),
        description: description?.trim() || '',
        is_public: isPublic !== false, // Default true
        image_url: imageUrl || null,
        songs: songs || [],
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
        name: playlist.title, // remap for frontend
        song_count: playlist.songs ? playlist.songs.length : 0
      }
    });
  } catch (error: any) {
    console.error('Playlist POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}