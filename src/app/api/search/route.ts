import { NextResponse } from "next/server";
import type { Song } from "@/lib/data";
import { parseYouTubeMusicMeta } from "@/lib/youtube-metadata";

const placeholderAudioUrl =
  "https://storage.googleapis.com/stolo-public-assets/gemini-studio/royalty-free-music/scott-buckley-jul.mp3";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();

  if (!q) {
    return NextResponse.json({ songs: [] satisfies Song[] }, { status: 200 });
  }

  // 1) YouTube scrape (same system as /api/youtube-scrape)
  try {
    const response = await fetch(
      "https://www.youtube.com/youtubei/v1/search?key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context: { client: { clientName: "WEB", clientVersion: "2.20240101.00.00" } },
          query: `${q} music -advertisement -reklam -commercial`,
          params: "EgIQAQ%3D%3D",
        }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      const contents =
        data?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents?.[0]
          ?.itemSectionRenderer?.contents || [];

      const out: Song[] = [];

      for (const item of contents.slice(0, 80)) {
        const video = item?.videoRenderer;
        if (!video) continue;
        const videoId = video.videoId;
        const rawTitle = video.title?.runs?.[0]?.text || "";
        const channelTitle = video.ownerText?.runs?.[0]?.text || "";
        const duration = video.lengthText?.simpleText || "0:00";
        const thumbnail = video.thumbnail?.thumbnails?.[0]?.url || "";

        if (!videoId || !rawTitle) continue;

        const parsed = parseYouTubeMusicMeta(rawTitle, channelTitle);

        out.push({
          id: videoId,
          title: parsed.title,
          artist: parsed.artist,
          album: "YouTube",
          duration,
          imageUrl: thumbnail,
          audioUrl: videoId,
          aiHint: "youtube",
        });

        if (out.length >= 24) break;
      }

      if (out.length > 0) {
        return NextResponse.json(
          { songs: out },
          {
            headers: {
              "Cache-Control": "no-store",
            },
          }
        );
      }
    }
  } catch {
    // ignore and fall back
  }

  // 2) Last.fm fallback (optional)
  const apiKey = process.env.LASTFM_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ songs: [] satisfies Song[] }, { status: 200 });
  }

  const url = `https://ws.audioscrobbler.com/2.0/?method=track.search&track=${encodeURIComponent(q)}&api_key=${apiKey}&format=json&limit=24`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return NextResponse.json({ songs: [] satisfies Song[] }, { status: 200 });

    const data = await res.json();
    const tracks = data.results?.trackmatches?.track;
    if (!Array.isArray(tracks)) return NextResponse.json({ songs: [] satisfies Song[] }, { status: 200 });

    const formatted: Song[] = tracks
      .map((track: any): Song | null => {
        const imgs = Array.isArray(track.image) ? track.image : [];
        const imageUrl =
          imgs.find((img: any) => img.size === "extralarge")?.["#text"] ||
          imgs[imgs.length - 1]?.["#text"];

        if (!imageUrl || String(imageUrl).includes("2a96cbd8b46e442fc41c2b86b821562f")) {
          return null;
        }

        return {
          id: track.mbid || `${track.name}-${track.artist}`,
          title: track.name,
          artist: track.artist,
          album: "Bilinmiyor",
          duration: "0:00",
          imageUrl,
          audioUrl: placeholderAudioUrl,
          aiHint: "album cover music",
        };
      })
      .filter((s: Song | null): s is Song => Boolean(s));

    return NextResponse.json(
      { songs: formatted },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch {
    return NextResponse.json({ songs: [] satisfies Song[] }, { status: 200 });
  }
}

