import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

async function fetchLyricsFromAPI(songTitle: string, artist: string) {
  try {
    const response = await fetch(
      `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(songTitle)}`
    );
    
    if (response.ok) {
      const data = await response.json();
      return data.lyrics || null;
    }
    
    return null;
  } catch (error) {
    console.error('Lyrics API error:', error);
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const songId = searchParams.get('song_id');
    const songTitle = searchParams.get('title');
    const artist = searchParams.get('artist');

    if (!songId && (!songTitle || !artist)) {
      return NextResponse.json(
        { error: 'song_id or (title and artist) are required' },
        { status: 400 }
      );
    }

    if (songId) {
      const { data: cachedLyrics, error } = await supabase
        .from('lyrics')
        .select('*')
        .eq('song_id', songId)
        .single();

      if (!error && cachedLyrics) {
        return NextResponse.json({ lyrics: cachedLyrics });
      }
    }

    if (!songTitle || !artist) {
      return NextResponse.json(
        { error: 'Song not found in cache, title and artist required' },
        { status: 404 }
      );
    }

    const lyricsText = await fetchLyricsFromAPI(songTitle, artist);

    if (!lyricsText) {
      return NextResponse.json(
        { error: 'Lyrics not found' },
        { status: 404 }
      );
    }

    const { data: savedLyrics, error: saveError } = await supabase
      .from('lyrics')
      .insert({
        song_id: songId || `${artist}-${songTitle}`.replace(/\s+/g, '-').toLowerCase(),
        song_title: songTitle,
        artist: artist,
        lyrics_text: lyricsText,
        source: 'lyrics.ovh',
      })
      .select()
      .single();

    if (saveError) {
      console.error('Failed to save lyrics:', saveError);
    }

    return NextResponse.json({ 
      lyrics: savedLyrics || {
        song_id: songId,
        song_title: songTitle,
        artist: artist,
        lyrics_text: lyricsText,
        source: 'lyrics.ovh',
      }
    });
  } catch (error) {
    console.error('Lyrics endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
