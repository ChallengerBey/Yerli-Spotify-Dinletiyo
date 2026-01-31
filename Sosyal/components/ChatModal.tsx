
import React, { useState, useEffect, useRef } from 'react';
import { User, Message } from '../types';
import { geminiService } from '../services/geminiService';

interface ChatModalProps {
  friend: User;
  onClose: () => void;
}

const ChatModal: React.FC<ChatModalProps> = ({ friend, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      senderId: 'me',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const history = messages.map(m => ({
      text: m.text,
      sender: m.senderId === 'me' ? 'user' as const : 'friend' as const
    }));
    history.push({ text: input, sender: 'user' });

    const aiResponse = await geminiService.chatWithFriend(friend.name, history);
    
    const friendMsg: Message = {
      id: (Date.now() + 1).toString(),
      senderId: friend.id,
      text: aiResponse,
      timestamp: Date.now()
    };

    setIsTyping(false);
    setMessages(prev => [...prev, friendMsg]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-lg shadow-2xl flex flex-col max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={friend.avatar} className="w-10 h-10 rounded-full border border-zinc-700" alt="" />
            <div>
              <div className="font-bold text-white">{friend.name}</div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">MESAJLAŞMA</div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && (
             <div className="text-center text-zinc-600 py-10 italic text-sm">
               Sohbeti başlatmak için bir şeyler yaz...
             </div>
          )}
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.senderId === 'me' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                msg.senderId === 'me' 
                ? 'bg-red-500 text-white rounded-tr-none' 
                : 'bg-zinc-800 text-zinc-300 rounded-tl-none'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-zinc-800 text-zinc-500 px-4 py-2 rounded-2xl rounded-tl-none text-xs flex gap-1 items-center">
                <span>{friend.name} yazıyor</span>
                <span className="flex gap-0.5">
                  <span className="w-1 h-1 bg-zinc-600 rounded-full animate-bounce"></span>
                  <span className="w-1 h-1 bg-zinc-600 rounded-full animate-bounce delay-75"></span>
                  <span className="w-1 h-1 bg-zinc-600 rounded-full animate-bounce delay-150"></span>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-zinc-800 bg-zinc-900/50">
          <div className="flex gap-2">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              type="text" 
              placeholder="Bir mesaj yaz..." 
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2 text-zinc-300 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
            <button 
              onClick={handleSend}
              className="bg-red-500 text-white p-2 rounded-xl hover:bg-red-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;
