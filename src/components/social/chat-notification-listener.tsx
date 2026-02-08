"use client";

import { useEffect } from 'react';
import { chatService } from '@/lib/chat-service';
import { toast } from 'sonner';

interface ChatNotificationListenerProps {
  currentUserId?: string;
  currentUserName?: string;
}

export function ChatNotificationListener({ currentUserId, currentUserName }: ChatNotificationListenerProps) {
  useEffect(() => {
    if (!currentUserId || !currentUserName) return;

    console.log(`🔔 ${currentUserName} global chat bildirimlerini dinlemeye başladı`);

    // Global bildirim dinleyicisi
    const handleGlobalNotification = (notification: any) => {
      console.log(`📨 Global bildirim alındı:`, notification);
      
      // Eğer başka bir chat modal açık değilse toast göster
      const activeChatModals = document.querySelectorAll('[role="dialog"]');
      if (activeChatModals.length === 0) {
        toast.info(`${notification.fromUserName} mesaj gönderdi!`, {
          description: notification.message.length > 50 
            ? notification.message.substring(0, 50) + '...' 
            : notification.message,
          action: {
            label: "Görüntüle",
            onClick: () => {
              // Burada arkadaş listesi sayfasına yönlendirebiliriz
              console.log('Mesajı görüntüle tıklandı');
            }
          }
        });
      }
    };

    chatService.addNotificationListener(currentUserId, handleGlobalNotification);

    return () => {
      chatService.removeNotificationListener(currentUserId);
      console.log(`🔕 ${currentUserName} global chat bildirimlerini dinlemeyi bıraktı`);
    };
  }, [currentUserId, currentUserName]);

  return null; // Bu bileşen UI render etmez
}