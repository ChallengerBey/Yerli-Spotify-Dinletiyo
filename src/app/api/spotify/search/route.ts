import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const artist = searchParams.get('artist');
  const title = searchParams.get('title');

  if (!artist || !title) {
    return NextResponse.json(
      { success: false, error: 'Artist and title are required' },
      { status: 400 }
    );
  }

  // Spotify credentials kontrolü
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    // Credentials yoksa sessizce null döndür
    return NextResponse.json({ success: false, albumArt: null });
  }

  try {
    // Spotify access token al
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      },
      body: 'grant_type=client_credentials',
    });

    if (!tokenResponse.ok) {
      return NextResponse.json({ success: false, albumArt: null });
    }

    const { access_token } = await tokenResponse.json();

    // Şarkı ara
    const query = `track:${title} artist:${artist}`;
    const searchResponse = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=1`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    if (!searchResponse.ok) {
      return NextResponse.json({ success: false, albumArt: null });
    }

    const searchData = await searchResponse.json();

    if (searchData.tracks?.items?.length > 0) {
      const track = searchData.tracks.items[0];
      const albumArt = track.album?.images?.[0]?.url || null;
      
      return NextResponse.json({ success: true, albumArt });
    }

    return NextResponse.json({ success: false, albumArt: null });
  } catch (error) {
    console.error('Spotify API error:', error);
    return NextResponse.json({ success: false, albumArt: null });
  }
}
