"use client";

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { cn, slugify } from '@/lib/utils';

interface ArtistCardProps {
  name: string;
  imageUrl?: string;
  spotifyUrl?: string;
  className?: string;
}

export function ArtistCard({ name, imageUrl, spotifyUrl, className }: ArtistCardProps) {
  const [imageError, setImageError] = useState(false);
  const [hovered, setHovered] = useState(false);
  const router = useRouter();

  return (
    <div
      className={cn("cursor-pointer", className)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => router.push(`/home/artist/${slugify(name)}`)}
    >
      <div className="relative aspect-square rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 mb-4 shadow-lg">
        {imageUrl && !imageError ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-1/2 h-1/2 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
        )}
      </div>
      <div className="text-center">
        <h3 className={cn("font-semibold text-sm truncate transition-colors", hovered ? "text-red-500" : "")}>
          {name}
        </h3>
        <p className="text-xs text-muted-foreground">Sanatçı</p>
      </div>
    </div>
  );
}
