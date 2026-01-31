
export interface User {
  id: string;
  name: string;
  avatar: string;
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
