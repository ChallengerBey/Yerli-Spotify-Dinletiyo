import { NextRequest, NextResponse } from 'next/server';

type ArtistSearchResponse =
  | { success: true; data: { name: string; imageUrl?: string; followers?: number } }
  | { success: false; error: string };

// Simple in-memory cache (per server instance)
const cache = new Map<string, { at: number; data: ArtistSearchResponse }>();
const TTL_MS = 10 * 60 * 1000;

async function getSpotifyToken(): Promise<string | null> {
  const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${auth}`,
    },
    body: 'grant_type=client_credentials',
    cache: 'no-store',
  });
  if (!response.ok) return null;
  const json = await response.json();
  return json?.access_token || null;
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim();
  if (!q) {
    return NextResponse.json({ success: false, error: 'q required' } satisfies ArtistSearchResponse, { status: 400 });
  }

  const key = q.toLowerCase();
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL_MS) {
    return NextResponse.json(hit.data, {
      headers: {
        // CDN cache
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=86400',
      },
    });
  }

  let data: ArtistSearchResponse = { success: true, data: { name: q } };

  try {
    const token = await getSpotifyToken();
    if (token) {
      // Spotify artist search
      const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=artist&limit=1`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      if (res.ok) {
        const json = await res.json();
        const artist = json?.artists?.items?.[0];
        if (artist) {
          data = {
            success: true,
            data: {
              name: artist.name || q,
              imageUrl: artist.images?.[0]?.url,
              followers: artist.followers?.total,
            },
          };
        }
      }
    }
  } catch {
    data = { success: true, data: { name: q } };
  }

  cache.set(key, { at: Date.now(), data });
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=86400',
    },
  });
}

