'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, 
  BarChart3, 
  Briefcase, 
  Settings, 
  User, 
  LogOut, 
  Copy, 
  Share2, 
  Bookmark, 
  Download,
  RefreshCw,
  Info,
  Bug,
  Zap,
  Heart,
  Star
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, onClose }) => {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

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

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const menuItems = [
    {
      icon: Home,
      label: 'Ana Sayfa',
      action: () => {
        router.push('/home');
        onClose();
      },
      shortcut: 'Ctrl+H'
    },
    {
      icon: BarChart3,
      label: 'Analytics Raporu',
      action: () => {
        router.push('/rapor');
        onClose();
      },
      shortcut: 'Ctrl+R'
    },
    {
      icon: Briefcase,
      label: 'Yatırımcı Merkezi',
      action: () => {
        router.push('/yatirim');
        onClose();
      },
      shortcut: 'Ctrl+Y'
    },
    { type: 'separator' },
    {
      icon: Copy,
      label: 'Sayfayı Kopyala',
      action: () => {
        navigator.clipboard.writeText(window.location.href);
        onClose();
      },
      shortcut: 'Ctrl+C'
    },
    {
      icon: Share2,
      label: 'Paylaş',
      action: () => {
        if (navigator.share) {
          navigator.share({
            title: 'Dinletiyo',
            text: 'Türkiye\'nin müzik platformu',
            url: window.location.href
          });
        } else {
          navigator.clipboard.writeText(window.location.href);
        }
        onClose();
      },
      shortcut: 'Ctrl+S'
    },
    {
      icon: Bookmark,
      label: 'Favorilere Ekle',
      action: () => {
        // Favorilere ekleme işlemi
        const currentPage = window.location.pathname;
        const favorites = JSON.parse(localStorage.getItem('favorite-pages') || '[]');
        if (!favorites.includes(currentPage)) {
          favorites.push(currentPage);
          localStorage.setItem('favorite-pages', JSON.stringify(favorites));
        }
        onClose();
      },
      shortcut: 'Ctrl+D'
    },
    { type: 'separator' },
    {
      icon: RefreshCw,
      label: 'Sayfayı Yenile',
      action: () => {
        window.location.reload();
        onClose();
      },
      shortcut: 'F5'
    },
    {
      icon: Download,
      label: 'Sayfa Bilgilerini İndir',
      action: () => {
        const pageInfo = {
          url: window.location.href,
          title: document.title,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent
        };
        const blob = new Blob([JSON.stringify(pageInfo, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sayfa-bilgileri.json';
        a.click();
        URL.revokeObjectURL(url);
        onClose();
      },
      shortcut: 'Ctrl+I'
    },
    { type: 'separator' },
    {
      icon: User,
      label: 'Profil',
      action: () => {
        router.push('/home/profile');
        onClose();
      },
      shortcut: 'Ctrl+P'
    },
    {
      icon: Settings,
      label: 'Ayarlar',
      action: () => {
        router.push('/home/settings');
        onClose();
      },
      shortcut: 'Ctrl+,'
    },
    { type: 'separator' },
    {
      icon: Bug,
      label: 'Hata Bildir',
      action: () => {
        const errorReport = {
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          message: 'Kullanıcı hata bildirdi'
        };
        console.log('Hata Raporu:', errorReport);
        alert('Hata raporu gönderildi! Teşekkürler.');
        onClose();
      },
      shortcut: 'Ctrl+B'
    },
    {
      icon: Info,
      label: 'Hakkında',
      action: () => {
        alert(`Dinletiyo v1.0\nTürkiye'nin müzik platformu\n\nGeliştirici: Dinletiyo Ekibi\nTarih: ${new Date().getFullYear()}`);
        onClose();
      },
      shortcut: 'Ctrl+?'
    }
  ];

  // Menünün ekran dışına taşmasını engelle
  const adjustedX = Math.min(x, window.innerWidth - 250);
  const adjustedY = Math.min(y, window.innerHeight - 400);

  return (
    <div
      ref={menuRef}
      className="fixed z-[9999] bg-card/95 backdrop-blur-xl border border-border rounded-lg shadow-2xl py-2 min-w-[240px]"
      style={{
        left: adjustedX,
        top: adjustedY,
      }}
      onClick={(e) => e.stopPropagation()}
    >
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
          <button
            key={index}
            onClick={item.action}
            className="w-full flex items-center justify-between px-3 py-2 text-sm text-foreground hover:bg-muted/50 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <Icon className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
              <span>{item.label}</span>
            </div>
            {item.shortcut && (
              <span className="text-xs text-muted-foreground bg-muted/30 px-1.5 py-0.5 rounded">
                {item.shortcut}
              </span>
            )}
          </button>
        );
      })}
      
      {/* Alt kısım - Dinletiyo branding */}
      <div className="border-t border-border mt-2 pt-2 px-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Heart className="h-3 w-3 text-red-500" />
          <span>Dinletiyo ile yapıldı</span>
          <Star className="h-3 w-3 text-yellow-500" />
        </div>
      </div>
    </div>
  );
};

export const GlobalContextMenu: React.FC = () => {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const handleContextMenu = (event: MouseEvent) => {
      // Sadece input, textarea ve contenteditable elementlerde varsayılan context menu'yu göster
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true' ||
        target.closest('input') ||
        target.closest('textarea')
      ) {
        return; // Varsayılan context menu'yu göster
      }

      // Şarkı kartları ve video kartlarında global context menu'yu gösterme
      const isSongCard = target.closest('.song-card-container') || 
                        target.closest('.video-card-container') ||
                        target.closest('[data-song-card]') ||
                        target.closest('[data-video-card]');
      
      if (isSongCard) {
        return; // Şarkı context menu'sunu çalıştır, global menu'yu gösterme
      }

      event.preventDefault();
      setContextMenu({ x: event.clientX, y: event.clientY });
    };

    const handleClick = () => {
      setContextMenu(null);
    };

    // Keyboard shortcuts
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'h':
            event.preventDefault();
            window.location.href = '/home';
            break;
          case 'r':
            if (!event.shiftKey) {
              event.preventDefault();
              window.location.href = '/rapor';
            }
            break;
          case 'y':
            event.preventDefault();
            window.location.href = '/yatirim';
            break;
          case 'p':
            event.preventDefault();
            window.location.href = '/home/profile';
            break;
          case ',':
            event.preventDefault();
            window.location.href = '/home/settings';
            break;
        }
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <>
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
        />
      )}
    </>
  );
};

export default GlobalContextMenu;