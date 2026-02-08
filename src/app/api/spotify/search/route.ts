import { NextRequest, NextResponse } from 'next/server';

interface SpotifySearchResult {
  tracks: {
    items: Array<{
      album: {
        images: Array<{
          url: string;
          height: number;
          width: number;
        }>;
      };
      name: string;
      artists: Array<{ name: string }>;
    }>;
  };
}

interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

// Token cache (server-side)
let cachedToken: string | null = null;
let tokenExpiry: number = 0;

async function getSpotifyToken(): Promise<string | null> {
  // Cache'deki token hala geçerliyse onu kullan
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET;

  // Eğer credentials yoksa hata döndür
  if (!clientId || !clientSecret) {
    console.error('❌ Spotify credentials bulunamadı! .env.local dosyasını kontrol edin.');
    console.log('📝 Kurulum için SPOTIFY_SETUP.md dosyasına bakın.');
    return null;
  }

  try {
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${auth}`
      },
      body: 'grant_type=client_credentials',
      cache: 'no-store'
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Spotify token error:', response.status, errorText);
      return null;
    }

    const data: SpotifyTokenResponse = await response.json();
    cachedToken = data.access_token;
    tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000;
    
    console.log('✅ Spotify token başarıyla alındı');
    return cachedToken;
  } catch (error) {
    console.error('❌ Spotify token fetch error:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const artist = searchParams.get('artist');
  const title = searchParams.get('title');

  if (!artist || !title) {
    return NextResponse.json(
      { error: 'Artist and title are required' },
      { status: 400 }
    );
  }

  try {
    const token = await getSpotifyToken();
    if (!token) {
      // Token alınamadıysa, varsayılan görseli kullanmak için success: false döndür
      return NextResponse.json({
        success: false,
        message: 'Spotify credentials not configured. Using default artwork.'
      });
    }

    const query = encodeURIComponent(`${artist} ${title}`);
    const searchUrl = `https://api.spotify.com/v1/search?q=${query}&type=track&limit=1`;

    const response = await fetch(searchUrl, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      console.warn('⚠️ Spotify search failed:', response.status);
      return NextResponse.json({
        success: false,
        message: 'Spotify search failed'
      });
    }

    const data: SpotifySearchResult = await response.json();
    
    if (data.tracks.items.length > 0) {
      const track = data.tracks.items[0];
      const albumArt = track.album.images[0]?.url;
      
      if (albumArt) {
        console.log(`✅ Spotify: ${artist} - ${title}`);
        return NextResponse.json({
          success: true,
          albumArt,
          trackName: track.name,
          artistName: track.artists[0]?.name
        });
      }
    }

    return NextResponse.json({
      success: false,
      message: 'No results found'
    });
  } catch (error) {
    console.error('❌ Spotify API error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    });
  }
}
