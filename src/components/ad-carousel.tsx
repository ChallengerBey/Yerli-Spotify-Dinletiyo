'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdItem {
  id: number;
  title: string;
  description: string;
  image: string;
  cta: string;
  url: string;
}

interface AdCarouselProps {
  className?: string;
  variant?: 'horizontal' | 'vertical';
  autoPlay?: boolean;
  showControls?: boolean;
  showDots?: boolean;
}

const mockAds: AdItem[] = [
  {
    id: 1,
    title: "Premium Müzik Deneyimi",
    description: "Reklamsız müzik dinleme ve yüksek kalite ses",
    image: "🎵",
    cta: "Şimdi Dene",
    url: "#"
  },
  {
    id: 2,
    title: "Özel Playlist'ler",
    description: "Sadece sizin için hazırlanmış özel müzik listeleri",
    image: "🎧",
    cta: "Keşfet",
    url: "#"
  },
  {
    id: 3,
    title: "Offline Dinleme",
    description: "İnternet olmadan da müzik keyfi",
    image: "📱",
    cta: "İndir",
    url: "#"
  }
];

export function AdCarousel({ 
  className, 
  variant = 'horizontal', 
  autoPlay = true, 
  showControls = true, 
  showDots = true 
}: AdCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!autoPlay || isPaused) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % mockAds.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [autoPlay, isPaused, mockAds.length]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % mockAds.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + mockAds.length) % mockAds.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const handleMouseEnter = () => {
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  const currentAd = mockAds[currentIndex];

  return (
    <div 
      className={cn(
        "relative overflow-hidden bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl",
        variant === 'horizontal' ? 'h-32' : 'h-48',
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Ad Content */}
      <div className="flex items-center justify-between h-full px-6">
        <div className="flex items-center space-x-4">
          <div className="text-4xl">{currentAd.image}</div>
          <div>
            <h3 className="font-semibold text-gray-800 text-lg">{currentAd.title}</h3>
            <p className="text-gray-600 text-sm">{currentAd.description}</p>
          </div>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => window.open(currentAd.url, '_blank')}
        >
          {currentAd.cta}
        </Button>
      </div>

      {/* Navigation Controls */}
      {showControls && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {showDots && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-2">
          {mockAds.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-colors",
                index === currentIndex ? "bg-blue-600" : "bg-gray-300"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
