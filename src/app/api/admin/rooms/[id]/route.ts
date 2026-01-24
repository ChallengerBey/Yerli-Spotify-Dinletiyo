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

    // Delete room
    const { error } = await supabase
      .from('listening_rooms')
      .delete()
      .eq('id', params.id);

    if (error) throw error;

    // Log the action
    await supabase
      .from('admin_logs')
      .insert({
        admin_id: user.id,
        action_type: 'system_maintenance',
        description: `Listening room deleted: ${params.id}`,
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting room:', error);
    return NextResponse.json({ error: 'Failed to delete room' }, { status: 500 });
  }
}
