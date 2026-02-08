'use client';

import { useEffect, useState } from 'react';

// Socket.io olmadan mock socket hook
export function useSocket() {
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    // Mock socket instance
    const mockSocket = {
      emit: (event: string, data?: any) => {
        console.log('Mock socket emit:', event, data);
      },
      on: (event: string, callback: Function) => {
        console.log('Mock socket on:', event);
      },
      disconnect: () => {
        console.log('Mock socket disconnect');
      }
    };
    
    setSocket(mockSocket);

    // Kullanıcı giriş bilgilerini mock gönder
    const loggedUser = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
    if (loggedUser.id) {
      mockSocket.emit('user-login', loggedUser);
    }

    return () => {
      mockSocket.disconnect();
    };
  }, []);

  return socket;
}