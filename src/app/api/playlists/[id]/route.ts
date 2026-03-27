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
      .from('user_playlists')
      .select('*')
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

    const playlistWithSongs = {
      ...playlist,
      id: playlist.id,
      name: playlist.title, // Map title to name for frontend compatibility
      songCount: playlist.songs ? playlist.songs.length : 0,
      songs: playlist.songs || []
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
    const { name, title, description, isPublic, imageUrl, songs } = body;

    // Frontend might send 'name' but DB expects 'title'
    const playlistTitle = title || name;

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (playlistTitle !== undefined) updateData.title = playlistTitle.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (isPublic !== undefined) updateData.is_public = isPublic;
    if (imageUrl !== undefined) updateData.image_url = imageUrl;
    if (songs !== undefined) updateData.songs = songs;

    const { data: playlist, error } = await supabase
      .from('user_playlists')
      .update(updateData)
      .eq('id', playlistId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Playlist update error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      playlist: {
        ...playlist,
        name: playlist.title
      }
    });
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

    const { error } = await supabase
      .from('user_playlists')
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