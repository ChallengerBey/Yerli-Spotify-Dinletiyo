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
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type');
    
    const supabase = createClient();
    let query = supabase
      .from('activity_feed')
      .select(`
        *,
        profiles:user_id (username, avatar_url)
      `)
      .or(`user_id.eq.${user.id},and(is_public.eq.true,${type ? `activity_type.eq.${type}` : ''})`)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    const { data: activities, error } = await query;
    
    if (error) {
      console.error('Activity feed fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true,
      activities: activities || []
    });
  } catch (error: any) {
    console.error('Activity feed GET error:', error);
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

    const { activity_type, activity_data, is_public = true } = await request.json();
    
    if (!activity_type || !activity_data) {
      return NextResponse.json({ 
        error: 'Activity type and data are required' 
      }, { status: 400 });
    }
    
    const validTypes = ['song_liked', 'playlist_created', 'friend_added', 'song_played', 'playlist_shared', 'achievement_earned'];
    if (!validTypes.includes(activity_type)) {
      return NextResponse.json({ 
        error: 'Invalid activity type' 
      }, { status: 400 });
    }
    
    const supabase = createClient();
    const { data, error } = await supabase
      .from('activity_feed')
      .insert({
        user_id: user.id,
        activity_type,
        activity_data,
        is_public
      })
      .select()
      .single();
    
    if (error) {
      console.error('Activity creation error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Activity recorded successfully',
      activity: data
    });
  } catch (error: any) {
    console.error('Activity feed POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
