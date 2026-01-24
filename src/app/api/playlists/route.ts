import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

function getBearerToken(request: Request) {
  const auth = request.headers.get('authorization') || request.headers.get('Authorization');
  if (!auth) return null;
  const match = auth.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? null;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const publicOnly = searchParams.get('public') === 'true';
    
    const supabase = createClient();
    
    if (userId) {
      const { data: playlists, error } = await supabase
        .from('playlists')
        .select(`
          *,
          playlist_songs (
            id,
            song_id,
            song_data,
            position,
            added_at
          )
        `)
        .eq('user_id', userId)
        .eq(publicOnly ? 'is_public' : 'is_public', publicOnly)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Playlists fetch error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      
      return NextResponse.json({ playlists: playlists || [] });
    }
    
    const token = getBearerToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const supabaseWithAuth = createClient(token);
    const { data: { user }, error: userError } = await supabaseWithAuth.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { data: playlists, error } = await supabase
      .from('playlists')
      .select(`
        *,
        playlist_songs (
          id,
          song_id,
          song_data,
          position,
          added_at
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('User playlists fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ playlists: playlists || [] });
  } catch (error: any) {
    console.error('Playlists GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
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

    const { name, description, is_public = false, cover_image_url } = await request.json();
    
    if (!name?.trim()) {
      return NextResponse.json({ error: 'Playlist name is required' }, { status: 400 });
    }
    
    const supabase = createClient();
    const { data, error } = await supabase
      .from('playlists')
      .insert({
        user_id: user.id,
        name: name.trim(),
        description: description?.trim() || null,
        is_public,
        cover_image_url: cover_image_url?.trim() || null,
      })
      .select()
      .single();
    
    if (error) {
      console.error('Playlist creation error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Playlist created successfully',
      playlist: data
    });
  } catch (error: any) {
    console.error('Playlist POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
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

    const { id, name, description, is_public, cover_image_url } = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: 'Playlist ID is required' }, { status: 400 });
    }
    
    if (!name?.trim()) {
      return NextResponse.json({ error: 'Playlist name is required' }, { status: 400 });
    }
    
    const supabase = createClient();
    const { data, error } = await supabase
      .from('playlists')
      .update({
        name: name.trim(),
        description: description?.trim() || null,
        is_public,
        cover_image_url: cover_image_url?.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();
    
    if (error) {
      console.error('Playlist update error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Playlist updated successfully',
      playlist: data
    });
  } catch (error: any) {
    console.error('Playlist PUT error:', error);
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
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Playlist ID is required' }, { status: 400 });
    }
    
    const supabase = createClient();
    const { error } = await supabase
      .from('playlists')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    
    if (error) {
      console.error('Playlist deletion error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Playlist deleted successfully'
    });
  } catch (error: any) {
    console.error('Playlist DELETE error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
