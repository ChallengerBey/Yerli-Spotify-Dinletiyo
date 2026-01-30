"use client";

import { useState, useEffect } from "react";
import { Sparkles, UserPlus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface UserProfile {
    id: string;
    username: string;
    avatar_url: string;
}

export function UserDiscovery({ currentUserId }: { currentUserId: string }) {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());

    const fetchRandomUsers = async () => {
        if (!currentUserId || currentUserId === 'undefined') return;
        setLoading(true);
        try {
            // Get users who are NOT the current user and not already friends
            // For simplicity in this demo, we just get random users
            const { data: profiles, error } = await supabase
                .from('profiles')
                .select('id, username, avatar_url')
                .neq('id', currentUserId)
                .limit(10);

            if (error) throw error;

            // Shuffle and take 3
            const shuffled = (profiles || []).sort(() => 0.5 - Math.random());
            const filtered = shuffled.filter(u => u.id !== currentUserId).slice(0, 3);
            setUsers(filtered);
        } catch (error) {
            console.error("Discovery error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRandomUsers();
    }, [currentUserId]);

    const sendRequest = async (friendId: string) => {
        try {
            const res = await fetch("/api/friends", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "request", userId: currentUserId, friendId }),
            });
            if (res.ok) {
                setSentRequests(prev => new Set(prev).add(friendId));
                toast.success("İstek başarıyla gönderildi!", {
                    description: "Yeni bir arkadaş edinme yolundasın! 🚀"
                });
            }
        } catch (error) {
            console.error("Request error:", error);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-red-500" />
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Yeni Biriyle Tanış</h3>
                </div>
                <Button variant="ghost" size="icon" onClick={fetchRandomUsers} className="h-8 w-8 text-gray-500 hover:text-white">
                    <RefreshCw className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-3">
                {users.length > 0 ? users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 rounded-xl bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 transition-all group overflow-hidden">
                        <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
                            <div className="relative h-12 w-12 rounded-full overflow-hidden border-2 border-red-500/20 flex-shrink-0">
                                <Image
                                    src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                                    alt={user.username}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="font-semibold text-white truncate max-w-[60px] sm:max-w-none">{user.username}</p>
                                <p className="text-xs text-red-400/70 font-medium truncate">Tanışmak ister misin?</p>
                            </div>
                        </div>
                        <div className="flex-shrink-0">
                            {sentRequests.has(user.id) ? (
                                <span className="text-[10px] text-gray-500 font-medium px-2 italic">İstek Gönderildi</span>
                            ) : (
                                <Button size="sm" variant="ghost" onClick={() => sendRequest(user.id)} className="text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-full px-3 h-8">
                                    <UserPlus className="h-4 w-4 mr-1" />
                                    <span className="text-xs">Tanış</span>
                                </Button>
                            )}
                        </div>
                    </div>
                )) : !loading && (
                    <div className="text-center py-8 border border-dashed border-white/5 rounded-2xl">
                        <p className="text-xs text-gray-500">Şu an önerilecek yeni kimse yok.</p>
                        <p className="text-[10px] text-gray-700 mt-1">Herkesle zaten arkadaş olabilirsin!</p>
                    </div>
                )}
            </div>
        </div >
    );
}
