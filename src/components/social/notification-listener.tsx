"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Bell, UserPlus, CheckCircle2, X } from "lucide-react";
import { toast } from "sonner"; // Assuming sonner is used, or we can build a custom one

export function NotificationListener({ currentUserId }: { currentUserId: string }) {
    useEffect(() => {
        if (!currentUserId || currentUserId === 'undefined') return;

        console.log("Starting notification listener for:", currentUserId);

        const channel = supabase
            .channel(`notifications-${currentUserId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${currentUserId}`
                },
                (payload) => {
                    const notification = payload.new;
                    showNotification(notification);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [currentUserId]);

    const showNotification = (notif: any) => {
        toast(notif.title, {
            description: notif.message,
            icon: notif.type === 'friend_request' ? <UserPlus className="h-4 w-4 text-red-500" /> : <CheckCircle2 className="h-4 w-4 text-green-500" />,
            duration: 5000,
            action: {
                label: "Gör",
                onClick: () => window.location.href = '/home/friends'
            }
        });
    };

    return null;
}
