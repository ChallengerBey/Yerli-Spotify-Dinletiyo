'use client';

import React, { useState, useEffect } from 'react';
import { Song } from '@/lib/data';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Heart, 
  Share2, 
  Download,
  Clock,
  Calendar,
  User,
  Album,
  Music,
  Star,
  Eye,
  Headphones
} from 'lucide-react';
import Image from 'next/image';
import { ArtistHoverCard } from '@/components/artist-hover-card';
import { splitArtistNames } from '@/lib/artist-names';

interface SongInfoModalProps {
  song: Song | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SongInfoModal({ song, isOpen, onClose }: SongInfoModalProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [playCount, setPlayCount] = useState<number | null>(null);

  useEffect(() => {
    if (song) {
      // Favorilerde olup olmadığını kontrol et
      const favorites = JSON.parse(localStorage.getItem('user-favorites') || '[]');
      setIsLiked(favorites.some((fav: any) => fav.id === song.id));
    }
  }, [song]);

  if (!song) return null;

  const contributors = splitArtistNames(song.artist);

  const handlePlay = () => {
    window.dispatchEvent(new CustomEvent('playSong', { detail: song }));
    onClose();
  };

  const handleToggleLike = async () => {
    try {
      const currentUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
      if (currentUser) {
        const userData = JSON.parse(currentUser);
        
        if (isLiked) {
          // Favorilerden çıkar
          await fetch('/api/favorites', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: userData.id,
              songId: song.id
            }),
          });
          setIsLiked(false);
          
          const event = new CustomEvent('showToast', { 
            detail: { message: 'Favorilerden çıkarıldı', type: 'info' }
          });
          window.dispatchEvent(event);
        } else {
          // Favorilere ekle
          await fetch('/api/favorites', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: userData.id,
              songId: song.id,
              song: song
            }),
          });
          setIsLiked(true);
          
          const event = new CustomEvent('showToast', { 
            detail: { message: 'Favorilere eklendi! ❤️', type: 'success' }
          });
          window.dispatchEvent(event);
        }
      }
    } catch (error) {
      console.error('Favori işlemi hatası:', error);
    }
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
      const event = new CustomEvent('showToast', { 
        detail: { message: 'Şarkı bilgisi panoya kopyalandı!', type: 'success' }
      });
      window.dispatchEvent(event);
    }
  };

  const handleDownload = () => {
    const event = new CustomEvent('downloadSong', { detail: song });
    window.dispatchEvent(event);
    
    const toastEvent = new CustomEvent('showToast', { 
      detail: { message: `"${song.title}" indiriliyor...`, type: 'info' }
    });
    window.dispatchEvent(toastEvent);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Şarkı Bilgileri</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Şarkı Başlık Bölümü */}
          <div className="flex gap-6">
            <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 flex-shrink-0">
              {song.imageUrl ? (
                <Image
                  src={song.imageUrl}
                  alt={song.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Music className="w-12 h-12 text-white" />
                </div>
              )}
            </div>
            
            <div className="flex-1 space-y-3">
              <div>
                <h2 className="text-2xl font-bold text-foreground">{song.title}</h2>
                <p className="text-lg text-muted-foreground">
                  {(() => {
                    const names = contributors.length ? contributors : [song.artist];
                    return names.map((n, idx) => (
                      <span key={`${song.id}-modal-artist-${n}-${idx}`}>
                        <ArtistHoverCard name={n}>{n}</ArtistHoverCard>
                        {idx < names.length - 1 ? ", " : null}
                      </span>
                    ));
                  })()}
                </p>
                {contributors.length > 1 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {contributors.map((c) => (
                      <span
                        key={c}
                        className="text-xs px-2 py-1 rounded-full bg-muted/40 text-muted-foreground"
                      >
                        <ArtistHoverCard name={c}>{c}</ArtistHoverCard>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2">
                {playCount !== null && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {formatNumber(playCount)} dinlenme
                  </Badge>
                )}
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {song.duration || '3:45'}
                </Badge>
                {/* Gerçek puan sistemi bağlanınca gösterilecek */}
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handlePlay} className="flex items-center gap-2">
                  <Play className="w-4 h-4" />
                  Çal
                </Button>
                <Button 
                  variant={isLiked ? "default" : "outline"} 
                  onClick={handleToggleLike}
                  className="flex items-center gap-2"
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                  {isLiked ? 'Favorilerde' : 'Favorile'}
                </Button>
                <Button variant="outline" onClick={handleShare} className="flex items-center gap-2">
                  <Share2 className="w-4 h-4" />
                  Paylaş
                </Button>
                <Button variant="outline" onClick={handleDownload} className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  İndir
                </Button>
              </div>
            </div>
          </div>
          
          {/* Detay Bilgileri */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Şarkı Detayları</h3>
              
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Sanatçı:</span>
                  <span className="text-sm font-medium">{song.artist}</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <Album className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Albüm:</span>
                  <span className="text-sm font-medium">{song.album || 'Bilinmeyen Albüm'}</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Yıl:</span>
                  <span className="text-sm font-medium">{song.year || '2024'}</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <Music className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Tür:</span>
                  <span className="text-sm font-medium">{song.genre || 'Pop'}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">İstatistikler</h3>
              
              {playCount === null ? (
                <p className="text-sm text-muted-foreground">
                  Bu şarkı için istatistikler henüz hazır değil.
                </p>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Headphones className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Dinlenme:</span>
                    <span className="text-sm font-medium">{formatNumber(playCount)}</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Heart className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Beğeni:</span>
                    <span className="text-sm font-medium">{formatNumber(Math.floor(playCount * 0.1))}</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Share2 className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Paylaşım:</span>
                    <span className="text-sm font-medium">{formatNumber(Math.floor(playCount * 0.05))}</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Download className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">İndirme:</span>
                    <span className="text-sm font-medium">{formatNumber(Math.floor(playCount * 0.02))}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Şarkı Sözleri Önizleme */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Şarkı Sözleri Önizleme</h3>
            <div className="bg-muted/30 rounded-lg p-4">
              <p className="text-sm text-muted-foreground italic">
                Şarkı sözleri yükleniyor... Bu özellik yakında eklenecek!
              </p>
            </div>
          </div>
          
          {/* Benzer Şarkılar */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Bu Şarkıyı Beğenenler Ayrıca Dinledi</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-muted/30 rounded-lg p-3 hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="w-full aspect-square bg-gradient-to-br from-blue-500 to-purple-500 rounded mb-2 flex items-center justify-center">
                    <Music className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-sm font-medium truncate">Benzer Şarkı {i}</p>
                  <p className="text-xs text-muted-foreground truncate">Sanatçı {i}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}