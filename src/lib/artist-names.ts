export function splitArtistNames(raw: string): string[] {
  const input = (raw || "").trim();
  if (!input) return [];

  // Keep parentheses content for display, but make splitting more robust by normalizing separators.
  const normalized = input
    // unify common "featuring" markers to comma
    .replace(/\s+(feat\.?|ft\.?|featuring)\s+/gi, ", ")
    // unify "x" collabs
    .replace(/\s+[x×]\s+/gi, ", ")
    // unify ampersand
    .replace(/\s*&\s*/g, ", ")
    // unify slashes and bullets
    .replace(/\s*[\/•·]\s*/g, ", ")
    // collapse whitespace
    .replace(/\s+/g, " ")
    .trim();

  const parts = normalized
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    // remove trailing junk like "-" from parsing edge cases
    .map((s) => s.replace(/^[-–—]+/, "").replace(/[-–—]+$/, "").trim())
    .filter(Boolean);

  // unique preserve order
  const seen = new Set<string>();
  const out: string[] = [];
  for (const p of parts) {
    const key = p.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(p);
  }

  // sanity limit (avoid blowing up UI if a title is messy)
  return out.slice(0, 6);
}

