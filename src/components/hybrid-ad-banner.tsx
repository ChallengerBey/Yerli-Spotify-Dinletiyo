'use client';

import { useState, useEffect } from 'react';
import { BannerAdCarousel } from './banner-ad-carousel';
import { ExternalAdBanner } from './external-ad-banner';
import { cn } from '@/lib/utils';

interface HybridAdBannerProps {
  className?: string;
  showExternalAds?: boolean;
  externalAdProbability?: number; // 0-1 arası, external ad gösterme olasılığı
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showControls?: boolean;
  showDots?: boolean;
  adKey?: string;
  width?: number;
  height?: number;
}

export function HybridAdBanner({
  className,
  showExternalAds = true,
  externalAdProbability = 0.3, // %30 external, %70 internal
  autoPlay = true,
  autoPlayInterval = 8000,
  showControls = false,
  showDots = true,
  adKey = '11d743642e3d739d464e08abf24c248a',
  width = 728,
  height = 90
}: HybridAdBannerProps) {
  const [showExternal, setShowExternal] = useState(false);
  const [rotationIndex, setRotationIndex] = useState(0);

  // Ad rotation logic
  useEffect(() => {
    if (!showExternalAds) return;

    const rotateAds = () => {
      // Her rotation'da external ad gösterme kararı ver
      const shouldShowExternal = Math.random() < externalAdProbability;
      setShowExternal(shouldShowExternal);
      setRotationIndex(prev => prev + 1);
    };

    // İlk yükleme
    rotateAds();

    // Periyodik rotation
    const interval = setInterval(rotateAds, autoPlayInterval * 3); // 3x daha yavaş rotation
    return () => clearInterval(interval);
  }, [showExternalAds, externalAdProbability, autoPlayInterval]);

  // External ads devre dışıysa sadece internal göster
  if (!showExternalAds) {
    return (
      <BannerAdCarousel
        className={className}
        autoPlay={autoPlay}
        autoPlayInterval={autoPlayInterval}
        showControls={showControls}
        showDots={showDots}
      />
    );
  }

  return (
    <div className={cn("w-full", className)}>
      {showExternal ? (
        <div className="transition-all duration-500 ease-in-out">
          <ExternalAdBanner
            className="w-full"
            closeable={true}
            adKey={adKey}
            width={width}
            height={height}
          />
        </div>
      ) : (
        <div className="transition-all duration-500 ease-in-out">
          <BannerAdCarousel
            autoPlay={autoPlay}
            autoPlayInterval={autoPlayInterval}
            showControls={showControls}
            showDots={showDots}
          />
        </div>
      )}
      
      {/* Rotation indicator */}
      <div className="flex justify-center mt-2">
        <div className="flex gap-1">
          <div className={cn(
            "w-2 h-2 rounded-full transition-colors",
            !showExternal ? "bg-blue-500" : "bg-gray-300"
          )} />
          <div className={cn(
            "w-2 h-2 rounded-full transition-colors",
            showExternal ? "bg-green-500" : "bg-gray-300"
          )} />
        </div>
      </div>
    </div>
  );
}