'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export function AnnouncementBanner() {
  const [announcement, setAnnouncement] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const checkAnnouncements = async () => {
      try {
        // 1) Önce site-data.json üzerinden banner kontrol et (admin panelden güncellenir)
        const siteRes = await fetch('/api/site-data', { cache: 'no-store' });
        const siteData = await siteRes.json().catch(() => null);
        const banner = siteData?.json?.announcementBanner;
        if (banner?.enabled && (banner.title || banner.content)) {
          setAnnouncement({ title: banner.title || 'Duyuru', content: banner.content || '' });
          return;
        }

        // 2) Sonra DB duyurularını dene
        const response = await fetch('/api/announcements');
        const data = await response.json();
        if (data.success && data.announcements.length > 0) {
          setAnnouncement(data.announcements[0]);
        } else {
          setAnnouncement(null);
        }
      } catch (error) {
        console.error('Duyuru kontrolü hatası:', error);
      }
    };

    checkAnnouncements();
    
    // Her 30 saniyede bir kontrol et
    const interval = setInterval(checkAnnouncements, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!announcement || !isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-blue-600 text-white px-4 py-3 shadow-lg">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <span className="text-lg">📢</span>
          <div>
            <span className="font-semibold">{announcement.title}</span>
            <span className="ml-2">{announcement.content}</span>
          </div>
        </div>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-white hover:text-gray-200 p-1"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}