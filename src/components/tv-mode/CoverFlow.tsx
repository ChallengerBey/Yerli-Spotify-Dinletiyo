import React, { useEffect, useRef, useState } from 'react';

interface CoverFlowProps {
  data: any[];
  currentIndex: number;
  isPlaying: boolean;
  onIndexChange: (index: number) => void;
  onNext: () => void;
  onPrev: () => void;
  onPlay: () => void;
}

const CoverFlow: React.FC<CoverFlowProps> = ({ data, currentIndex, isPlaying, onIndexChange, onNext, onPrev, onPlay }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [lastInteraction, setLastInteraction] = useState(0);
  const debounceTime = 300; // 300ms debounce

  const handleInteraction = (callback: () => void) => {
    const now = Date.now();
    if (now - lastInteraction > debounceTime) {
      setLastInteraction(now);
      callback();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleInteraction(onNext);
      if (e.key === 'ArrowLeft') handleInteraction(onPrev);
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        onPlay();
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < 30) return;

      if (e.deltaY > 0) {
        handleInteraction(onNext);
      } else {
        handleInteraction(onPrev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const container = containerRef.current;
    if (container) container.addEventListener('wheel', handleWheel, { passive: true });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (container) container.removeEventListener('wheel', handleWheel);
    };
  }, [onNext, onPrev, lastInteraction]);

  return (
    <div ref={containerRef} className="relative w-full h-[400px] flex items-center justify-center">
      <div
        className="relative w-full h-full flex items-center justify-center"
        style={{ perspective: '1200px', transformStyle: 'preserve-3d' }}
      >
        {data.map((item, index) => {
          const offset = index - currentIndex;
          const absOffset = Math.abs(offset);

          if (absOffset > 3) return null;

          const isCenter = offset === 0;
          const isLeft = offset < 0;
          const isRight = offset > 0;

          // Adjusted positioning for smaller cards
          const translateX = offset * 90 + (isLeft ? -70 : isRight ? 70 : 0);
          const translateZ = isCenter ? 220 : -240 - (absOffset * 90);
          const rotateY = isCenter ? 0 : (isLeft ? 65 : -65);
          const opacity = isCenter ? 1 : Math.max(0.2, 0.7 - absOffset * 0.2);
          const zIndex = 100 - absOffset;

          return (
            <div
              key={item.id}
              onClick={() => {
                if (isCenter) {
                  onPlay();
                } else {
                  handleInteraction(() => {
                    onIndexChange(index);
                    if ('vibrate' in navigator) navigator.vibrate(10);
                  });
                }
              }}
              className={`absolute w-48 h-48 sm:w-56 sm:h-56 transition-all duration-1000 cubic-bezier(0.2, 0.8, 0.2, 1) cursor-pointer select-none group 
                ${isCenter && !isPlaying ? 'animate-breathing' : ''}
                ${isCenter && isPlaying ? 'animate-pulse-bpm' : ''}
              `}
              style={{
                transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg)`,
                zIndex: zIndex,
                opacity: opacity,
                transformStyle: 'preserve-3d',
                '--bpm-speed': `${60 / item.bpm}s`
              } as React.CSSProperties}
            >
              {/* Cover Image Wrapper */}
              <div className="relative w-full h-full rounded-[2rem] overflow-hidden shadow-[0_30px_60px_-10px_rgba(0,0,0,0.85)] ring-1 ring-white/10 group-hover:ring-white/40 transition-all duration-700 active:scale-95 bg-zinc-900">
                <img
                  src={item.cover}
                  alt={item.title}
                  className={`w-full h-full object-cover transition-all duration-1000 ease-in-out ${isCenter ? 'grayscale-0 scale-100' : 'grayscale-[60%] opacity-70 scale-110'}`}
                  loading="lazy"
                  onError={(e) => {
                    // Fallback image if thumbnail fails to load
                    const target = e.target as HTMLImageElement;
                    if (!target.src.includes('unsplash')) {
                      target.src = 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&q=80&w=800';
                    }
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-white/10 opacity-60" />

                {/* Visual Depth Overlay */}
                {isCenter && (
                  <div className="absolute inset-0 shadow-[inset_0_0_30px_rgba(255,255,255,0.05)] pointer-events-none" />
                )}
              </div>

              {/* Reflection - Added blur and border radius */}
              <div
                className="absolute top-[106%] left-0 w-full h-20 opacity-30 pointer-events-none transition-all duration-700 rounded-b-[2rem] blur-[6px]"
                style={{
                  backgroundImage: `url(${item.cover})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center bottom',
                  transform: 'scaleY(-1)',
                  maskImage: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 80%)',
                  WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 80%)',
                }}
                onError={(e) => {
                  // Reflection için de fallback
                  const target = e.target as HTMLDivElement;
                  target.style.backgroundImage = 'url(https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&q=80&w=800)';
                }}
              />

              {/* Song Information */}
              {isCenter && (
                <div className="absolute top-[112%] left-[-80%] right-[-80%] text-center animate-in fade-in zoom-in-95 duration-1000 select-none pointer-events-none">
                  <h4 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-[0_8px_12px_rgba(0,0,0,0.8)] mb-0.5 leading-none">{item.title}</h4>
                  <p className="text-white/40 text-[10px] sm:text-[11px] font-black tracking-[0.4em] uppercase">{item.artist}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes breathing {
          0%, 100% { scale: 1; opacity: 1; }
          50% { scale: 1.02; opacity: 0.97; }
        }
        @keyframes pulse-bpm {
          0%, 100% { scale: 1.04; }
          50% { scale: 1.08; }
        }
        .animate-breathing {
          animation: breathing 5s infinite ease-in-out;
        }
        .animate-pulse-bpm {
          animation: pulse-bpm var(--bpm-speed) infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default CoverFlow;