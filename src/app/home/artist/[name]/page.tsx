import React from "react";
import { Metadata } from "next";
import ArtistPageClient from "./ArtistPageClient";

interface PageProps {
  params: Promise<{ name: string }>;
}

async function getArtistData(name: string) {
  const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET;

  // URL'den gelen slug'ı (tireli hali) daha iyi arama sonuçları için boşluklu hale getirebiliriz
  // Ancak Jay-Z gibi sanatçıları bozmamak için hem orijinali hem boşluklu hali denenebilir
  // Şimdilik en basit haliyle tireleri boşluğa çevirip aratalım
  const searchQuery = decodeURIComponent(name).replace(/-/g, ' ');

  if (!clientId || !clientSecret) {
    return { name: searchQuery };
  }

  try {
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${auth}`,
      },
      body: 'grant_type=client_credentials',
      next: { revalidate: 3600 }
    });

    if (!tokenRes.ok) return { name: searchQuery };
    const tokenData = await tokenRes.json();
    const token = tokenData.access_token;

    const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchQuery)}&type=artist&limit=1`;
    const res = await fetch(searchUrl, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 3600 }
    });


    if (res.ok) {
      const json = await res.json();
      const artist = json?.artists?.items?.[0];
      if (artist) {
        return {
          name: artist.name,
          imageUrl: artist.images?.[0]?.url,
          followers: artist.followers?.total,
        };
      }
    }
  } catch (error) {
    console.error("Error fetching artist data for metadata:", error);
  }

  return { name: decodeURIComponent(name) };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { name } = await params;
  const artist = await getArtistData(name);

  const title = `${artist.name} Şarkıları Ücretsiz Dinle - Dinletiyo Müzik`;
  const description = `${artist.name} en popüler şarkıları, albümleri ve tüm diskografisi Dinletiyo'da. Reklamsız ve ücretsiz ${artist.name} dinlemek için hemen tıkla!`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: artist.imageUrl ? [artist.imageUrl] : [],
      type: 'music.playlist',
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: artist.imageUrl ? [artist.imageUrl] : [],
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { name } = await params;
  const artistName = decodeURIComponent(name).replace(/-/g, ' ');
  const artist = await getArtistData(name);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MusicGroup",
    "name": artist.name,
    "image": artist.imageUrl,
    "description": `${artist.name} adlı sanatçının en popüler şarkıları ve tüm diskografisi.`,
    "url": `https://dinletiyo.com/home/artist/${name}`,
    "genre": "Music",
    "interactionCount": artist.followers
  };


  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ArtistPageClient artistName={artistName} />
    </>
  );
}
