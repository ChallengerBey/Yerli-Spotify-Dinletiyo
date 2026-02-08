'use client';

import { useEffect } from 'react';

export default function OverlayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Body'ye tam ekran şeffaf arka plan uygula
    document.body.style.background = 'transparent';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.overflow = 'hidden';
    document.body.style.width = '100vw';
    document.body.style.height = '100vh';
    
    // HTML elementine de uygula
    document.documentElement.style.background = 'transparent';
    document.documentElement.style.margin = '0';
    document.documentElement.style.padding = '0';
    document.documentElement.style.width = '100vw';
    document.documentElement.style.height = '100vh';
    
    // Cleanup function
    return () => {
      document.body.style.background = '';
      document.body.style.margin = '';
      document.body.style.padding = '';
      document.body.style.overflow = '';
      document.body.style.width = '';
      document.body.style.height = '';
      
      document.documentElement.style.background = '';
      document.documentElement.style.margin = '';
      document.documentElement.style.padding = '';
      document.documentElement.style.width = '';
      document.documentElement.style.height = '';
    };
  }, []);

  return (
    <div className="w-screen h-screen bg-transparent overflow-hidden">
      {children}
    </div>
  );
}
