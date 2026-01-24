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
    const { data: recentlyPlayed, error } = await supabase
      .from('recently_played')
      .select('*')
      .eq('user_id', user.id)
      .order('played_at', { ascending: false })
      .limit(limit);
      
    if (error) {
      console.error('Recently played fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ recentlyPlayed: recentlyPlayed || [] });
  } catch (error: any) {
    console.error('Recently played GET error:', error);
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

    const { song_id, song_data, duration_ms, played_duration_ms } = await request.json();
    
    if (!song_id || !song_data) {
      return NextResponse.json({ 
        error: 'Song ID and song data are required' 
      }, { status: 400 });
    }
    
    const supabase = createClient();
    
    // Check if song already exists in recently played
    const { data: existing } = await supabase
      .from('recently_played')
      .select('id')
      .eq('user_id', user.id)
      .eq('song_id', song_id)
      .single();
    
    if (existing) {
      // Update existing record
      const { data, error } = await supabase
        .from('recently_played')
        .update({
          song_data,
          played_at: new Date().toISOString(),
          duration_ms,
          played_duration_ms,
        })
        .eq('id', existing.id)
        .select()
        .single();
      
      if (error) {
        console.error('Update recently played error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      
      return NextResponse.json({ 
        success: true,
        message: 'Recently played updated successfully',
        recentlyPlayed: data
      });
    } else {
      // Insert new record
      const { data, error } = await supabase
        .from('recently_played')
        .insert({
          user_id: user.id,
          song_id,
          song_data,
          duration_ms,
          played_duration_ms,
        })
        .select()
        .single();
      
      if (error) {
        console.error('Add recently played error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      
      return NextResponse.json({ 
        success: true,
        message: 'Song added to recently played successfully',
        recentlyPlayed: data
      });
    }
  } catch (error: any) {
    console.error('Recently played POST error:', error);
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
    const clear_all = searchParams.get('clear_all') === 'true';
    
    const supabase = createClient();
    
    if (clear_all) {
      // Clear all recently played for user
      const { error } = await supabase
        .from('recently_played')
        .delete()
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Clear recently played error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      
      return NextResponse.json({ 
        success: true,
        message: 'Recently played history cleared successfully'
      });
    } else if (song_id) {
      // Remove specific song
      const { error } = await supabase
        .from('recently_played')
        .delete()
        .eq('user_id', user.id)
        .eq('song_id', song_id);
      
      if (error) {
        console.error('Remove from recently played error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      
      return NextResponse.json({ 
        success: true,
        message: 'Song removed from recently played successfully'
      });
    } else {
      return NextResponse.json({ 
        error: 'Song ID or clear_all parameter is required' 
      }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Recently played DELETE error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
