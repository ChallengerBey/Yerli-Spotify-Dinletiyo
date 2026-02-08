
import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import { Streamer, StreamerInsight } from './types';
import { getStreamerInsight } from './services/geminiService';

const App: React.FC = () => {
  const [streamers, setStreamers] = useState<Streamer[]>(() => {
    const saved = localStorage.getItem('kick_streamers');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeStreamerId, setActiveStreamerId] = useState<string | null>(null);
  const [insights, setInsights] = useState<Record<string, StreamerInsight>>({});
  const [loadingInsight, setLoadingInsight] = useState(false);

  useEffect(() => {
    localStorage.setItem('kick_streamers', JSON.stringify(streamers));
  }, [streamers]);

  const addStreamer = (username: string) => {
    if (streamers.find(s => s.username.toLowerCase() === username.toLowerCase())) return;
    const newStreamer: Streamer = {
      id: Math.random().toString(36).substr(2, 9),
      username,
      addedAt: Date.now()
    };
    setStreamers(prev => [newStreamer, ...prev]);
    setActiveStreamerId(newStreamer.id);
  };

  const removeStreamer = (id: string) => {
    setStreamers(prev => prev.filter(s => s.id !== id));
    if (activeStreamerId === id) setActiveStreamerId(null);
  };

  const fetchInsight = useCallback(async (username: string) => {
    if (insights[username]) return;
    setLoadingInsight(true);
    const data = await getStreamerInsight(username);
    if (data) {
      setInsights(prev => ({ ...prev, [username]: data }));
    }
    setLoadingInsight(false);
  }, [insights]);

  const activeStreamer = streamers.find(s => s.id === activeStreamerId);

  useEffect(() => {
    if (activeStreamer) {
      fetchInsight(activeStreamer.username);
    }
  }, [activeStreamer, fetchInsight]);

  const currentInsight = activeStreamer ? insights[activeStreamer.username] : null;

  return (
    <div className="flex h-screen bg-[#000000] text-white">
      <Sidebar 
        streamers={streamers}
        activeId={activeStreamerId}
        onSelect={setActiveStreamerId}
        onAdd={addStreamer}
        onRemove={removeStreamer}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        {activeStreamer ? (
          <div className="flex-1 flex flex-col p-8 gap-8 overflow-hidden">
            <div className="flex flex-col">
              <h2 className="text-2xl font-bold tracking-tight">{activeStreamer.username}</h2>
              <p className="text-gray-500 text-sm">Canlı chat akışı izleniyor</p>
            </div>
            
            <div className="flex-1 flex gap-6 overflow-hidden">
              <div className="flex-1 min-h-0 bg-[#0e0e0e] rounded-xl border border-[#1a1a1a] overflow-hidden">
                <ChatWindow username={activeStreamer.username} />
              </div>

              {/* Minimal AI Context side bar */}
              <div className="w-72 hidden lg:flex flex-col gap-4">
                 <div className="bg-[#0e0e0e] border border-[#1a1a1a] p-5 rounded-xl">
                    <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-4">Kanal Özeti</h3>
                    {loadingInsight ? (
                      <div className="space-y-3 animate-pulse">
                        <div className="h-2 bg-gray-800 rounded w-full"></div>
                        <div className="h-2 bg-gray-800 rounded w-3/4"></div>
                      </div>
                    ) : currentInsight ? (
                      <div className="space-y-4">
                        <p className="text-xs text-gray-300 leading-relaxed">{currentInsight.summary}</p>
                        <div className="pt-2 border-t border-[#1a1a1a]">
                          <span className="text-[10px] text-gray-500 font-bold block mb-1">ATMOSFER</span>
                          <span className="text-xs text-white">{currentInsight.vibe}</span>
                        </div>
                      </div>
                    ) : null}
                 </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col p-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold tracking-tight">Aktivite Akışı</h1>
              <p className="text-gray-500 text-sm">Arkadaşlarının son aktiviteleri</p>
            </div>

            <div className="flex-1 flex items-center justify-center p-12">
              <div className="w-full max-w-5xl bg-[#0e0e0e] border border-[#1a1a1a] rounded-xl flex flex-col items-center justify-center p-20 text-center">
                <div className="mb-6 text-gray-500">
                  <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                  </svg>
                </div>
                <h3 className="text-lg font-bold mb-2">Henüz aktivite yok</h3>
                <p className="text-gray-500 text-sm max-w-sm">
                  Arkadaşların aktivite gösterdiğinde burada görünecek
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
