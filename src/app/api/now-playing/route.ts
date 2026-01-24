import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID required' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from('now_playing')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Now playing fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ 
        nowPlaying: null,
        message: 'No song currently playing'
      });
    }

    return NextResponse.json({ nowPlaying: data });
  } catch (error: any) {
    console.error('Now playing GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if request has a body
    const contentLength = request.headers.get('content-length');
    if (!contentLength || contentLength === '0') {
      return NextResponse.json({ error: 'Empty request body' }, { status: 400 });
    }

    let body;
    try {
      const text = await request.text();
      if (!text.trim()) {
        return NextResponse.json({ error: 'Empty request body' }, { status: 400 });
      }
      body = JSON.parse(text);
    } catch (parseError) {
      console.error('JSON parse error in now-playing:', parseError);
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }

    const { userId, song, progress, duration, isPlaying } = body;

    if (!userId || !song) {
      return NextResponse.json({ error: 'User ID and song required' }, { status: 400 });
    }

    // Upsert - varsa güncelle, yoksa ekle
    const { data, error } = await supabase
      .from('now_playing')
      .upsert({
        user_id: userId,
        song_id: song.id,
        song_title: song.title,
        song_artist: song.artist,
        song_image_url: song.imageUrl,
        song_audio_url: song.audioUrl,
        progress: progress || 0,
        duration: duration || 0,
        is_playing: isPlaying !== undefined ? isPlaying : true,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single();

    if (error) {
      console.error('Now playing upsert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      nowPlaying: data
    });
  } catch (error: any) {
    console.error('Now playing POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID required' }, { status: 400 });
  }

  try {
    const { error } = await supabase
      .from('now_playing')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('Now playing delete error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Now playing cleared'
    });
  } catch (error: any) {
    console.error('Now playing DELETE error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
