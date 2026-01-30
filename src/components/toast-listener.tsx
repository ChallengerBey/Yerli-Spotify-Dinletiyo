'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';

export function ToastListener() {
  useEffect(() => {
    const handleShowToast = (event: any) => {
      const { message, type = 'success' } = event.detail;
      
      switch (type) {
        case 'success':
          toast.success(message);
          break;
        case 'error':
          toast.error(message);
          break;
        case 'info':
          toast.info(message);
          break;
        case 'warning':
          toast.warning(message);
          break;
        default:
          toast(message);
      }
    };

    window.addEventListener('showToast', handleShowToast);
    
    return () => {
      window.removeEventListener('showToast', handleShowToast);
    };
  }, []);

  return null;
}