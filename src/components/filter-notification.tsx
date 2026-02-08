'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, X, CheckCircle, AlertTriangle } from 'lucide-react';

interface FilterNotificationProps {
  onClose?: () => void;
}

export function FilterNotification({ onClose }: FilterNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [filteredCount, setFilteredCount] = useState(0);

  useEffect(() => {
    // Filtreleme istatistiklerini localStorage'dan oku
    const stats = localStorage.getItem('filter-stats');
    if (stats) {
      const parsed = JSON.parse(stats);
      setFilteredCount(parsed.session_filtered || 0);
    }

    // Eğer bu oturumda reklam filtrelendiyse bildirimi göster
    if (filteredCount > 0) {
      setIsVisible(true);
      
      // 10 saniye sonra otomatik kapat
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [filteredCount]);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  if (!isVisible || filteredCount === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
      <Card className="w-80 bg-gradient-to-r from-green-900/90 to-blue-900/90 border-green-500/50 backdrop-blur-xl">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white text-sm">
                  Reklam Koruması Aktif
                </h3>
                <p className="text-xs text-gray-300 mt-1">
                  Bu oturumda <strong>{filteredCount}</strong> reklam videosu filtrelendi
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="bg-green-500/20 text-green-300 text-xs">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Korunuyorsun
                  </Badge>
                  <Badge variant="outline" className="border-yellow-500/50 text-yellow-300 text-xs">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    {filteredCount} Engellendi
                  </Badge>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-6 w-6 p-0 text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Filtreleme istatistiklerini güncelleme fonksiyonu
export function updateFilterStats(type: 'advertisement' | 'child_content' | 'suspicious_channel') {
  const stats = JSON.parse(localStorage.getItem('filter-stats') || '{}');
  
  stats.session_filtered = (stats.session_filtered || 0) + 1;
  stats.total_filtered = (stats.total_filtered || 0) + 1;
  stats[`${type}_filtered`] = (stats[`${type}_filtered`] || 0) + 1;
  stats.last_updated = new Date().toISOString();
  
  localStorage.setItem('filter-stats', JSON.stringify(stats));
  
  // Event gönder ki component güncellensin
  window.dispatchEvent(new CustomEvent('filterStatsUpdated', { detail: stats }));
}