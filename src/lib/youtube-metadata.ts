type ParsedMusic = {
  artist: string;
  title: string;
  confidence: "high" | "medium" | "low";
};

const TITLE_SEPARATORS = [" - ", " – ", " — ", " | ", ": ", " / "];

function cleanCommonJunk(s: string) {
  return (s || "")
    // remove bracketed tags
    .replace(/\[[^\]]*?\]/g, " ")
    .replace(/\([^)]*?\)/g, " ")
    // normalize spaces
    .replace(/\s+/g, " ")
    .trim();
}

function cleanChannelArtist(s: string) {
  return (s || "")
    .replace(/\s*-\s*topic\s*$/i, "")
    .replace(/\s*vevo\s*$/i, "")
    .replace(/\s*official\s*$/i, "")
    .replace(/\s*müzik\s*$/i, "")
    .replace(/\s*music\s*$/i, "")
    .replace(/\s+records?\s*$/i, "")
    .replace(/\s+production\s*$/i, "")
    .trim();
}

function looksLikeArtist(s: string) {
  const t = (s || "").trim();
  if (!t) return false;
  if (t.length < 2) return false;
  if (t.length > 60) return false;
  // avoid pure numeric or duration-like
  if (/^\d+(:\d+)*$/.test(t)) return false;
  return true;
}

function looksLikeTitle(s: string) {
  const t = (s || "").trim();
  if (!t) return false;
  if (t.length < 1) return false;
  if (t.length > 120) return false;
  return true;
}

export function parseYouTubeMusicMeta(
  rawTitle: string,
  channelTitle?: string
): ParsedMusic {
  const original = (rawTitle || "").trim();
  const cleaned = cleanCommonJunk(original);

  // 1) Standard: "Artist - Title"
  for (const sep of TITLE_SEPARATORS) {
    if (!cleaned.includes(sep)) continue;
    const parts = cleaned.split(sep).map((p) => p.trim()).filter(Boolean);
    if (parts.length < 2) continue;

    const left = parts[0];
    const right = parts.slice(1).join(sep).trim();

    if (looksLikeArtist(left) && looksLikeTitle(right)) {
      return { artist: left, title: right, confidence: "high" };
    }
  }

  // 2) Reverse: "Title - Artist" (rare but happens)
  for (const sep of TITLE_SEPARATORS) {
    if (!cleaned.includes(sep)) continue;
    const parts = cleaned.split(sep).map((p) => p.trim()).filter(Boolean);
    if (parts.length < 2) continue;

    const maybeTitle = parts[0];
    const maybeArtist = parts[1];
    if (looksLikeArtist(maybeArtist) && looksLikeTitle(maybeTitle)) {
      return { artist: maybeArtist, title: maybeTitle, confidence: "medium" };
    }
  }

  // 3) Channel title fallback (Topic/VEVO etc.)
  const ch = cleanChannelArtist(channelTitle || "");
  if (looksLikeArtist(ch)) {
    return { artist: ch, title: cleaned || original, confidence: "low" };
  }

  // 4) Last resort: keep title, unknown artist
  return { artist: "Bilinmeyen Sanatçı", title: cleaned || original, confidence: "low" };
}

