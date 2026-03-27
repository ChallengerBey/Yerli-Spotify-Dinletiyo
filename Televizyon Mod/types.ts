
export interface Song {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  duration: string;
}

export interface Recommendation {
  song: Song;
  reason: string;
}
