'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  SkipForward, 
  ListMusic, 
  Heart, 
  Share2, 
  Download,
  Repeat,
  Plus,
  Star,
  Clock,
  User,
  Album,
  Radio,
  Shuffle,
  Volume2,
  Info
} from 'lucide-react';
import { Song } from '@/lib/data';
import { libraryManager } from '@/lib/library-manager';

interface SongContextMenuProps {
  song: Song;
  x: number;
  y: number;
  onClose: () => void;
}

const SongContextMenu: React.FC<SongContextMenuProps> = ({ song, x, y, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [showPlaylistSubmenu, setShowPlaylistSubmenu] = useState(false);
  const [userPlaylists, setUserPlaylists] = useState<any[]>([]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    // Kullanıcının playlistlerini yükle
    loadUserPlaylists();

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const loadUserPlaylists = async () => {
    try {
      const currentUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
      if (currentUser) {
        const userData = JSON.parse(currentUser);
        const response = await fetch(`/api/playlists?userId=${userData.id}`);
        if (response.ok) {
          const data = await response.json();
          setUserPlaylists(data.playlists || []);
        }
      }
    } catch (error) {
      console.error('Playlist yükleme hatası:', error);
    }
  };

  const handlePlay = () => {
    window.dispatchEvent(new CustomEvent('playSong', { detail: song }));
    onClose();
  };

  const handlePlayNext = async () => {
    console.log('🎵 Context Menu: Sonraki çal tıklandı:', song.title);
    try {
      // Event gönder - player'da dinleniyor
      window.dispatchEvent(new CustomEvent('playNext', { detail: song }));
      console.log('📤 Event gönderildi: playNext');
      
      // Kısa bir gecikme sonrası kontrol et
      setTimeout(() => {
        console.log('⏰ Event gönderildikten 100ms sonra kontrol');
      }, 100);
      
      onClose();
    } catch (error) {
      console.error('❌ Context menu playNext hatası:', error);
    }
  };

  const handleAddToQueue = async () => {
    console.log('🎵 Context Menu: Kuyruğa ekle tıklandı:', song.title);
    try {
      // Event gönder - player'da dinleniyor
      window.dispatchEvent(new CustomEvent('addToQueue', { detail: song }));
      console.log('📤 Event gönderildi: addToQueue');
      
      // Kısa bir gecikme sonrası kontrol et
      setTimeout(() => {
        console.log('⏰ Event gönderildikten 100ms sonra kontrol');
      }, 100);
      
      onClose();
    } catch (error) {
      console.error('❌ Context menu addToQueue hatası:', error);
    }
  };

  const handleAddToFavorites = async () => {
    try {
      console.log('❤️ Context Menu: Adding to favorites via LibraryManager:', song.title);
      
      // Use LibraryManager for atomic operation with backup/rollback
      const result = await libraryManager.addToFavorites(song.id);
      
      if (result.success) {
        // Toast notification
        const event = new CustomEvent('showToast', { 
          detail: { message: `"${song.title}" favorilere eklendi! ❤️`, type: 'success' }
        });
        window.dispatchEvent(event);
        console.log('✅ Context Menu: Successfully added to favorites');
      } else {
        // Error notification
        const event = new CustomEvent('showToast', { 
          detail: { message: `Hata: ${result.message}`, type: 'error' }
        });
        window.dispatchEvent(event);
        console.error('❌ Context Menu: Failed to add to favorites:', result.message);
      }
    } catch (error) {
      console.error('❌ Context Menu: Favorilere ekleme hatası:', error);
      
      // Error notification
      const event = new CustomEvent('showToast', { 
        detail: { message: 'Favorilere eklenirken bir hata oluştu', type: 'error' }
      });
      window.dispatchEvent(event);
    }
    onClose();
  };

  const handleAddToPlaylist = async (playlistId: string, playlistName: string) => {
    try {
      const response = await fetch(`/api/playlists/${playlistId}/songs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          song: song
        }),
      });

      if (response.ok) {
        // Toast notification
        const event = new CustomEvent('showToast', { 
          detail: { message: `"${song.title}" "${playlistName}" listesine eklendi!`, type: 'success' }
        });
        window.dispatchEvent(event);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Playliste ekleme başarısız');
      }
    } catch (error: any) {
      console.error('Playliste ekleme hatası:', error);
      // Error toast
      const event = new CustomEvent('showToast', { 
        detail: { message: error.message || 'Playliste eklenirken bir hata oluştu', type: 'error' }
      });
      window.dispatchEvent(event);
    }
    setShowPlaylistSubmenu(false);
    onClose();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: song.title,
        text: `${song.artist} - ${song.title}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(`${song.artist} - ${song.title}\n${window.location.href}`);
      // Toast notification
      const event = new CustomEvent('showToast', { 
        detail: { message: 'Şarkı bilgisi panoya kopyalandı!', type: 'success' }
      });
      window.dispatchEvent(event);
    }
    onClose();
  };

  const handleStartRadio = () => {
    console.log('🎵 Context Menu: Radyo başlat tıklandı:', song.title);
    try {
      // Event gönder - player'da dinleniyor
      window.dispatchEvent(new CustomEvent('startRadio', { detail: song }));
      console.log('📤 Event gönderildi: startRadio');
      
      // Kısa bir gecikme sonrası kontrol et
      setTimeout(() => {
        console.log('⏰ Event gönderildikten 100ms sonra kontrol');
      }, 100);
      
      onClose();
    } catch (error) {
      console.error('❌ Context menu startRadio hatası:', error);
    }
  };

  const handleShowInfo = () => {
    // Şarkı bilgileri modalı aç
    const event = new CustomEvent('showSongInfo', { detail: song });
    window.dispatchEvent(event);
    onClose();
  };

  const handleDownload = () => {
    // Offline indirme özelliği
    const event = new CustomEvent('downloadSong', { detail: song });
    window.dispatchEvent(event);
    
    const toastEvent = new CustomEvent('showToast', { 
      detail: { message: `"${song.title}" indiriliyor...`, type: 'info' }
    });
    window.dispatchEvent(toastEvent);
    onClose();
  };

  // Menünün ekran dışına taşmasını engelle
  const adjustedX = Math.min(x, window.innerWidth - 280);
  const adjustedY = Math.min(y, window.innerHeight - 500);

  const menuItems = [
    {
      icon: Play,
      label: 'Şimdi Çal',
      action: handlePlay,
      shortcut: 'Space'
    },
    {
      icon: SkipForward,
      label: 'Sonraki Çal',
      action: handlePlayNext,
      shortcut: 'Ctrl+N'
    },
    {
      icon: ListMusic,
      label: 'Kuyruğa Ekle',
      action: handleAddToQueue,
      shortcut: 'Ctrl+Q'
    },
    { type: 'separator' },
    {
      icon: Heart,
      label: 'Favorilere Ekle',
      action: handleAddToFavorites,
      shortcut: 'Ctrl+L'
    },
    {
      icon: Plus,
      label: 'Playliste Ekle',
      action: () => setShowPlaylistSubmenu(!showPlaylistSubmenu),
      hasSubmenu: true
    },
    { type: 'separator' },
    {
      icon: Radio,
      label: 'Radyo Başlat',
      action: handleStartRadio,
      shortcut: 'Ctrl+R'
    },
    {
      icon: Repeat,
      label: 'Şarkıyı Tekrarla',
      action: () => {
        window.dispatchEvent(new CustomEvent('repeatSong', { detail: song }));
        onClose();
      }
    },
    { type: 'separator' },
    {
      icon: Share2,
      label: 'Paylaş',
      action: handleShare,
      shortcut: 'Ctrl+S'
    },
    {
      icon: Download,
      label: 'İndir',
      action: handleDownload,
      shortcut: 'Ctrl+D'
    },
    { type: 'separator' },
    {
      icon: Info,
      label: 'Şarkı Bilgileri',
      action: handleShowInfo,
      shortcut: 'Ctrl+I'
    }
  ];

  return (
    <div
      ref={menuRef}
      className="fixed z-[9999] bg-card/95 backdrop-blur-xl border border-border rounded-lg shadow-2xl py-2 min-w-[260px]"
      style={{
        left: adjustedX,
        top: adjustedY,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Şarkı Başlığı */}
      <div className="px-3 py-2 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Volume2 className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{song.title}</p>
            <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      {menuItems.map((item, index) => {
        if (item.type === 'separator') {
          return (
            <div
              key={index}
              className="h-px bg-border mx-2 my-1"
            />
          );
        }

        const Icon = item.icon;
        return (
          <div key={index} className="relative">
            <button
              onClick={item.action}
              className="w-full flex items-center justify-between px-3 py-2 text-sm text-foreground hover:bg-muted/50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Icon className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                <span>{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                {item.shortcut && (
                  <span className="text-xs text-muted-foreground bg-muted/30 px-1.5 py-0.5 rounded">
                    {item.shortcut}
                  </span>
                )}
                {item.hasSubmenu && (
                  <svg className="w-3 h-3 text-muted-foreground" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </button>

            {/* Playlist Submenu */}
            {item.hasSubmenu && showPlaylistSubmenu && (
              <div className="absolute left-full top-0 ml-1 bg-card/95 backdrop-blur-xl border border-border rounded-lg shadow-xl py-2 min-w-[200px] z-[10000]">
                <div className="px-3 py-2 text-xs font-semibold text-muted-foreground border-b border-border">
                  Playliste Ekle
                </div>
                {userPlaylists.length > 0 ? (
                  userPlaylists.map((playlist) => (
                    <button
                      key={playlist.id}
                      onClick={() => handleAddToPlaylist(playlist.id, playlist.name)}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-muted/50 transition-colors"
                    >
                      <ListMusic className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{playlist.name}</span>
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    Henüz playlist yok
                  </div>
                )}
                <div className="border-t border-border mt-1 pt-1">
                  <button
                    onClick={() => {
                      // Yeni playlist oluşturma sayfasına yönlendir
                      window.location.href = '/home/create-playlist';
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-muted/50 transition-colors"
                  >
                    <Plus className="h-4 w-4 text-muted-foreground" />
                    <span>Yeni Playlist Oluştur</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
      
      {/* Alt kısım - Şarkı detayları */}
      <div className="border-t border-border mt-2 pt-2 px-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3" />
            <span>{song.duration || '3:45'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Album className="h-3 w-3" />
            <span className="truncate max-w-[100px]">{song.album || 'Bilinmeyen'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SongContextMenu;