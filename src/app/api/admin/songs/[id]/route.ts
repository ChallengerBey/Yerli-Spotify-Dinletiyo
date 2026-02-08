import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: song } = await supabase
      .from('songs')
      .select('*')
      .eq('id', params.id)
      .single();

    if (!song) {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 });
    }

    // Delete from storage
    if (song.file_url) {
      const fileName = song.file_url.split('/').pop();
      if (fileName) {
        await supabase.storage
          .from('songs')
          .remove([fileName]);
      }
    }

    // Delete from database
    const { error } = await supabase
      .from('songs')
      .delete()
      .eq('id', params.id);

    if (error) throw error;

    // Log the action
    await supabase
      .from('admin_logs')
      .insert({
        admin_id: user.id,
        action_type: 'delete_song',
        target_content_type: 'song',
        target_content_id: params.id,
        description: `Song deleted: ${song.title} by ${song.artist}`,
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting song:', error);
    return NextResponse.json({ error: 'Failed to delete song' }, { status: 500 });
  }
}
