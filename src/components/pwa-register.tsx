"use client";

import { useEffect } from 'react';
import { registerServiceWorker } from '@/lib/pwa/register';

export function PWARegister() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      registerServiceWorker();
    }
  }, []);

  return null;
}
