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
    const limit = parseInt(searchParams.get('limit') || '50');
    
    const supabase = createClient();
    const { data: favorites, error } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', user.id)
      .order('added_at', { ascending: false })
      .limit(limit);
      
    if (error) {
      console.error('Favorites fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ favorites: favorites || [] });
  } catch (error: any) {
    console.error('Favorites GET error:', error);
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

    const { song_id, song_data } = await request.json();
    
    if (!song_id || !song_data) {
      return NextResponse.json({ 
        error: 'Song ID and song data are required' 
      }, { status: 400 });
    }
    
    const supabase = createClient();
    const { data, error } = await supabase
      .from('favorites')
      .insert({
        user_id: user.id,
        song_id,
        song_data,
      })
      .select()
      .single();
    
    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ 
          error: 'Song already in favorites' 
        }, { status: 400 });
      }
      console.error('Add favorite error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Song added to favorites successfully',
      favorite: data
    });
  } catch (error: any) {
    console.error('Favorites POST error:', error);
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
    const song_id = searchParams.get('song_id');
    
    if (!song_id) {
      return NextResponse.json({ 
        error: 'Song ID is required' 
      }, { status: 400 });
    }
    
    const supabase = createClient();
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('song_id', song_id);
    
    if (error) {
      console.error('Remove favorite error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Song removed from favorites successfully'
    });
  } catch (error: any) {
    console.error('Favorites DELETE error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
