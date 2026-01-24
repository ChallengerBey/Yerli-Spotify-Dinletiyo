"use client";

import { useEffect, useState } from 'react';
import { UserSearch } from '@/components/social/user-search';
import { FriendList } from '@/components/social/friend-list';
import { UserDiscovery } from '@/components/social/user-discovery';
import { Users, Info, HandMetal } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface LoggedInUser {
    id: string;
    username: string;
}

export default function FriendsPage() {
    const [user, setUser] = useState<LoggedInUser | null>(null);

    useEffect(() => {
        const currentUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
        if (currentUser) {
            const userData = JSON.parse(currentUser);
            setUser({
                id: userData.id,
                username: userData.username
            });
        }
    }, []);

    if (!user) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                <p className="text-gray-400 font-medium animate-pulse">Yükleniyor...</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-10 pb-32 px-4">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-4">
                    <div className="p-4 rounded-3xl bg-red-500/10 border border-red-500/20 shadow-lg shadow-red-500/5">
                        <Users className="h-10 w-10 text-red-500" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-4xl font-black text-white tracking-tight">Arkadaşlar</h1>
                            <HandMetal className="h-6 w-6 text-red-500 animate-bounce" />
                        </div>
                        <p className="text-lg text-gray-400 font-medium">Yeni arkadaşlar bul ve beraber müzik dinle</p>
                    </div>
                </div>
            </div>

            <Alert className="bg-red-500/5 border-red-500/10 text-red-100 rounded-2xl p-4">
                <Info className="h-5 w-5 text-red-500" />
                <AlertTitle className="font-bold text-lg mb-1">Beraber Dinle Özelliği</AlertTitle>
                <AlertDescription className="text-gray-300">
                    Arkadaşlarının yanındaki <span className="text-red-400 font-bold">"Beraber Dinle"</span> butonuna tıklayarak onlarla aynı anda müzik dinleyebilirsin.
                </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sol Kolon: Keşfet */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-2xl">
                        <UserDiscovery currentUserId={user.id} />
                    </div>

                </div>

                {/* Sağ Kolon: Ara ve Liste */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold px-2 flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-red-500 rounded-full" />
                            Kullanıcı Ara
                        </h2>
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-2xl">
                            <UserSearch currentUserId={user.id} />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold px-2 flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-red-500 rounded-full" />
                            Arkadaş Listen
                        </h2>
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-2xl">
                            <FriendList currentUserId={user.id} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
