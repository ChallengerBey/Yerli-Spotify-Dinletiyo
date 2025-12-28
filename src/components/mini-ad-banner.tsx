'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MiniAdBannerProps {
  className?: string;
  variant?: 'info' | 'success' | 'warning';
  autoHide?: boolean;
  autoHideDelay?: number;
}

const miniAds = [
  {
    id: 1,
    title: "Yeni Özellik!",
    description: "Dinleme odaları artık mevcut",
    cta: "Dene",
    url: "#",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    textColor: "text-blue-800"
  },
  {
    id: 2,
    title: "Premium Üyelik",
    description: "Reklamsız müzik deneyimi",
    cta: "Yükselt",
    url: "#",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    textColor: "text-purple-800"
  },
  {
    id: 3,
    title: "Mobil Uygulama",
    description: "Her yerde müzik dinle",
    cta: "İndir",
    url: "#",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    textColor: "text-green-800"
  }
];

export function MiniAdBanner({ 
  className, 
  variant = 'info', 
  autoHide = true, 
  autoHideDelay = 8000 
}: MiniAdBannerProps) {
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    
    const interval = setInterval(() => {
      setCurrentAdIndex((prev) => (prev + 1) % miniAds.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [isPaused, miniAds.length]);

  useEffect(() => {
    if (!autoHide) return;
    
    const timer = setTimeout(() => {
      // Auto-hide is disabled, so we don't hide the banner
    }, autoHideDelay);

    return () => clearTimeout(timer);
  }, [autoHide, autoHideDelay]);

  const handleMouseEnter = () => {
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  const currentAd = miniAds[currentAdIndex];

  return (
    <div 
      className={cn(
        "relative overflow-hidden rounded-lg border transition-all duration-300 hover:shadow-md",
        currentAd.bgColor,
        currentAd.borderColor,
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Ad Content */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">🎵</div>
          <div>
            <h4 className={cn("font-medium text-sm", currentAd.textColor)}>
              {currentAd.title}
            </h4>
            <p className={cn("text-xs opacity-80", currentAd.textColor)}>
              {currentAd.description}
            </p>
          </div>
        </div>
        <Button 
          variant="ghost"
          className={cn("h-7 px-2 text-xs", currentAd.textColor)}
          onClick={() => window.open(currentAd.url, '_blank')}
        >
          {currentAd.cta}
          <ChevronRight className="h-3 w-3 ml-1" />
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 h-1 bg-current opacity-20 transition-all duration-300" />
    </div>
  );
}
