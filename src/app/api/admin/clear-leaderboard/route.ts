import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient();

    const { error } = await supabase
      .from('recently_played')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (error) {
      console.error('Error clearing leaderboard:', error);
      return NextResponse.json({ error: 'Failed to clear leaderboard' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Leaderboard cleared successfully' });

  } catch (error) {
    console.error('Error in clear leaderboard API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}