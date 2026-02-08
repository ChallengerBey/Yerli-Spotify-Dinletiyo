import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
    const userId = request.nextUrl.searchParams.get('userId');
    if (!userId || userId === 'undefined') return NextResponse.json({ error: 'Valid UserId is required' }, { status: 400 });

    try {
        // Get both sent and received friendships
        const { data: friendships, error } = await supabase
            .from('friendships')
            .select(`
                id,
                status,
                user_id,
                friend_id
            `)
            .or(`user_id.eq.${userId},friend_id.eq.${userId}`);

        if (error) throw error;

        // Fetch profiles for all unique IDs involved
        const allUserIds = Array.from(new Set(friendships.flatMap(f => [f.user_id, f.friend_id])));
        const { data: profiles, error: profileError } = await supabase
            .from('profiles')
            .select('id, username, avatar_url')
            .in('id', allUserIds);

        if (profileError) throw profileError;

        const profileMap = new Map(profiles.map(p => [p.id, p]));

        const formattedFriends = friendships.map((f: any) => {
            const isSentByMe = f.user_id === userId;
            const otherUserId = isSentByMe ? f.friend_id : f.user_id;
            const profile = profileMap.get(otherUserId) || { id: otherUserId, username: 'Bilinmeyen Kullanıcı', avatar_url: null };

            return {
                friendshipId: f.id,
                status: f.status,
                isSentByMe,
                ...profile
            };
        });

        return NextResponse.json({ friends: formattedFriends });
    } catch (error: any) {
        console.error('Friend GET Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { action, userId, friendId, friendshipId } = await request.json();

        if (action === 'request') {
            // Check if there is already a friendship record in ANY direction
            const { data: existing, error: checkError } = await supabase
                .from('friendships')
                .select('*')
                .or(`and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`)
                .maybeSingle();

            if (checkError) throw checkError;

            if (existing) {
                // If the other user already sent a request to me, accept it automatically
                if (existing.user_id === friendId && existing.status === 'pending') {
                    const { error: updateError } = await supabase
                        .from('friendships')
                        .update({ status: 'accepted' })
                        .eq('id', existing.id);
                    if (updateError) throw updateError;
                    return NextResponse.json({ success: true, friendship: { ...existing, status: 'accepted' }, autoAccepted: true });
                }

                // If it's already accepted or I already sent it, do nothing or return existing
                return NextResponse.json({ success: true, friendship: existing, message: 'Already exists' });
            }

            // Normal insert
            const { data, error } = await supabase
                .from('friendships')
                .insert({ user_id: userId, friend_id: friendId, status: 'pending' })
                .select()
                .single();
            if (error) throw error;
            return NextResponse.json({ success: true, friendship: data });
        }

        if (action === 'accept') {
            const { error } = await supabase
                .from('friendships')
                .update({ status: 'accepted' })
                .eq('id', friendshipId);
            if (error) throw error;
            return NextResponse.json({ success: true });
        }

        if (action === 'reject' || action === 'remove') {
            const { error } = await supabase
                .from('friendships')
                .delete()
                .eq('id', friendshipId);
            if (error) throw error;
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error: any) {
        console.error('Friend API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
