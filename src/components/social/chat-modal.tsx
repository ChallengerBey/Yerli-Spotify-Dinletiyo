"use client";

import React, { useState, useEffect, useRef } from 'react';
import { SocialUser, Message } from '@/types/social';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Send, X } from 'lucide-react';
import Image from 'next/image';
import { chatService } from '@/lib/chat-service';
import { toast } from 'sonner';

interface ChatModalProps {
  friend: SocialUser;
  currentUserId?: string;
  currentUserName?: string;
  onClose: () => void;
}

export function ChatModal({ friend, currentUserId, currentUserName, onClose }: ChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Load existing messages from localStorage
    const chatKey = `chat_${[currentUserId, friend.id].sort().join('_')}`;
    const savedMessages = localStorage.getItem(chatKey);
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }

    // Bildirim dinleyicisi ekle
    if (currentUserId) {
      chatService.addNotificationListener(currentUserId, handleIncomingMessage);
    }

    return () => {
      // Cleanup: bildirim dinleyicisini kaldır
      if (currentUserId) {
        chatService.removeNotificationListener(currentUserId);
      }
    };
  }, [currentUserId, friend.id]);

  const handleIncomingMessage = (notification: any) => {
    // Sadece bu arkadaştan gelen mesajları işle
    if (notification.fromUserId === friend.id) {
      console.log(`📨 ${friend.name}'den mesaj geldi:`, notification.message);
      
      // Toast bildirimi göster
      toast.success(`${friend.name} mesaj gönderdi!`, {
        description: notification.message.length > 50 
          ? notification.message.substring(0, 50) + '...' 
          : notification.message
      });

      // Mesajı chat'e ekle
      const incomingMessage: Message = {
        id: Date.now().toString(),
        senderId: friend.id,
        text: notification.message,
        timestamp: notification.timestamp
      };

      setMessages(prev => {
        const updated = [...prev, incomingMessage];
        saveMessages(updated);
        return updated;
      });

      // Otomatik cevap kaldırıldı - sadece bildirim
      console.log(`✅ ${friend.name}'den gelen mesaj işlendi, otomatik cevap yok`);
    }
  };

  const sendAutoResponse = (incomingMessage: string) => {
    if (!currentUserId || !currentUserName) return;

    const response = chatService.generateSmartResponse(incomingMessage, currentUserName);
    
    const responseMessage: Message = {
      id: (Date.now() + 1).toString(),
      senderId: friend.id,
      text: response,
      timestamp: Date.now()
    };

    setMessages(prev => {
      const updated = [...prev, responseMessage];
      saveMessages(updated);
      return updated;
    });

    console.log(`🤖 ${friend.name} otomatik cevap verdi: "${response}"`);
  };

  const saveMessages = (newMessages: Message[]) => {
    const chatKey = `chat_${[currentUserId, friend.id].sort().join('_')}`;
    localStorage.setItem(chatKey, JSON.stringify(newMessages));
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUserId || !currentUserName) return;

    setSending(true);
    const message: Message = {
      id: Date.now().toString(),
      senderId: currentUserId,
      text: newMessage.trim(),
      timestamp: Date.now()
    };

    const updatedMessages = [...messages, message];
    setMessages(updatedMessages);
    saveMessages(updatedMessages);

    // Karşı tarafa bildirim gönder
    chatService.sendMessage(
      currentUserId,
      currentUserName,
      friend.id,
      newMessage.trim()
    );

    setNewMessage('');
    setSending(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="relative h-10 w-10 rounded-full overflow-hidden">
              <Image
                src={friend.avatar}
                alt={friend.name}
                fill
                className="object-cover"
              />
              <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-zinc-900 ${
                friend.status === 'online' ? 'bg-green-500' : 'bg-zinc-600'
              }`} />
            </div>
            <div>
              <div className="text-white font-semibold">{friend.name}</div>
              <div className="text-xs text-zinc-500">
                {friend.status === 'online' ? 'Çevrimiçi' : 'Çevrimdışı'}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-96">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-950/50 rounded-lg">
            {messages.length === 0 ? (
              <div className="text-center text-zinc-500 text-sm py-8">
                Henüz mesaj yok. İlk mesajı sen gönder! 👋
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                      message.senderId === currentUserId
                        ? 'bg-red-500 text-white'
                        : 'bg-zinc-800 text-zinc-200'
                    }`}
                  >
                    <div>{message.text}</div>
                    <div className={`text-xs mt-1 ${
                      message.senderId === currentUserId ? 'text-red-200' : 'text-zinc-500'
                    }`}>
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="flex gap-2 mt-4">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Mesajını yaz..."
              className="flex-1 bg-zinc-800 border-zinc-700 focus:border-red-500/50"
              disabled={sending}
            />
            <Button
              onClick={sendMessage}
              disabled={!newMessage.trim() || sending}
              size="icon"
              className="bg-red-500 hover:bg-red-600"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}