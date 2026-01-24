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

    const { data: rooms, error: roomsError } = await supabase
      .from('listening_rooms')
      .select('id, host_id')
      .eq('host_id', user.id);

    if (roomsError) {
      return NextResponse.json({ error: roomsError.message }, { status: 500 });
    }

    const roomIds = (rooms || []).map((r: any) => r.id).filter(Boolean);
    if (roomIds.length === 0) {
      return NextResponse.json({ deleted: 0 });
    }

    const { data: participants, error: participantsError } = await supabase
      .from('room_participants')
      .select('room_id, user_id')
      .in('room_id', roomIds);

    if (participantsError) {
      return NextResponse.json({ error: participantsError.message }, { status: 500 });
    }

    const byRoom = new Map<string, string[]>();
    for (const p of participants || []) {
      const rid = (p as any).room_id;
      const uid = (p as any).user_id;
      if (!rid || !uid) continue;
      const arr = byRoom.get(rid) || [];
      arr.push(uid);
      byRoom.set(rid, arr);
    }

    const deletableRoomIds = roomIds.filter((rid) => {
      const users = byRoom.get(rid) || [];
      const nonHostCount = users.filter((uid) => uid !== user.id).length;
      return nonHostCount === 0;
    });

    if (deletableRoomIds.length === 0) {
      return NextResponse.json({ deleted: 0 });
    }

    const { error: deleteError } = await supabase
      .from('listening_rooms')
      .delete()
      .in('id', deletableRoomIds);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ deleted: deletableRoomIds.length });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
