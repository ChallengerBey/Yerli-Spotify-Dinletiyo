import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
    const hostId = request.nextUrl.searchParams.get('hostId');
    if (!hostId) return NextResponse.json({ error: 'HostId is required' }, { status: 400 });

    try {
        const { data, error } = await supabase
            .from('listening_sessions')
            .select('*')
            .eq('host_id', hostId)
            .single();

        if (error && error.code !== 'PGRST116') throw error;

        return NextResponse.json({ session: data });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { hostId, songId, songData, isPlaying, progressMs } = await request.json();

        const { data, error } = await supabase
            .from('listening_sessions')
            .upsert({
                host_id: hostId,
                song_id: songId,
                song_data: songData,
                is_playing: isPlaying,
                progress_ms: progressMs,
                last_updated_at: new Date().toISOString()
            }, { onConflict: 'host_id' })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, session: data });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    const hostId = request.nextUrl.searchParams.get('hostId');
    if (!hostId) return NextResponse.json({ error: 'HostId is required' }, { status: 400 });

    try {
        const { error } = await supabase
            .from('listening_sessions')
            .delete()
            .eq('host_id', hostId);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
