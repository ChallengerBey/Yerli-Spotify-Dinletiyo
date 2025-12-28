'use client';

import { useState, useEffect } from 'react';

export function MaintenanceBanner() {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);

  useEffect(() => {
    const checkMaintenanceMode = async () => {
      try {
        const response = await fetch('/api/maintenance');
        const data = await response.json();
        if (data.success) {
          setIsMaintenanceMode(data.maintenanceMode);
        }
      } catch (error) {
        console.error('Bakım modu kontrolü hatası:', error);
      }
    };

    checkMaintenanceMode();
    
    // Her 10 saniyede bir kontrol et
    const interval = setInterval(checkMaintenanceMode, 10000);
    return () => clearInterval(interval);
  }, []);

  if (!isMaintenanceMode) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-600 text-black px-4 py-2 text-center font-medium shadow-lg">
      <div className="flex items-center justify-center gap-2">
        <span className="text-lg">🔧</span>
        <span>BAKIM MODU AKTİF - En kısa sürede açılacağız. Anlayışınız için teşekkürler.</span>
        <span className="text-lg">🔧</span>
      </div>
    </div>
  );
}