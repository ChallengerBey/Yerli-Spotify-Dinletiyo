import type { Song } from "./data";

// Belirli bir arama sorgusuyla YouTube'dan müzik videoları çeker
export async function fetchYoutubeSongs(query: string, maxResults = 10): Promise<Song[]> {
  const res = await fetch(`/api/youtube/search?q=${encodeURIComponent(query)}&maxResults=${maxResults}`);
  const data = await res.json();
  
  if (!data.videos) return [];
  
  return data.videos.map((item: any) => ({
    id: item.id,
    title: item.title,
    artist: item.channelTitle,
    album: '',
    duration: '',
    imageUrl: item.thumbnail,
    audioUrl: `https://www.youtube.com/watch?v=${item.id}`,
  }));
} 