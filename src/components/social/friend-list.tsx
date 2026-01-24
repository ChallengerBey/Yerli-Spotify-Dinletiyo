"use client";

import { useState, useEffect } from "react";
import { UserCheck, UserX, Music, List, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface Friend {
    friendshipId: string;
    id: string;
    username: string;
    avatar_url: string;
    status: 'pending' | 'accepted';
    isSentByMe: boolean;
}

export function FriendList({ currentUserId }: { currentUserId: string }) {
    const [friends, setFriends] = useState<Friend[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchFriends = async () => {
        if (!currentUserId || currentUserId === 'undefined') return;
        try {
            const res = await fetch(`/api/friends?userId=${currentUserId}`);
            const data = await res.json();
            setFriends(data.friends || []);
        } catch (error) {
            console.error("Fetch friends error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFriends();
        // Poll for updates (in real app, use Supabase Realtime)
        const interval = setInterval(fetchFriends, 10000);
        return () => clearInterval(interval);
    }, [currentUserId]);

    const respondRequest = async (friendshipId: string, action: 'accept' | 'reject') => {
        try {
            const res = await fetch("/api/friends", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action, friendshipId }),
            });
            if (res.ok) fetchFriends();
        } catch (error) {
            console.error("Response error:", error);
        }
    };

    const acceptedFriends = friends.filter(f => f.status === 'accepted');
    const incomingRequests = friends.filter(f => f.status === 'pending' && !f.isSentByMe);
    const outgoingRequests = friends.filter(f => f.status === 'pending' && f.isSentByMe);

    return (
        <div className="space-y-6">
            {incomingRequests.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider px-1 flex items-center gap-2">
                        Gelen İstekler
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white font-bold">{incomingRequests.length}</span>
                    </h3>
                    <div className="space-y-2">
                        {incomingRequests.map((request) => (
                            <div key={request.id} className="flex items-center justify-between p-3 rounded-xl bg-red-500/5 border border-red-500/20">
                                <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
                                    <div className="relative h-10 w-10 rounded-full overflow-hidden bg-gray-800 flex-shrink-0">
                                        <Image
                                            src={request.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${request.username}`}
                                            alt={request.username}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-medium text-white truncate max-w-[80px] sm:max-w-none">{request.username}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2 flex-shrink-0">
                                    <Button size="icon" variant="ghost" onClick={() => respondRequest(request.friendshipId, 'accept')} className="h-8 w-8 text-green-400 hover:text-green-300 hover:bg-green-500/10">
                                        <UserCheck className="h-5 w-5" />
                                    </Button>
                                    <Button size="icon" variant="ghost" onClick={() => respondRequest(request.friendshipId, 'reject')} className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10">
                                        <UserX className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {outgoingRequests.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider px-1">Bekleyen İsteklerin (Giden)</h3>
                    <div className="space-y-2">
                        {outgoingRequests.map((request) => (
                            <div key={request.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 opacity-80">
                                <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
                                    <div className="relative h-10 w-10 rounded-full overflow-hidden bg-gray-800 flex-shrink-0 grayscale">
                                        <Image
                                            src={request.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${request.username}`}
                                            alt={request.username}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-medium text-white/50 truncate max-w-[100px] sm:max-w-none">{request.username}</p>
                                        <p className="text-[10px] text-gray-500 italic">Onay bekleniyor...</p>
                                    </div>
                                </div>
                                <Button size="sm" variant="ghost" onClick={() => respondRequest(request.friendshipId, 'reject')} className="text-gray-500 hover:text-red-400 hover:bg-red-500/10 h-8">
                                    <span className="text-xs">İptal</span>
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider px-1">Arkadaşlar ({acceptedFriends.length})</h3>
                {loading ? (
                    <p className="text-sm text-gray-500 text-center py-4">Yükleniyor...</p>
                ) : acceptedFriends.length > 0 ? (
                    <div className="grid grid-cols-1 gap-2">
                        {acceptedFriends.map((friend) => (
                            <div key={friend.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group">
                                <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
                                    <div className="relative h-10 w-10 rounded-full overflow-hidden bg-gray-800 flex-shrink-0">
                                        <Image
                                            src={friend.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.username}`}
                                            alt={friend.username}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-medium text-white truncate max-w-[60px] sm:max-w-none">{friend.username}</p>
                                        <p className="text-xs text-gray-500">Çevrimiçi</p>
                                    </div>
                                </div>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                        window.dispatchEvent(new CustomEvent('joinSession', {
                                            detail: { hostId: friend.id }
                                        }));
                                    }}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-400 hover:bg-red-500/10 flex-shrink-0"
                                >
                                    <Music className="h-4 w-4 sm:mr-2" />
                                    <span className="hidden sm:inline">Beraber Dinle</span>
                                </Button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 rounded-2xl bg-white/5 border border-dashed border-white/10">
                        <User className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Henüz arkadaşın yok.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
