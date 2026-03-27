'use client';

import { useEffect, useState } from 'react';

export function useSocket() {
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    // Socket altyapısı henüz yoksa "no-op" implementasyon (prod'da gürültü yapmasın)
    const noopSocket = {
      emit: (event: string, data?: any) => {
        if (process.env.NODE_ENV === 'development') console.log('socket.emit', event, data);
      },
      on: (event: string, callback: Function) => {
        if (process.env.NODE_ENV === 'development') console.log('socket.on', event);
      },
      disconnect: () => {
        if (process.env.NODE_ENV === 'development') console.log('socket.disconnect');
      }
    };
    
    setSocket(noopSocket);

    // Kullanıcı giriş bilgisini varsa ilet (ileride gerçek socket'e taşınacak)
    const loggedUser = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
    if (loggedUser.id) {
      noopSocket.emit('user-login', loggedUser);
    }

    return () => {
      noopSocket.disconnect();
    };
  }, []);

  return socket;
}