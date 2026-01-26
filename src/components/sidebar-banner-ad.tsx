'use client';

import { useState, useEffect } from 'react';
import { ExternalLink, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarAd {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
  backgroundColor: string;
  textColor: string;
  buttonColor: string;
  sponsor: string;
}

interface SidebarBannerAdProps {
  className?: string;
  autoRotate?: boolean;
  rotateInterval?: number;
  closeable?: boolean;
}

const sidebarAds: SidebarAd[] = [
  {
    id: '1',
    title: 'Premium\'a Geç',
    description: 'Reklamsız müzik deneyimi',
    imageUrl: '/Fotoğraflar/TÜRKÇE POP HİTS.063Z.png',
    linkUrl: '/home/premium',
    backgroundColor: 'from-purple-600 to-pink-600',
    textColor: 'text-white',
    buttonColor: 'bg-white text-purple-600 hover:bg-gray-100',
    sponsor: 'Premium'
  },
  {
    id: '2',
    title: 'Yeni Podcast\'ler',
    description: 'Binlerce podcast keşfet',
    imageUrl: '/Fotoğraflar/ODAKLANMA ZAMANI.013Z.png',
    linkUrl: '/home/podcasts',
    backgroundColor: 'from-blue-600 to-cyan-600',
    textColor: 'text-white',
    buttonColor: 'bg-white text-blue-600 hover:bg-gray-100',
    sponsor: 'Podcast'
  },
  {
    id: '3',
    title: 'Arkadaş Ekle',
    description: 'Müziği birlikte keşfet',
    imageUrl: '/Fotoğraflar/YOLCULUK ŞARKILARI.740Z.png',
    linkUrl: '/home/friends',
    backgroundColor: 'from-green-600 to-emerald-600',
    textColor: 'text-white',
    buttonColor: 'bg-white text-green-600 hover:bg-gray-100',
    sponsor: 'Sosyal'
  },
  {
    id: '4',
    title: 'Canlı Yayın',
    description: 'Müziklerini paylaş',
    imageUrl: '/Fotoğraflar/elektronik dans.885Z.png',
    linkUrl: '/home/yayinci',
    backgroundColor: 'from-red-600 to-orange-600',
    textColor: 'text-white',
    buttonColor: 'bg-white text-red-600 hover:bg-gray-100',
    sponsor: 'Yayıncı'
  }
];

export function SidebarBannerAd({
  className,
  autoRotate = true,
  rotateInterval = 8000,
  closeable = true
}: SidebarBannerAdProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [ads] = useState<SidebarAd[]>(sidebarAds);

  // Auto rotate functionality
  useEffect(() => {
    if (!autoRotate || !isVisible) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === ads.length - 1 ? 0 : prevIndex + 1
      );
    }, rotateInterval);

    return () => clearInterval(interval);
  }, [autoRotate, rotateInterval, ads.length, isVisible]);

  const handleAdClick = (ad: SidebarAd) => {
    console.log('Sidebar ad clicked:', ad.title);
    window.open(ad.linkUrl, '_blank');
  };

  const handleClose = () => {
    setIsVisible(false);
    // 30 saniye sonra tekrar göster
    setTimeout(() => setIsVisible(true), 30000);
  };

  if (!isVisible) return null;

  const currentAd = ads[currentIndex];

  return (
    <div 
      className={cn(
        "relative w-full h-32 overflow-hidden rounded-lg shadow-lg group cursor-pointer",
        className
      )}
      onClick={() => handleAdClick(currentAd)}
    >
      {/* Background Gradient */}
      <div 
        className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-90",
          currentAd.backgroundColor
        )}
      />

      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: `url(${currentAd.imageUrl})` }}
      />

      {/* Close Button */}
      {closeable && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleClose();
          }}
          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
        >
          <X className="w-3 h-3 text-white" />
        </button>
      )}

      {/* Content */}
      <div className="relative h-full flex flex-col justify-center p-4">
        {/* Ad Image */}
        <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/10 backdrop-blur-sm mb-2 mx-auto">
          <img
            src={currentAd.imageUrl}
            alt={currentAd.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Ad Text */}
        <div className="text-center">
          <h3 className={cn("font-bold text-sm leading-tight mb-1", currentAd.textColor)}>
            {currentAd.title}
          </h3>
          <p className={cn("text-xs opacity-90 mb-2", currentAd.textColor)}>
            {currentAd.description}
          </p>
          
          {/* CTA Button */}
          <button
            className={cn(
              "px-3 py-1 rounded text-xs font-medium transition-all duration-200 flex items-center gap-1 mx-auto hover:scale-105",
              currentAd.buttonColor
            )}
          >
            Keşfet
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Progress Dots */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
        {ads.map((_, index) => (
          <div
            key={index}
            className={cn(
              "w-1.5 h-1.5 rounded-full transition-all duration-200",
              index === currentIndex 
                ? "bg-white scale-125" 
                : "bg-white/50"
            )}
          />
        ))}
      </div>

      {/* Sponsor Label */}
      <div className="absolute top-2 left-2">
        <span className={cn("text-xs opacity-75 bg-black/20 px-2 py-1 rounded", currentAd.textColor)}>
          {currentAd.sponsor}
        </span>
      </div>
    </div>
  );
}