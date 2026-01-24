import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function getBearerToken(request: Request) {
  const auth = request.headers.get('authorization') || request.headers.get('Authorization');
  if (!auth) return null;
  const match = auth.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? null;
}

async function attachParticipantProfiles(supabase: any, room: any) {
  const participants = room?.room_participants || [];
  const userIds = Array.from(new Set(participants.map((p: any) => p.user_id).filter(Boolean)));
  if (userIds.length === 0) {
    return { ...room, room_participants: participants };
  }

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, username, avatar_url')
    .in('id', userIds);

  const profileById = new Map((profiles || []).map((p: any) => [p.id, p]));
  return {
    ...room,
    room_participants: participants.map((p: any) => ({
      ...p,
      profiles: profileById.get(p.user_id) || null,
    })),
  };
}

export async function GET(request: Request) {
  try {
    const token = getBearerToken(request);
    const supabase = token ? createClient(token) : createClient();
    const { data: { user } } = token ? await supabase.auth.getUser() : { data: { user: null } };
    const userId = user?.id || null;

    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('id');
    const roomCode = searchParams.get('code');

    if (roomId) {
      const { data, error } = await supabase
        .from('listening_rooms')
        .select(`
          *,
          room_participants (
            user_id,
            joined_at
          )
        `)
        .eq('id', roomId)
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      const room = await attachParticipantProfiles(supabase, data);
      return NextResponse.json({ room });
    }

    if (roomCode) {
      const { data, error } = await supabase
        .from('listening_rooms')
        .select(`
          *,
          room_participants (
            user_id,
            joined_at
          )
        `)
        .eq('room_code', roomCode)
        .single();

      if (error) {
        return NextResponse.json({ error: 'Room not found' }, { status: 404 });
      }

      const room = await attachParticipantProfiles(supabase, data);
      return NextResponse.json({ room });
    }

    const { data, error } = await supabase
      .from('listening_rooms')
      .select(`
        *,
        room_participants (
          user_id
        )
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const rooms = (data || [])
      .map((room: any) => {
        const participants = room?.room_participants || [];
        const count = Array.isArray(participants) ? participants.length : 0;
        
        return {
          ...room,
          room_participants: participants,
          participant_count: count,
        };
      });

    return NextResponse.json({ rooms });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const token = getBearerToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(token);
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { room_name, is_public = true, password, max_participants = 50 } = body;

    if (!room_name) {
      return NextResponse.json(
        { error: 'room_name is required' },
        { status: 400 }
      );
    }

    let roomCode = generateRoomCode();
    let attempts = 0;
    while (attempts < 10) {
      const { data: existing } = await supabase
        .from('listening_rooms')
        .select('id')
        .eq('room_code', roomCode)
        .single();

      if (!existing) break;
      roomCode = generateRoomCode();
      attempts++;
    }

    const { data: room, error } = await supabase
      .from('listening_rooms')
      .insert({
        host_id: user.id,
        room_name,
        room_code: roomCode,
        is_public,
        password,
        max_participants,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { error: participantError } = await supabase
      .from('room_participants')
      .insert({
        room_id: room.id,
        user_id: user.id,
      });

    if (participantError) {
      return NextResponse.json({ error: participantError.message }, { status: 500 });
    }

    return NextResponse.json({ room });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const token = getBearerToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(token);
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { room_id, current_song_id, current_song_data, is_playing, progress_ms } = body;

    if (!room_id) {
      return NextResponse.json(
        { error: 'room_id is required' },
        { status: 400 }
      );
    }

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (current_song_id !== undefined) updateData.current_song_id = current_song_id;
    if (current_song_data !== undefined) updateData.current_song_data = current_song_data;
    if (is_playing !== undefined) updateData.is_playing = is_playing;
    if (progress_ms !== undefined) updateData.progress_ms = progress_ms;

    const { data, error } = await supabase
      .from('listening_rooms')
      .update(updateData)
      .eq('id', room_id)
      .eq('host_id', user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ room: data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const token = getBearerToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(token);
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('id');

    if (!roomId) {
      return NextResponse.json(
        { error: 'room_id is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('listening_rooms')
      .delete()
      .eq('id', roomId)
      .eq('host_id', user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Room deleted' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
