'use client';

import React, { useState, useEffect } from 'react';
import { Plus, X, Music, Maximize, Minimize } from 'lucide-react';

interface Streamer {
  id: string;
  username: string;
  addedAt: number;
}

interface SongRequest {
  id: string;
  title: string;
  requester: string;
  timestamp: number;
  youtubeId?: string;
  playing?: boolean;
}

// Şarkı isteği anahtar kelimeleri
const SONG_KEYWORDS = ['!istekşarkı', '!istek', '!song', '!request', '!şarkı', '!sarki', '!music'];

export default function YayinciPage() {
  const [streamers, setStreamers] = useState<Streamer[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('kick_streamers');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [activeStreamerId, setActiveStreamerId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [songRequests, setSongRequests] = useState<SongRequest[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Tam ekran fonksiyonları
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.error('Tam ekran hatası:', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch(err => {
        console.error('Tam ekran çıkış hatası:', err);
      });
    }
  };

  // Fullscreen değişikliklerini dinle
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('kick_streamers', JSON.stringify(streamers));
    }
  }, [streamers]);

  // Kick chat'ten mesajları dinle (gerçek entegrasyon)
  useEffect(() => {
    if (!activeStreamerId) {
      setSongRequests([]); // Kanal değiştiğinde istekleri temizle
      return;
    }

    const activeStreamer = streamers.find(s => s.id === activeStreamerId);
    if (!activeStreamer) return;

    // WebSocket ile Kick chat'e bağlan
    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout;

    const connectToKick = async () => {
      try {
        // Kanal bilgilerini al
        const response = await fetch(`https://kick.com/api/v2/channels/${activeStreamer.username}`);
        if (!response.ok) throw new Error('Channel not found');
        
        const data = await response.json();
        const chatroomId = data.chatroom?.id;
        
        if (!chatroomId) throw new Error('Chatroom ID not found');

        // Pusher WebSocket'e bağlan
        const pusherUrl = 'wss://ws-us2.pusher.com/app/32cbd69e4b950bf97679?protocol=7&client=js&version=8.4.0-rc2&flash=false';
        ws = new WebSocket(pusherUrl);

        ws.onopen = () => {
          console.log('✅ Kick WebSocket bağlandı');
          
          // Chatroom'a subscribe ol
          ws?.send(JSON.stringify({
            event: 'pusher:subscribe',
            data: {
              auth: '',
              channel: `chatrooms.${chatroomId}.v2`
            }
          }));
        };

        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            
            // Chat mesajı event'lerini işle
            if (msg.event && msg.event.includes('ChatMessage')) {
              let payload;
              try {
                payload = JSON.parse(msg.data);
              } catch {
                return;
              }

              const username = 
                payload.sender?.username ||
                payload.message?.sender?.username ||
                payload.sender_username ||
                payload.username;

              const content = 
                payload.content ||
                payload.message?.content ||
                payload.text ||
                payload.message ||
                '';

              if (username && content && typeof content === 'string') {
                processChatMessage(username, content);
              }
            }
          } catch (error) {
            console.error('WebSocket mesaj hatası:', error);
          }
        };

        ws.onclose = () => {
          console.log('🛑 WebSocket kapandı, yeniden bağlanılıyor...');
          reconnectTimeout = setTimeout(connectToKick, 3000);
        };

        ws.onerror = (error) => {
          console.error('❌ WebSocket hatası:', error);
        };

      } catch (error) {
        console.error('Kick bağlantı hatası:', error);
        reconnectTimeout = setTimeout(connectToKick, 5000);
      }
    };

    // Chat mesajını işle ve şarkı isteğini algıla
    const processChatMessage = (username: string, content: string) => {
      const contentLower = content.toLowerCase();
      
      // Şarkı isteği kontrolü
      const isSongRequest = SONG_KEYWORDS.some(keyword => {
        const lowerKeyword = keyword.toLowerCase();
        return contentLower.startsWith(lowerKeyword) || 
               contentLower.includes(' ' + lowerKeyword + ' ') ||
               contentLower.includes(' ' + lowerKeyword);
      });

      if (isSongRequest) {
        // Şarkı adını çıkar
        let songTitle = content;
        SONG_KEYWORDS.forEach(keyword => {
          const regex = new RegExp(keyword, 'gi');
          songTitle = songTitle.replace(regex, '').trim();
        });

        // Temizle
        songTitle = songTitle.replace(/\s+/g, ' ').trim();
        
        if (songTitle && songTitle.length > 2) {
          const newRequest: SongRequest = {
            id: `req-${Date.now()}-${Math.random()}`,
            title: songTitle,
            requester: username,
            timestamp: Date.now()
          };

          setSongRequests(prev => {
            // Aynı şarkıyı tekrar ekleme
            if (prev.some(r => r.title.toLowerCase() === songTitle.toLowerCase())) return prev;
            // Maksimum 50 istek
            const updated = [newRequest, ...prev].slice(0, 50);
            return updated;
          });

          console.log(`🎵 Yeni şarkı isteği: "${songTitle}" - ${username}`);
        }
      }
    };

    connectToKick();

    return () => {
      if (ws) {
        ws.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, [activeStreamerId, streamers]);

  const removeSongRequest = (id: string) => {
    setSongRequests(prev => prev.filter(r => r.id !== id));
  };

  // Test için manuel şarkı ekle
  const addTestSongRequest = () => {
    const testRequest: SongRequest = {
      id: `test-${Date.now()}`,
      title: 'Pilli Bebek - Bak',
      requester: 'Test User',
      timestamp: Date.now()
    };
    setSongRequests(prev => [testRequest, ...prev]);
  };

  // YouTube'dan şarkı ara ve çal
  const playSongRequest = async (request: SongRequest) => {
    try {
      console.log('🎵 Şarkı aranıyor:', request.title);
      
      // YouTube'da ara
      const response = await fetch(`/api/youtube-scrape?q=${encodeURIComponent(request.title)}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📺 YouTube sonuçları:', data);
      
      if (data.videos && data.videos.length > 0) {
        const video = data.videos[0];
        console.log('✅ Video bulundu:', video);
        
        // Şarkıyı ana player'da çal
        const song = {
          id: video.id,
          title: video.title,
          artist: request.requester,
          audioUrl: video.id, // YouTube ID
          imageUrl: video.thumbnail || `https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`,
          duration: 0,
          aiHint: 'song'
        };

        console.log('🎶 Player\'a gönderiliyor:', song);

        // Player'a şarkıyı gönder
        window.dispatchEvent(new CustomEvent('playSong', { detail: song }));

        // İsteği güncelle
        setSongRequests(prev => 
          prev.map(r => r.id === request.id ? { ...r, youtubeId: video.id, playing: true } : { ...r, playing: false })
        );

        console.log('▶️ Şarkı çalınıyor:', video.title);
      } else {
        console.error('❌ YouTube\'da şarkı bulunamadı');
        alert('Şarkı bulunamadı! Lütfen farklı bir arama terimi deneyin.');
      }
    } catch (error) {
      console.error('❌ YouTube arama hatası:', error);
      alert('Şarkı çalınırken hata oluştu! Console\'u kontrol edin.');
    }
  };

  const addStreamer = (username: string) => {
    if (streamers.find(s => s.username.toLowerCase() === username.toLowerCase())) return;
    const newStreamer: Streamer = {
      id: Math.random().toString(36).substring(2, 9),
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      addStreamer(input.trim());
      setInput('');
    }
  };

  const activeStreamer = streamers.find(s => s.id === activeStreamerId);
  const chatUrl = activeStreamer ? `https://kick.com/popout/${activeStreamer.username}/chat` : '';

  return (
    <div className={`flex bg-background text-foreground ${isFullscreen ? 'h-screen w-screen' : 'h-[calc(100vh-80px)]'}`}>
      {/* Sidebar - Tam ekranda gizle */}
      {!isFullscreen && (
        <div className="w-64 bg-background/50 backdrop-blur-xl border-r border-white/5 flex flex-col h-full shrink-0">
          <div className="p-4 mt-2">
            <form onSubmit={handleSubmit} className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Yayıncı Ekle..."
                className="w-full bg-white/5 border border-white/10 rounded-md py-2 px-3 text-sm focus:outline-none focus:border-white/20 transition-all placeholder-muted-foreground"
              />
              <button 
                type="submit"
                className="absolute right-2 top-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>
          </div>

          <div className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
            {streamers.map((s) => (
              <div 
                key={s.id}
                onClick={() => setActiveStreamerId(s.id)}
                className={`group flex items-center justify-between p-2 rounded-md cursor-pointer transition-all ${
                  activeStreamerId === s.id ? 'bg-primary/20 text-primary' : 'hover:bg-white/10'
                }`}
              >
                <div className="flex items-center space-x-3 overflow-hidden">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                     activeStreamerId === s.id ? 'bg-primary text-primary-foreground' : 'bg-white/10 text-muted-foreground'
                  }`}>
                    {s.username[0].toUpperCase()}
                  </div>
                  <span className={`text-sm font-medium truncate ${activeStreamerId === s.id ? 'text-primary' : 'text-muted-foreground'}`}>
                    {s.username}
                  </span>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    removeStreamer(s.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {activeStreamer ? (
          <div className={`flex-1 flex flex-col overflow-hidden ${isFullscreen ? 'p-4' : 'p-8'}`}>
            <div className={`flex flex-col ${isFullscreen ? 'mb-4' : 'mb-8'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <h2 className={`font-bold tracking-tight ${isFullscreen ? 'text-xl' : 'text-2xl'}`}>{activeStreamer.username}</h2>
                    <p className="text-muted-foreground text-sm">Canlı chat akışı izleniyor</p>
                  </div>
                  
                  {/* Tam ekranda yayıncı değiştirme dropdown'u */}
                  {isFullscreen && streamers.length > 1 && (
                    <select
                      value={activeStreamerId || ''}
                      onChange={(e) => setActiveStreamerId(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-md py-1 px-2 text-sm focus:outline-none focus:border-white/20 transition-all"
                    >
                      {streamers.map((s) => (
                        <option key={s.id} value={s.id} className="bg-background text-foreground">
                          {s.username}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                
                {/* Tam Ekran Butonu */}
                <button
                  onClick={toggleFullscreen}
                  className="flex items-center gap-2 px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg transition-all duration-200 border border-primary/20"
                  title={isFullscreen ? "Tam ekrandan çık" : "Tam ekran yap"}
                >
                  {isFullscreen ? (
                    <>
                      <Minimize className="w-4 h-4" />
                      <span className="text-sm font-medium">Çık</span>
                    </>
                  ) : (
                    <>
                      <Maximize className="w-4 h-4" />
                      <span className="text-sm font-medium">Tam Ekran</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            
            <div className={`flex-1 flex overflow-hidden ${isFullscreen ? 'gap-4' : 'gap-6'}`}>
              {/* Chat Container - Tam ekranda büyük */}
              <div className={`min-h-0 bg-card rounded-xl border border-white/5 overflow-hidden ${
                isFullscreen ? 'flex-[2]' : 'flex-1 max-w-2xl'
              }`}>
                {chatUrl ? (
                  <iframe
                    src={chatUrl}
                    className="w-full h-full border-none"
                    title={`${activeStreamer.username} Chat`}
                    sandbox="allow-scripts allow-same-origin allow-popups"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">Chat yükleniyor...</p>
                  </div>
                )}
              </div>

              {/* Şarkı İstekleri Paneli */}
              <div className={`flex flex-col gap-4 min-w-0 ${isFullscreen ? 'flex-1' : 'flex-1'}`}>
                 <div className="bg-card border border-white/5 rounded-xl flex flex-col h-full overflow-hidden">
                    <div className="p-5 border-b border-white/5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Music className="w-4 h-4 text-primary" />
                          <h3 className="text-sm font-bold text-foreground">Şarkı İstekleri</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={addTestSongRequest}
                            className="text-xs text-muted-foreground hover:text-primary transition-colors px-2 py-1 rounded bg-white/5"
                            title="Test şarkısı ekle"
                          >
                            Test +
                          </button>
                          <span className="text-xs text-muted-foreground bg-white/5 px-2 py-1 rounded-full">
                            {songRequests.length}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                      {songRequests.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center p-8">
                          <Music className="w-12 h-12 text-muted-foreground/50 mb-3" />
                          <p className="text-sm text-muted-foreground">Henüz şarkı isteği yok</p>
                          <p className="text-xs text-muted-foreground/70 mt-1">
                            Chat'te !istek veya !şarkı yazıldığında burada görünecek
                          </p>
                        </div>
                      ) : (
                        songRequests.map((request) => (
                          <div 
                            key={request.id}
                            className={`group border rounded-lg p-3 transition-all ${
                              request.playing 
                                ? 'bg-primary/20 border-primary/50' 
                                : 'bg-white/5 hover:bg-white/10 border-white/5'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  {request.playing && (
                                    <span className="text-primary text-xs font-bold">▶</span>
                                  )}
                                  <p className="text-sm font-semibold text-foreground truncate">
                                    {request.title}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs text-muted-foreground">
                                    İsteyen: {request.requester}
                                  </span>
                                  <span className="text-xs text-muted-foreground/50">
                                    {new Date(request.timestamp).toLocaleTimeString('tr-TR', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => playSongRequest(request)}
                                  className={`p-2 rounded-md transition-all ${
                                    request.playing
                                      ? 'bg-primary text-primary-foreground'
                                      : 'text-primary hover:bg-primary/20'
                                  }`}
                                  title="Şarkıyı Çal"
                                >
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z"/>
                                  </svg>
                                </button>
                                <button
                                  onClick={() => removeSongRequest(request.id)}
                                  className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-all"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                 </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col p-8">
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Yayıncı Takibi</h1>
                  <p className="text-muted-foreground text-sm">Kick.com yayıncılarını takip edin</p>
                </div>
                
                {/* Tam Ekran Butonu */}
                <button
                  onClick={toggleFullscreen}
                  className="flex items-center gap-2 px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg transition-all duration-200 border border-primary/20"
                  title={isFullscreen ? "Tam ekrandan çık" : "Tam ekran yap"}
                >
                  {isFullscreen ? (
                    <>
                      <Minimize className="w-4 h-4" />
                      <span className="text-sm font-medium">Çık</span>
                    </>
                  ) : (
                    <>
                      <Maximize className="w-4 h-4" />
                      <span className="text-sm font-medium">Tam Ekran</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="flex-1 flex items-center justify-center p-12">
              <div className="w-full max-w-5xl bg-card border border-white/5 rounded-xl flex flex-col items-center justify-center p-20 text-center">
                <div className="mb-6 text-muted-foreground">
                  <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                  </svg>
                </div>
                <h3 className="text-lg font-bold mb-2">Henüz yayıncı eklemediniz</h3>
                <p className="text-muted-foreground text-sm max-w-sm">
                  Sol taraftan yayıncı ekleyerek chat akışını takip edebilirsiniz
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
