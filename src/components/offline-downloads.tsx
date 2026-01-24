'use client';

import { useState, useEffect } from 'react';
import { Download, Trash2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface Download {
  id: string;
  content_type: 'song' | 'podcast_episode' | 'playlist';
  content_id: string;
  content_data: {
    title: string;
    artist?: string;
    cover_url?: string;
  };
  file_size_bytes: number;
  download_quality: string;
  created_at: string;
  expires_at: string;
}

interface StorageQuota {
  total_quota_bytes: number;
  used_quota_bytes: number;
  available_bytes: number;
  usage_percentage: number;
}

export default function OfflineDownloads() {
  const [downloads, setDownloads] = useState<Download[]>([]);
  const [quota, setQuota] = useState<StorageQuota | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPanel, setShowPanel] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadDownloads();
    loadQuota();
  }, []);

  const loadDownloads = async () => {
    try {
      const response = await fetch('/api/offline-downloads');
      if (response.ok) {
        const data = await response.json();
        setDownloads(data);
      }
    } catch (error) {
      console.error('Error loading downloads:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadQuota = async () => {
    try {
      const response = await fetch('/api/offline-downloads/quota');
      if (response.ok) {
        const data = await response.json();
        setQuota(data);
      }
    } catch (error) {
      console.error('Error loading quota:', error);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const deleteDownload = async (id: string) => {
    try {
      const response = await fetch(`/api/offline-downloads/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setDownloads((prev) => prev.filter((d) => d.id !== id));
        await loadQuota();
        toast({
          title: 'Başarılı',
          description: 'İndirme silindi.',
        });
      }
    } catch (error) {
      console.error('Error deleting download:', error);
      toast({
        title: 'Hata',
        description: 'İndirme silinirken bir hata oluştu.',
        variant: 'destructive',
      });
    }
  };

  const downloadContent = async (content: any) => {
    try {
      const response = await fetch('/api/offline-downloads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content_type: 'song',
          content_id: content.id,
          content_data: {
            title: content.title,
            artist: content.artist,
            cover_url: content.cover_url,
          },
          file_size_bytes: content.file_size_bytes || 5000000,
          download_quality: 'high',
        }),
      });

      if (response.status === 413) {
        toast({
          title: 'Hata',
          description: 'Depolama alanınız dolu!',
          variant: 'destructive',
        });
        return;
      }

      if (response.ok) {
        await loadDownloads();
        await loadQuota();
        toast({
          title: 'Başarılı',
          description: 'İçerik indirildi.',
        });
      }
    } catch (error) {
      console.error('Error downloading content:', error);
      toast({
        title: 'Hata',
        description: 'İndirme sırasında bir hata oluştu.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="w-full">
      {/* Floating Button */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="fixed bottom-6 right-6 p-3 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg transition-colors z-40"
      >
        <Download className="w-6 h-6" />
      </button>

      {/* Offline Downloads Panel */}
      {showPanel && (
        <div className="fixed bottom-20 right-6 w-96 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50">
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-white font-semibold">Offline İndirmeler</h3>
            <p className="text-gray-400 text-sm">
              {downloads.length} içerik indirildi
            </p>
          </div>

          {/* Storage Quota */}
          {quota && (
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-300 text-sm font-medium">Depolama</span>
                <span className="text-gray-400 text-sm">
                  {formatBytes(quota.used_quota_bytes)} / {formatBytes(quota.total_quota_bytes)}
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    quota.usage_percentage > 80
                      ? 'bg-red-600'
                      : quota.usage_percentage > 50
                      ? 'bg-yellow-600'
                      : 'bg-green-600'
                  }`}
                  style={{ width: `${quota.usage_percentage}%` }}
                />
              </div>
              <p className="text-gray-500 text-xs mt-1">
                {quota.usage_percentage}% kullanıldı
              </p>
            </div>
          )}

          {/* Downloads List */}
          <div className="max-h-64 overflow-y-auto">
            {downloads.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <Download className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Henüz indirme yok</p>
              </div>
            ) : (
              downloads.map((download) => (
                <div
                  key={download.id}
                  className="p-4 border-b border-gray-700 hover:bg-gray-700/30 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    {download.content_data.cover_url && (
                      <img
                        src={download.content_data.cover_url}
                        alt={download.content_data.title}
                        className="w-10 h-10 rounded object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium truncate">
                        {download.content_data.title}
                      </h4>
                      {download.content_data.artist && (
                        <p className="text-gray-400 text-sm truncate">
                          {download.content_data.artist}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {download.download_quality}
                        </Badge>
                        <span className="text-gray-500 text-xs">
                          {formatBytes(download.file_size_bytes)}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-green-400 hover:text-green-300"
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteDownload(download.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-4 border-t border-gray-700">
            <Button variant="outline" className="w-full text-sm">
              Tüm İndirmeleri Yönet
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
