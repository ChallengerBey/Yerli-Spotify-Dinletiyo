
export interface Streamer {
  id: string;
  username: string;
  addedAt: number;
}

export interface StreamerInsight {
  vibe: string;
  chatStyle: string;
  category: string;
  summary: string;
}

export interface AppState {
  streamers: Streamer[];
  activeStreamerId: string | null;
  loadingInsight: boolean;
  insights: Record<string, StreamerInsight>;
}
