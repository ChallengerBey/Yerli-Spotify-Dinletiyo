export interface SocialUser {
  id: string;
  name: string;
  username?: string;
  avatar: string;
  avatar_url?: string;
  status: 'online' | 'offline';
  bio?: string;
  isFriend?: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
}

export interface ChatSession {
  userId: string;
  messages: Message[];
}