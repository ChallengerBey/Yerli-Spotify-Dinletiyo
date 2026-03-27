
import React, { useState, useMemo } from 'react';
import CoverFlow from './components/CoverFlow';
import MiniPlayer from './components/MiniPlayer';

const COVER_DATA = [
  { id: '1', title: 'Neon Nights', artist: 'Synthwave Collective', cover: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=800', color: 'rgba(16, 185, 129, 0.2)', bpm: 120 },
  { id: '2', title: 'After Hours', artist: 'Midnight Pulse', cover: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&q=80&w=800', color: 'rgba(59, 130, 246, 0.2)', bpm: 95 },
  { id: '3', title: 'Velvet Horizon', artist: 'Lo-Fi Dreams', cover: 'https://images.unsplash.com/photo-1459749411177-042180ce673c?auto=format&fit=crop&q=80&w=800', color: 'rgba(236, 72, 153, 0.2)', bpm: 80 },
  { id: '4', title: 'Cyber Spirit', artist: 'Digital Drift', cover: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?auto=format&fit=crop&q=80&w=800', color: 'rgba(139, 92, 246, 0.2)', bpm: 140 },
  { id: '5', title: 'Lunar Bass', artist: 'Astro Beats', cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=800', color: 'rgba(245, 158, 11, 0.2)', bpm: 128 },
  { id: '6', title: 'Deep Echo', artist: 'Submarine', cover: 'https://images.unsplash.com/photo-1514525253361-bee8a187499b?auto=format&fit=crop&q=80&w=800', color: 'rgba(6, 182, 212, 0.2)', bpm: 110 },
  { id: '7', title: 'Star Gazer', artist: 'Nebula', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=800', color: 'rgba(255, 255, 255, 0.15)', bpm: 105 },
];

const App: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(3);
  const [isPlaying, setIsPlaying] = useState(false);

  const activeSong = useMemo(() => COVER_DATA[currentIndex], [currentIndex]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % COVER_DATA.length);
    if ('vibrate' in navigator) navigator.vibrate(8);
  };
  
  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + COVER_DATA.length) % COVER_DATA.length);
    if ('vibrate' in navigator) navigator.vibrate(8);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans overflow-hidden flex flex-col items-center justify-center relative">
      
      {/* Dynamic Background Atmosphere */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none transition-colors duration-1000">
        <div 
          className={`absolute top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] blur-[160px] rounded-full transition-all duration-1000 ease-in-out`}
          style={{ 
            backgroundColor: activeSong.color,
            animation: isPlaying 
              ? `pulse-bg ${60 / activeSong.bpm}s infinite ease-in-out` 
              : `pulse-bg-slow 6s infinite ease-in-out`,
            opacity: isPlaying ? 0.7 : 0.3
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_10%,#050505_90%)]" />
      </div>

      {/* Main Content Area */}
      <main className="w-full max-w-5xl px-4 relative z-10 flex flex-col items-center justify-center -mt-32">
        <div className="w-full flex justify-center items-center">
          <CoverFlow 
            data={COVER_DATA} 
            currentIndex={currentIndex} 
            isPlaying={isPlaying}
            onIndexChange={setCurrentIndex} 
            onNext={handleNext} 
            onPrev={handlePrev} 
          />
        </div>
      </main>

      {/* Floating Mini Player */}
      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <MiniPlayer 
          currentSong={activeSong} 
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          onNext={handleNext} 
          onPrev={handlePrev} 
        />
      </div>

      <style>{`
        @keyframes pulse-bg {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
          50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.8; }
        }
        @keyframes pulse-bg-slow {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.3; }
          50% { transform: translate(-50%, -50%) scale(1.05); opacity: 0.4; }
        }
      `}</style>
    </div>
  );
};

export default App;
