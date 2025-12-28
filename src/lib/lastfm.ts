// Last.fm API'den popüler şarkı ve sanatçı verilerini çeker
// ve mevcut Song/Playlist yapısına dönüştürür

import type { Song, Playlist } from "./data";

const API_KEY = "1a0b32c31250e3d32390b16286fab488";
const API_ROOT = "https://ws.audioscrobbler.com/2.0/";

// Last.fm'den popüler şarkıları çeker
type LastFmTrack = {
  name: string;
  artist: { name: string };
  duration: string;
  image: { size: string; '#text': string }[];
  url: string;
};

export async function fetchTopTracks(limit = 10): Promise<Song[]> {
  const res = await fetch(
    `${API_ROOT}?method=chart.gettoptracks&api_key=${API_KEY}&format=json&limit=${limit}`
  );
  const data = await res.json();
  const tracks: LastFmTrack[] = data.tracks.track;
  return tracks.map((track, i) => ({
    id: `${i + 1}`,
    title: track.name,
    artist: track.artist.name,
    album: "",
    duration: track.duration ? `${Math.floor(Number(track.duration) / 60)}:${('0' + (Number(track.duration) % 60)).slice(-2)}` : "",
    imageUrl: track.image?.find((img) => img.size === "extralarge")?.['#text'] || "",
    audioUrl: track.url, // Last.fm mp3 vermez, url şarkı sayfası olur
  }));
}

// Last.fm'den popüler sanatçıları çeker
export async function fetchTopArtists(limit = 10): Promise<{ name: string; imageUrl: string; }[]> {
  const res = await fetch(
    `${API_ROOT}?method=chart.gettopartists&api_key=${API_KEY}&format=json&limit=${limit}`
  );
  const data = await res.json();
  const artists = data.artists.artist;
  return artists.map((artist: any) => ({
    name: artist.name,
    imageUrl: artist.image?.find((img: any) => img.size === "extralarge")?.['#text'] || "",
  }));
}

// Popüler şarkılardan örnek bir playlist oluşturur
export async function fetchTopPlaylist(): Promise<Playlist> {
  const songs = await fetchTopTracks(15);
  return {
    id: "lastfm-top",
    title: "Last.fm Popüler Şarkılar",
    description: "Last.fm'den canlı çekilen popüler şarkılar.",
    imageUrl: songs[0]?.imageUrl || "",
    songs,
  };
} 