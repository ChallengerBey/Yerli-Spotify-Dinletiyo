"use client";

import { Sidebar } from '@/components/layout/sidebar';
import { Player } from '@/components/layout/player';

import AuthGuard from '@/components/auth-guard';
import { useEffect, useState } from 'react';

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userId, setUserId] = useState('1');

  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    if (currentUser) {
      try {
        const user = JSON.parse(currentUser);
        setUserId(user.id);
      } catch (e) {
        console.error('User parse error in Layout:', e);
      }
    }
  }, []);

  return (
    <AuthGuard>
      <div className="flex h-screen w-full">
        <Sidebar />
        <div className="flex flex-col flex-1 min-h-0">
          <main className="flex-1 overflow-y-auto p-8 lg:p-10 lg:pb-28 pb-32">
            {children}
          </main>
          <Player />
        </div>

      </div>
    </AuthGuard>
  );
}
