import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('queue')
      .select('*')
      .eq('user_id', user.id)
      .order('position', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ queue: data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { song_id, song_data, position } = body;

    if (!song_id || !song_data) {
      return NextResponse.json(
        { error: 'song_id and song_data are required' },
        { status: 400 }
      );
    }

    const { data: existingQueue } = await supabase
      .from('queue')
      .select('position')
      .eq('user_id', user.id)
      .order('position', { ascending: false })
      .limit(1);

    const nextPosition = position ?? (existingQueue && existingQueue.length > 0 
      ? existingQueue[0].position + 1 
      : 0);

    const { data, error } = await supabase
      .from('queue')
      .insert({
        user_id: user.id,
        song_id,
        song_data,
        position: nextPosition,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ queue_item: data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const queueId = searchParams.get('id');

    if (!queueId) {
      const { error } = await supabase
        .from('queue')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ message: 'Queue cleared' });
    }

    const { error } = await supabase
      .from('queue')
      .delete()
      .eq('id', queueId)
      .eq('user_id', user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Queue item removed' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { queue } = body;

    if (!queue || !Array.isArray(queue)) {
      return NextResponse.json(
        { error: 'queue array is required' },
        { status: 400 }
      );
    }

    await supabase
      .from('queue')
      .delete()
      .eq('user_id', user.id);

    const queueItems = queue.map((item, index) => ({
      user_id: user.id,
      song_id: item.song_id,
      song_data: item.song_data,
      position: index,
      is_playing: item.is_playing || false,
    }));

    const { data, error } = await supabase
      .from('queue')
      .insert(queueItems)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ queue: data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
