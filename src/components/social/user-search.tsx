"use client";

import { useState, useEffect } from "react";
import { Search, UserPlus, Check, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { toast } from "sonner";

interface UserProfile {
    id: string;
    username: string;
    avatar_url: string;
    friendshipStatus?: 'pending' | 'accepted';
    isSentByMe?: boolean;
}

export function UserSearch({ currentUserId }: { currentUserId: string }) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(false);
    const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());

    const searchUsers = async (q: string) => {
        if (!currentUserId || currentUserId === 'undefined' || q.length < 3) {
            setResults([]);
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`/api/users?q=${encodeURIComponent(q)}&userId=${currentUserId}`);
            const data = await res.json();
            setResults(data.users.filter((u: UserProfile) => u.id !== currentUserId));
        } catch (error) {
            console.error("Search error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => searchUsers(query), 500);
        return () => clearTimeout(timer);
    }, [query]);

    const sendRequest = async (friendId: string) => {
        try {
            const res = await fetch("/api/friends", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "request", userId: currentUserId, friendId }),
            });
            const data = await res.json();
            if (res.ok) {
                setSentRequests(prev => new Set(prev).add(friendId));
                toast.success("Arkadaşlık isteği gönderildi!", {
                    description: "İsteğin karşı tarafa iletildi."
                });
            }
        } catch (error) {
            console.error("Request error:", error);
        }
    };

    return (
        <div className="space-y-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                    placeholder="Kullanıcı ara..."
                    className="pl-10 bg-white/5 border-white/10"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {loading && <p className="text-sm text-gray-400 text-center py-4">Aranıyor...</p>}
                {results.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors overflow-hidden">
                        <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
                            <div className="relative h-10 w-10 rounded-full overflow-hidden bg-gray-800 flex-shrink-0">
                                <Image
                                    src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                                    alt={user.username}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="min-w-0 flex-1">
                                <span className="font-medium text-white truncate block max-w-[40px] sm:max-w-none">{user.username}</span>
                            </div>
                        </div>
                        <div className="flex-shrink-0">
                            {user.friendshipStatus === 'accepted' ? (
                                <span className="text-[10px] text-green-500 font-bold px-2 italic">Arkadaş</span>
                            ) : (user.friendshipStatus === 'pending' || sentRequests.has(user.id)) ? (
                                <div className="flex items-center gap-1 text-gray-500 bg-white/5 py-1 px-2 rounded-md">
                                    <Clock className="h-3 w-3" />
                                    <span className="text-[10px] font-medium">{user.isSentByMe ? 'Bekliyor' : 'İstek Var'}</span>
                                </div>
                            ) : (
                                <Button variant="ghost" size="sm" onClick={() => sendRequest(user.id)} className="text-red-500 hover:text-red-400 hover:bg-red-500/10 h-8 px-3">
                                    <UserPlus className="h-4 w-4 mr-1" />
                                    <span className="text-xs">Ekle</span>
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
                {query.length >= 3 && results.length === 0 && !loading && (
                    <p className="text-sm text-gray-400 text-center py-4">Kullanıcı bulunamadı.</p>
                )}
            </div>
        </div>
    );
}
