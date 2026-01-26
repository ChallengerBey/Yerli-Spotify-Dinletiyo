"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Youtube, Download, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Song } from "@/lib/data";

interface ImportedPlaylist {
  title: string;
  description: string;
  songs: Song[];
  thumbnail: string;
}

export function YouTubePlaylistImport() {
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importedPlaylist, setImportedPlaylist] = useState<ImportedPlaylist | null>(null);
  const [error, setError] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // YouTube playlist URL'sinden playlist ID'sini çıkar
  const extractPlaylistId = (url: string): string | null => {
    const patterns = [
      /[?&]list=([^&]+)/,
      /playlist\?list=([^&]+)/,
      /youtube\.com\/playlist\?list=([^&]+)/,
      /youtu\.be\/playlist\?list=([^&]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const importPlaylist = async () => {
    if (!playlistUrl.trim()) {
      setError('Lütfen geçerli bir YouTube playlist URL\'si girin');
      return;
    }

    const playlistId = extractPlaylistId(playlistUrl);
    if (!playlistId) {
      setError('Geçersiz YouTube playlist URL\'si. Örnek: https://youtube.com/playlist?list=PLxxxxxx');
      return;
    }

    setIsImporting(true);
    setError('');
    setImportedPlaylist(null);

    try {
      console.log('🎵 YouTube playlist import başlıyor:', playlistId);
      
      // YouTube playlist verilerini çek
      const response = await fetch(`/api/youtube-playlist-import?playlistId=${playlistId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Playlist import edilemedi');
      }

      if (!data.playlist || !data.playlist.items || data.playlist.items.length === 0) {
        throw new Error('Playlist boş veya erişilemiyor');
      }

      console.log(`📺 ${data.playlist.items.length} video bulundu, işleniyor...`);

      // Playlist bilgilerini al
      const playlistInfo = data.playlist.snippet || {};
      const playlistTitle = playlistInfo.title || 'İçe Aktarılan Playlist';
      const playlistDescription = playlistInfo.description || 'YouTube\'dan içe aktarılan playlist';
      const playlistThumbnail = playlistInfo.thumbnails?.high?.url || playlistInfo.thumbnails?.default?.url || '';

      // Video bilgilerini işle ve Song formatına çevir
      const songs: Song[] = data.playlist.items
        .filter((item: any) => {
          // Silinen veya private videoları filtrele
          if (!item.snippet || 
              !item.snippet.title || 
              !item.snippet.resourceId ||
              !item.snippet.resourceId.videoId) {
            return false;
          }

          const title = item.snippet.title;
          
          // Düşük kalite içerikleri filtrele
          const lowQualityKeywords = [
            'Private video', 'Deleted video', '[Deleted Video]',
            'remix', 'nightcore', 'slowed', 'reverb', 'bass boosted',
            'trap remix', 'phonk', 'tiktok', 'shorts', 'meme',
            'funny', 'parody', 'karaoke', 'instrumental',
            'tutorial', 'how to', 'reaction', 'review',
            'vlog', 'gameplay', 'stream', 'compilation',
            '8D audio', 'speed up', 'sped up', 'chipmunk'
          ];
          
          const titleLower = title.toLowerCase();
          
          // Düşük kalite anahtar kelimeleri kontrol et
          for (const keyword of lowQualityKeywords) {
            if (titleLower.includes(keyword.toLowerCase())) {
              return false;
            }
          }
          
          // Çok kısa başlıkları filtrele
          if (title.length < 5) return false;
          
          // Sadece sayı/sembol olan başlıkları filtrele
          if (!/[a-zA-ZğüşıöçĞÜŞİÖÇ]/.test(title)) return false;
          
          return true;
        })
        .map((item: any, index: number) => {
          const snippet = item.snippet;
          const videoId = snippet.resourceId.videoId;
          
          // Başlık ve sanatçı bilgisini ayır
          let title = snippet.title;
          let artist = snippet.videoOwnerChannelTitle || 'Bilinmeyen Sanatçı';
          
          // Kanal adından gereksiz kısımları temizle
          artist = artist
            .replace(/ - Topic$/, '')
            .replace(/VEVO$/, '')
            .replace(/Official$/, '')
            .replace(/Music$/, '')
            .replace(/Records$/, '')
            .trim();
          
          // Başlıktan sanatçı adını çıkarmaya çalış
          const separators = [' - ', ': ', ' | ', ' – ', ' • ', ' ft. ', ' feat. '];
          for (const separator of separators) {
            if (title.includes(separator)) {
              const parts = title.split(separator);
              if (parts.length >= 2) {
                const potentialArtist = parts[0].trim();
                const potentialTitle = parts.slice(1).join(separator).trim();
                
                // Sanatçı adı makul uzunlukta ise kullan
                if (potentialArtist.length > 1 && potentialArtist.length < 50) {
                  artist = potentialArtist;
                  title = potentialTitle;
                }
                break;
              }
            }
          }

          // Başlıktan gereksiz kısımları temizle
          title = title
            .replace(/\(Official Video\)/gi, '')
            .replace(/\(Official Music Video\)/gi, '')
            .replace(/\(Official Audio\)/gi, '')
            .replace(/\(Lyric Video\)/gi, '')
            .replace(/\(Lyrics\)/gi, '')
            .replace(/\[Official Video\]/gi, '')
            .replace(/\[Official Music Video\]/gi, '')
            .replace(/\[Official Audio\]/gi, '')
            .replace(/\[Lyric Video\]/gi, '')
            .replace(/\[Lyrics\]/gi, '')
            .trim();

          // Thumbnail URL'sini al
          const thumbnail = snippet.thumbnails?.high?.url || 
                           snippet.thumbnails?.medium?.url || 
                           snippet.thumbnails?.default?.url || 
                           `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

          return {
            id: videoId,
            title: title,
            artist: artist,
            album: '',
            duration: '0:00', // YouTube API'den süre bilgisi almak için ek istek gerekir
            imageUrl: thumbnail,
            audioUrl: videoId,
            aiHint: 'song'
          };
        })
        .slice(0, 30); // En fazla 30 kaliteli şarkı

      const importedData: ImportedPlaylist = {
        title: playlistTitle,
        description: playlistDescription,
        songs: songs,
        thumbnail: playlistThumbnail
      };

      setImportedPlaylist(importedData);
      console.log(`✅ ${songs.length} şarkı başarıyla import edildi`);

    } catch (error: any) {
      console.error('❌ Playlist import hatası:', error);
      setError(error.message || 'Playlist import edilirken bir hata oluştu');
    } finally {
      setIsImporting(false);
    }
  };

  const savePlaylist = () => {
    if (!importedPlaylist) return;

    // Playlist'i localStorage'a kaydet
    const existingPlaylists = JSON.parse(localStorage.getItem('user-playlists') || '[]');
    const newPlaylist = {
      id: `imported_${Date.now()}`,
      title: importedPlaylist.title,
      description: importedPlaylist.description,
      imageUrl: importedPlaylist.thumbnail || 'https://placehold.co/300x300.png',
      songs: importedPlaylist.songs,
      createdAt: new Date().toISOString(),
      isImported: true,
      source: 'youtube'
    };

    existingPlaylists.push(newPlaylist);
    localStorage.setItem('user-playlists', JSON.stringify(existingPlaylists));

    // Başarı mesajı göster
    window.dispatchEvent(new CustomEvent('playlistImported', { 
      detail: { playlist: newPlaylist } 
    }));

    // Dialog'u kapat ve formu temizle
    setIsOpen(false);
    setPlaylistUrl('');
    setImportedPlaylist(null);
    setError('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2 bg-red-600 hover:bg-red-700">
          <Youtube className="h-4 w-4" />
          YouTube'dan İçe Aktar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Youtube className="h-5 w-5 text-red-600" />
            YouTube Playlist İçe Aktarma
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* URL Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">YouTube Playlist URL'si</label>
            <div className="flex gap-2">
              <Input
                placeholder="https://youtube.com/playlist?list=PLxxxxxx"
                value={playlistUrl}
                onChange={(e) => setPlaylistUrl(e.target.value)}
                disabled={isImporting}
              />
              <Button 
                onClick={importPlaylist}
                disabled={isImporting || !playlistUrl.trim()}
                className="flex items-center gap-2"
              >
                {isImporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                {isImporting ? 'İçe Aktarılıyor...' : 'İçe Aktar'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              YouTube playlist URL'sini buraya yapıştırın. Playlist'in herkese açık olması gerekir.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Import Progress */}
          {isImporting && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Playlist içe aktarılıyor, lütfen bekleyin...</span>
            </div>
          )}

          {/* Imported Playlist Preview */}
          {importedPlaylist && (
            <Card>
              <CardHeader>
                <div className="flex items-start gap-4">
                  {importedPlaylist.thumbnail && (
                    <img 
                      src={importedPlaylist.thumbnail} 
                      alt={importedPlaylist.title}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <CardTitle className="text-lg">{importedPlaylist.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {importedPlaylist.songs.length} şarkı
                    </p>
                    {importedPlaylist.description && (
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                        {importedPlaylist.description}
                      </p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {importedPlaylist.songs.slice(0, 10).map((song, index) => (
                    <div key={song.id} className="flex items-center gap-3 p-2 bg-secondary/30 rounded-lg">
                      <img 
                        src={song.imageUrl} 
                        alt={song.title}
                        className="w-10 h-10 rounded object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{song.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
                      </div>
                    </div>
                  ))}
                  {importedPlaylist.songs.length > 10 && (
                    <p className="text-xs text-muted-foreground text-center py-2">
                      +{importedPlaylist.songs.length - 10} şarkı daha...
                    </p>
                  )}
                </div>
                
                <div className="flex gap-2 mt-4">
                  <Button onClick={savePlaylist} className="flex-1 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Playlist'i Kaydet
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setImportedPlaylist(null);
                      setError('');
                    }}
                  >
                    İptal
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Nasıl kullanılır?</h4>
            <ol className="text-xs text-muted-foreground space-y-1">
              <li>1. YouTube'da istediğiniz playlist'i açın</li>
              <li>2. Tarayıcı adres çubuğundan URL'yi kopyalayın</li>
              <li>3. URL'yi yukarıdaki alana yapıştırın</li>
              <li>4. "İçe Aktar" butonuna tıklayın</li>
              <li>5. Playlist önizlemesini kontrol edin ve kaydedin</li>
            </ol>
            
            <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
              <strong>💡 Kalite İpucu:</strong> En iyi sonuçlar için resmi sanatçı kanallarından oluşturulan playlist'leri kullanın. 
              Remix, nightcore, slowed gibi düşük kalite içerikler otomatik olarak filtrelenir.
            </div>
            
            <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-700">
              <strong>⚠️ Not:</strong> YouTube API key olmadığında demo içerik gösterilir. 
              Gerçek playlist'ler için .env dosyasına YOUTUBE_API_KEY ekleyin.
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}