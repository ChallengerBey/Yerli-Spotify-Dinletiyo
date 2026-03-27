import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import crypto from 'crypto';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Sabit namespace (random) — aynı UID her zaman aynı UUID'ye map olur
const FIREBASE_UID_NAMESPACE = 'f2c7e00f-3e3d-4a19-9c93-6a7ce3c98e6f';

function uuidToBytes(uuid: string) {
  const hex = uuid.replace(/-/g, '');
  return Buffer.from(hex, 'hex');
}

function bytesToUuid(buf: Buffer) {
  const hex = buf.toString('hex');
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join('-');
}

// UUIDv5 (SHA-1) — name (firebase uid) -> uuid
function uuidv5(name: string, namespace: string) {
  const nsBytes = uuidToBytes(namespace);
  const hash = crypto.createHash('sha1').update(Buffer.concat([nsBytes, Buffer.from(name, 'utf8')])).digest();
  const bytes = hash.subarray(0, 16);

  // Set version 5
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  // Set RFC4122 variant
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  return bytesToUuid(bytes);
}

function normalizeUserIdToUuid(userId: string) {
  if (UUID_REGEX.test(userId)) return userId;
  return uuidv5(userId, FIREBASE_UID_NAMESPACE);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ success: false, nowPlaying: null, error: 'User ID required' }, { status: 400 });
  }

  try {
    const userUuid = normalizeUserIdToUuid(userId);
    const client = supabaseAdmin || supabase;
    const { data, error } = await client
      .from('now_playing')
      .select('*')
      .eq('user_id', userUuid)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Now playing fetch error:', error);
      // Overlay gibi yerler bu endpoint'e anon erişiyor; DB/RLS hatalarında uygulamayı çökertmeyelim.
      return NextResponse.json(
        { success: false, nowPlaying: null, error: error.message },
        { status: 200, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    if (!data) {
      return NextResponse.json({ 
        success: true,
        nowPlaying: null,
        message: 'No song currently playing'
      }, { headers: { 'Cache-Control': 'no-store' } });
    }

    return NextResponse.json({ success: true, nowPlaying: data }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error: any) {
    console.error('Now playing GET error:', error);
    return NextResponse.json(
      { success: false, nowPlaying: null, error: error.message },
      { status: 200, headers: { 'Cache-Control': 'no-store' } }
    );
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

    const userUuid = normalizeUserIdToUuid(userId);

    // Upsert - varsa güncelle, yoksa ekle
    const client = supabaseAdmin || supabase;
    const { data, error } = await client
      .from('now_playing')
      .upsert({
        user_id: userUuid,
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
    const userUuid = normalizeUserIdToUuid(userId);
    const client = supabaseAdmin || supabase;
    const { error } = await client
      .from('now_playing')
      .delete()
      .eq('user_id', userUuid);

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
