import React from "react";
import { Metadata } from "next";
import PlaylistPageClient from "./PlaylistPageClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getPlaylistData(id: string) {
  const names: Record<string, string> = {
    '2': 'Türkçe Pop Hits', '3': 'Odaklanma Zamanı', '4': 'Antrenman Modu',
    '5': '90\'lar Nostalji', '6': 'Akustik Akşamlar', '7': 'Türkçe Rock',
    '8': 'Damar Şarkılar', '9': 'Elektronik Dans', '10': 'Yeni Nesil Rap',
    '11': 'Yolculuk Şarkıları', '12': 'Efsane Şarkılar', '13': 'Haftanın Keşifleri'
  };
  
  const descriptions: Record<string, string> = {
    '2': 'En popüler Türkçe şarkılar', '3': 'Çalışma ve odaklanma için sakin müzikler',
    '4': 'Spor yaparken dinlenecek enerjik şarkılar', '5': '90\'ların unutulmaz şarkıları',
    '6': 'Sakin akşamlar için akustik şarkılar', '7': 'Türk rock müziğinin en iyileri',
    '8': 'Kalbe dokunan damar şarkılar', '9': 'Dans etmek için elektronik müzikler',
    '10': 'Türkiye\'nin yeni nesil rap sanatçıları', '11': 'Uzun yolculuklar için keyifli şarkılar',
    '12': 'Hiç eskimeyen efsane şarkılar', '13': 'Bu hafta keşfettiğin yeni şarkılar'
  };

  const images: Record<string, string> = {
    '2': '/Fotoğraflar/TÜRKÇE POP HİTS.063Z.png', '3': '/Fotoğraflar/ODAKLANMA ZAMANI.013Z.png',
    '4': '/Fotoğraflar/ANTREMANMODU.333Z.png', '5': '/Fotoğraflar/90lar.973Z.png',
    '6': '/Fotoğraflar/akustik akşamlar.911Z.png', '7': '/Fotoğraflar/TÜKRÇE ROCK.037Z.png',
    '8': '/Fotoğraflar/damarşarkılar.917Z.png', '9': '/Fotoğraflar/elektronik dans.885Z.png',
    '10': '/Fotoğraflar/YENİNESİLRAP.797Z.png', '11': '/Fotoğraflar/YOLCULUK ŞARKILARI.740Z.png',
    '12': '/Fotoğraflar/Efsaneşarkılar.885Z.png', '13': '/Fotoğraflar/haftanın keşifleri.341Z.png'
  };

  if (names[id]) {
    return {
      name: names[id],
      description: descriptions[id],
      imageUrl: images[id],
    };
  }

  // Try to fetch from internal API if it's not a hardcoded one
  // Note: In a real server component, you'd fetch from DB directly
  return {
    name: "Playlist",
    description: "Dinletiyo'da müzik dinle.",
    imageUrl: "/og-image.jpg"
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const playlist = await getPlaylistData(id);

  const title = `${playlist.name} - Ücretsiz Müzik Dinle | Dinletiyo`;
  const description = `${playlist.name} listesindeki en popüler şarkıları Dinletiyo'da ücretsiz ve reklamsız dinle. Kendi playlistini oluştur ve arkadaşlarınla paylaş!`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: playlist.imageUrl ? [playlist.imageUrl] : [],
      type: 'music.playlist',
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: playlist.imageUrl ? [playlist.imageUrl] : [],
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const playlist = await getPlaylistData(id);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MusicPlaylist",
    "name": playlist.name,
    "description": playlist.description,
    "url": `https://dinletiyo.com/home/playlist/${id}`,
    "image": playlist.imageUrl,
    "numTracks": 30, // Or dynamic count if available
    "genre": "Pop", // Default genre or dynamic
  };


  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PlaylistPageClient playlistId={id} />
    </>
  );
}
