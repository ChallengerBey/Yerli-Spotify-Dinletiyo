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

    const { data: download } = await supabase
      .from('offline_downloads')
      .select('file_size_bytes')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (!download) {
      return NextResponse.json({ error: 'Download not found' }, { status: 404 });
    }

    // Delete the download record
    const { error } = await supabase
      .from('offline_downloads')
      .delete()
      .eq('id', params.id);

    if (error) throw error;

    // Update storage quota
    const { data: quota } = await supabase
      .from('user_storage_quota')
      .select('used_quota_bytes')
      .eq('user_id', user.id)
      .single();

    if (quota) {
      const newUsage = Math.max(0, (quota.used_quota_bytes || 0) - download.file_size_bytes);
      await supabase
        .from('user_storage_quota')
        .update({
          used_quota_bytes: newUsage,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting download:', error);
    return NextResponse.json({ error: 'Failed to delete download' }, { status: 500 });
  }
}
