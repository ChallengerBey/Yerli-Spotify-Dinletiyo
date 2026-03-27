import { Message } from '@/types/social';
import { toast } from 'sonner';

interface ChatNotification {
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  message: string;
  timestamp: number;
}

class ChatService {
  private notifications: ChatNotification[] = [];
  private listeners: Map<string, (notification: ChatNotification) => void> = new Map();

  // Mesaj gönder ve karşı tarafa bildirim yap
  sendMessage(fromUserId: string, fromUserName: string, toUserId: string, message: string) {
    const notification: ChatNotification = {
      fromUserId,
      fromUserName,
      toUserId,
      message,
      timestamp: Date.now()
    };

    // Bildirimi kaydet
    this.notifications.push(notification);
    
    // LocalStorage'a kaydet
    const existingNotifications = JSON.parse(localStorage.getItem('chat_notifications') || '[]');
    existingNotifications.push(notification);
    localStorage.setItem('chat_notifications', JSON.stringify(existingNotifications));

    // Eğer karşı taraf dinliyorsa bildirim gönder
    const listener = this.listeners.get(toUserId);
    if (listener) {
      listener(notification);
    }

    console.log(`📨 Mesaj gönderildi: ${fromUserName} → ${toUserId}: "${message}"`);
  }

  // Kullanıcı için bildirim dinleyicisi ekle
  addNotificationListener(userId: string, callback: (notification: ChatNotification) => void) {
    this.listeners.set(userId, callback);
    console.log(`🔔 ${userId} bildirim dinlemeye başladı`);

    // Bekleyen bildirimleri kontrol et
    this.checkPendingNotifications(userId);
  }

  // Bildirim dinleyicisini kaldır
  removeNotificationListener(userId: string) {
    this.listeners.delete(userId);
    console.log(`🔕 ${userId} bildirim dinlemeyi bıraktı`);
  }

  // Bekleyen bildirimleri kontrol et
  private checkPendingNotifications(userId: string) {
    const existingNotifications = JSON.parse(localStorage.getItem('chat_notifications') || '[]');
    const userNotifications = existingNotifications.filter((n: ChatNotification) => 
      n.toUserId === userId && Date.now() - n.timestamp < 300000 // Son 5 dakika
    );

    userNotifications.forEach((notification: ChatNotification) => {
      const listener = this.listeners.get(userId);
      if (listener) {
        setTimeout(() => listener(notification), 500);
      }
    });
  }

  // Akıllı cevap üret
  generateSmartResponse(incomingMessage: string, fromUserName: string): string {
    const message = incomingMessage.toLowerCase();
    
    // Müzik ile ilgili cevaplar
    if (message.includes('müzik') || message.includes('şarkı') || message.includes('playlist')) {
      const musicResponses = [
        `Müzik konuşmak harika! Ben son zamanlarda indie rock dinliyorum 🎸`,
        `Playlist'im çok karışık, her türden var. Sen ne dinliyorsun? 🎵`,
        `Yeni keşfettiğim bir sanatçı var, çok beğeneceksin! 🎤`,
        `Bu akşam beraber müzik dinleyelim mi? 🎧`,
        `Spotify'da harika bir playlist buldum, paylaşayım mı? 📱`
      ];
      return musicResponses[Math.floor(Math.random() * musicResponses.length)];
    }

    // Selamlaşma cevapları
    if (message.includes('merhaba') || message.includes('selam') || message.includes('hey')) {
      const greetingResponses = [
        `Merhaba ${fromUserName}! Nasılsın? 😊`,
        `Selam! Bugün nasıl geçiyor? ✨`,
        `Hey! Seni görmek güzel 👋`,
        `Merhaba! Ne yapıyorsun? 🤔`,
        `Selam ${fromUserName}! Müzik dinliyor musun? 🎵`
      ];
      return greetingResponses[Math.floor(Math.random() * greetingResponses.length)];
    }

    // Soru cevapları
    if (message.includes('nasıl') || message.includes('ne yapıyorsun') || message.includes('naber')) {
      const questionResponses = [
        `İyiyim, teşekkürler! Sen nasılsın? 😄`,
        `Müzik dinliyordum, sen ne yapıyorsun? 🎧`,
        `Harika! Yeni şarkılar keşfediyorum 🎵`,
        `İyi, biraz dinleniyorum. Sen nasılsın? ☕`,
        `Süper! Bugün güzel bir gün 🌟`
      ];
      return questionResponses[Math.floor(Math.random() * questionResponses.length)];
    }

    // Genel cevaplar
    const generalResponses = [
      `Çok ilginç! Anlat bakalım 🤔`,
      `Harika! Ben de öyle düşünüyorum 👍`,
      `Gerçekten mi? Çok güzel! ✨`,
      `Anladım, mantıklı 💭`,
      `Kesinlikle katılıyorum! 💯`,
      `Bu konuda haklısın 👌`,
      `Çok güzel bir fikir! 💡`,
      `Bence de öyle 😊`,
      `İlginç bir bakış açısı 🎯`,
      `Tam olarak! 🎉`
    ];

    return generalResponses[Math.floor(Math.random() * generalResponses.length)];
  }

  // Bildirimleri temizle
  clearNotifications(userId: string) {
    const existingNotifications = JSON.parse(localStorage.getItem('chat_notifications') || '[]');
    const filteredNotifications = existingNotifications.filter((n: ChatNotification) => 
      n.toUserId !== userId
    );
    localStorage.setItem('chat_notifications', JSON.stringify(filteredNotifications));
  }
}

export const chatService = new ChatService();