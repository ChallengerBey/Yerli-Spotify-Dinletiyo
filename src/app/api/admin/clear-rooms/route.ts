import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function DELETE() {
  try {
    const supabase = createClient();

    const { error } = await supabase
      .from('listening_rooms')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (error) {
      console.error('Error clearing rooms:', error);
      return NextResponse.json({ error: 'Failed to clear rooms' }, { status: 500 });
    }

    return NextResponse.json({ message: 'All rooms cleared successfully' });

  } catch (error) {
    console.error('Error in clear rooms API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}