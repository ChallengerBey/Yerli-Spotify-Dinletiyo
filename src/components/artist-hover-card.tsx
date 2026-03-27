"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";
import { slugify } from "@/lib/utils";

type ArtistPreview = {
  name: string;
  imageUrl?: string;
  followers?: number;
};

const cache = new Map<string, { at: number; data: ArtistPreview | null }>();
const inflight = new Map<string, Promise<ArtistPreview | null>>();
const TTL_MS = 5 * 60 * 1000;

async function fetchArtistPreview(name: string): Promise<ArtistPreview | null> {
  const key = name.toLowerCase();
  const hit = cache.get(key);
  const now = Date.now();
  if (hit && now - hit.at < TTL_MS) return hit.data;

  const pending = inflight.get(key);
  if (pending) return pending;

  const promise = (async () => {
    try {
      const res = await fetch(`/api/artist-search?q=${encodeURIComponent(name)}`, { cache: "force-cache" });
      const json = await res.json().catch(() => null);
      const data = json?.success ? json?.data : null;
      const preview: ArtistPreview | null = data
        ? { name: data.name || name, imageUrl: data.imageUrl, followers: data.followers }
        : { name };
      cache.set(key, { at: Date.now(), data: preview });
      return preview;
    } catch {
      const preview = { name };
      cache.set(key, { at: Date.now(), data: preview });
      return preview;
    } finally {
      inflight.delete(key);
    }
  })();

  inflight.set(key, promise);
  return promise;
}

function formatFollowers(n?: number) {
  if (!n && n !== 0) return null;
  return new Intl.NumberFormat("tr-TR").format(n);
}

export function ArtistHoverCard({
  name,
  children,
  className,
}: {
  name: string;
  children?: React.ReactNode;
  className?: string;
}) {
  const router = useRouter();
  const [preview, setPreview] = React.useState<ArtistPreview | null>(null);
  const [open, setOpen] = React.useState(false);

  const href = `/home/artist/${slugify(name)}`;

  const warm = React.useCallback(async () => {
    router.prefetch(href);
    void fetchArtistPreview(name).then(setPreview);
  }, [href, name, router]);

  const warmDebouncedRef = React.useRef<number | null>(null);
  const warmDebounced = React.useCallback(() => {
    if (warmDebouncedRef.current) window.clearTimeout(warmDebouncedRef.current);
    // hover "geçiş"lerinde boş yere istek atma
    warmDebouncedRef.current = window.setTimeout(() => {
      warm();
    }, 180);
  }, [warm]);

  return (
    <HoverCard open={open} onOpenChange={setOpen}>
      <HoverCardTrigger asChild>
        <span
          className={className || "cursor-pointer underline-offset-4 hover:underline"}
          onMouseEnter={warmDebounced}
          onFocus={warmDebounced}
          role="link"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter") router.push(href);
            if (e.key === " " || e.key === "Spacebar") {
              e.preventDefault();
              setOpen(true);
              warmDebounced();
            }
          }}
          onClick={(e) => {
            // Tık = card aç (hızlı preview). Profile gitme butonla yapılır.
            e.preventDefault();
            e.stopPropagation();
            setOpen((v) => !v);
            warmDebounced();
          }}
        >
          {children || name}
        </span>
      </HoverCardTrigger>
      <HoverCardContent align="start" sideOffset={10} className="w-[360px]">
        <div className="flex gap-3">
          <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-muted">
            {preview?.imageUrl ? (
              <Image src={preview.imageUrl} alt={preview.name} fill className="object-cover" />
            ) : (
              <div className="h-full w-full" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-semibold truncate">{preview?.name || name}</div>
            {preview?.followers ? (
              <div className="text-xs text-muted-foreground">{formatFollowers(preview.followers)} takipçi</div>
            ) : (
              <div className="text-xs text-muted-foreground">Profili görüntüle</div>
            )}
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setOpen(false);
              // Full-screen player açıksa önce onu kapat (yoksa sayfa arkada açılıyordu)
              if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("closeFullScreenPlayer"));
              }
              router.push(href);
            }}
          >
            Aç
          </Button>
        </div>
        <div className="mt-3 text-xs text-muted-foreground">
          Hızlı erişim. Detaylar için profile git.
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

