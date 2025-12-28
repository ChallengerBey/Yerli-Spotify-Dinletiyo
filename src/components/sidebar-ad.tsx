'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, TrendingUp, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarAdProps {
  className?: string;
  position?: 'left' | 'right';
  variant?: 'premium' | 'featured' | 'sponsored';
}

const sidebarAds = [
  {
    id: 1,
    title: "Premium Üyelik",
    description: "Reklamsız müzik deneyimi",
    price: "₺29.99/ay",
    badge: "Premium",
    icon: Star,
    bgColor: "bg-gradient-to-br from-yellow-50 to-orange-50",
    borderColor: "border-yellow-200",
    textColor: "text-yellow-800"
  },
  {
    id: 2,
    title: "Yeni Özellikler",
    description: "Dinleme odaları ve arkadaş sistemi",
    price: "Ücretsiz",
    badge: "Yeni",
    icon: TrendingUp,
    bgColor: "bg-gradient-to-br from-blue-50 to-purple-50",
    borderColor: "border-blue-200",
    textColor: "text-blue-800"
  },
  {
    id: 3,
    title: "Özel İçerikler",
    description: "Sadece üyeler için özel playlist'ler",
    price: "₺19.99/ay",
    badge: "Özel",
    icon: Crown,
    bgColor: "bg-gradient-to-br from-purple-50 to-pink-50",
    borderColor: "border-purple-200",
    textColor: "text-purple-800"
  }
];

export function SidebarAd({ 
  className, 
  position = 'right', 
  variant = 'premium' 
}: SidebarAdProps) {
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAdIndex((prev) => (prev + 1) % sidebarAds.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [sidebarAds.length]);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const currentAd = sidebarAds[currentAdIndex];
  const IconComponent = currentAd.icon;

  return (
    <div 
      className={cn(
        "fixed top-1/2 -translate-y-1/2 z-40 transition-all duration-300",
        position === 'left' ? 'left-4' : 'right-4',
        isCollapsed ? 'w-12' : 'w-64',
        className
      )}
    >
      <div 
        className={cn(
          "relative overflow-hidden rounded-xl border shadow-lg transition-all duration-300",
          currentAd.bgColor,
          currentAd.borderColor,
          isCollapsed ? 'h-12' : 'h-auto'
        )}
      >
        {/* Collapse Toggle Button */}
        <button
          onClick={toggleCollapse}
          className="absolute top-2 left-2 z-10 p-1 rounded-full bg-white/60 hover:bg-white/80 text-gray-600 hover:text-gray-800 transition-colors"
        >
          {isCollapsed ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingUp className="h-3 w-3" />
          )}
        </button>

        {!isCollapsed && (
          <>
            {/* Ad Content */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <Badge 
                  variant="secondary" 
                  className={cn("text-xs", currentAd.textColor)}
                >
                  {currentAd.badge}
                </Badge>
                <IconComponent className={cn("h-4 w-4", currentAd.textColor)} />
              </div>
              
              <h3 className={cn("font-semibold text-sm mb-2", currentAd.textColor)}>
                {currentAd.title}
              </h3>
              
              <p className={cn("text-xs opacity-80 mb-3", currentAd.textColor)}>
                {currentAd.description}
              </p>
              
              <div className="flex items-center justify-between">
                <span className={cn("font-bold text-sm", currentAd.textColor)}>
                  {currentAd.price}
                </span>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-7 px-3"
                  onClick={() => window.open('#', '_blank')}
                >
                  Dene
                </Button>
              </div>
            </div>

            {/* Progress Indicator */}
            <div className="absolute bottom-0 left-0 h-1 bg-current opacity-20 transition-all duration-300" />
          </>
        )}
      </div>
    </div>
  );
}
