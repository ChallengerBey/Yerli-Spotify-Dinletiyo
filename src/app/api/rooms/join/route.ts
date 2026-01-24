import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

function getBearerToken(request: Request) {
  const auth = request.headers.get('authorization') || request.headers.get('Authorization');
  if (!auth) return null;
  const match = auth.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? null;
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
    const { room_code, password } = body;

    if (!room_code) {
      return NextResponse.json(
        { error: 'room_code is required' },
        { status: 400 }
      );
    }

    const { data: room, error: roomError } = await supabase
      .from('listening_rooms')
      .select('*')
      .eq('room_code', room_code.toUpperCase())
      .single();

    if (roomError || !room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    if (room.password && room.password !== password) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 403 });
    }

    const { data: participantCount } = await supabase
      .from('room_participants')
      .select('id', { count: 'exact' })
      .eq('room_id', room.id);

    const count = participantCount?.length || 0;

    if (count >= room.max_participants) {
      return NextResponse.json({ error: 'Room is full' }, { status: 403 });
    }

    const { error: joinError } = await supabase
      .from('room_participants')
      .insert({
        room_id: room.id,
        user_id: user.id,
      });

    if (joinError) {
      if (joinError.code === '23505') {
        return NextResponse.json({ error: 'Already in room' }, { status: 400 });
      }
      return NextResponse.json({ error: joinError.message }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Joined room successfully',
      room_id: room.id 
    });
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
    const roomId = searchParams.get('room_id');

    if (!roomId) {
      return NextResponse.json(
        { error: 'room_id is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('room_participants')
      .delete()
      .eq('room_id', roomId)
      .eq('user_id', user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: remainingParticipants, error: remainingError } = await supabase
      .from('room_participants')
      .select('user_id')
      .eq('room_id', roomId);

    if (!remainingError) {
      const remaining = remainingParticipants || [];
      if (remaining.length === 0) {
        await supabase
          .from('listening_rooms')
          .delete()
          .eq('id', roomId);
      }
    }

    return NextResponse.json({ message: 'Left room successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
