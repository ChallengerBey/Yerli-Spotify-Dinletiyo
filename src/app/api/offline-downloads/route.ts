import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  try {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('offline_downloads')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching downloads:', error);
    return NextResponse.json({ error: 'Failed to fetch downloads' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      content_type,
      content_id,
      content_data,
      file_size_bytes,
      download_quality,
    } = await request.json();

    // Check storage quota
    const { data: quota } = await supabase
      .from('user_storage_quota')
      .select('used_quota_bytes, total_quota_bytes')
      .eq('user_id', user.id)
      .single();

    if (quota) {
      const newUsage = (quota.used_quota_bytes || 0) + file_size_bytes;
      if (newUsage > quota.total_quota_bytes) {
        return NextResponse.json(
          { error: 'Storage quota exceeded' },
          { status: 413 }
        );
      }
    }

    // Calculate expiration (30 days for temporary storage)
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('offline_downloads')
      .insert({
        user_id: user.id,
        content_type,
        content_id,
        content_data,
        file_size_bytes,
        download_quality,
        expires_at: expiresAt,
      })
      .select();

    if (error) throw error;

    // Update storage quota
    if (quota) {
      await supabase
        .from('user_storage_quota')
        .update({
          used_quota_bytes: (quota.used_quota_bytes || 0) + file_size_bytes,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);
    }

    return NextResponse.json(data?.[0]);
  } catch (error) {
    console.error('Error creating download:', error);
    return NextResponse.json({ error: 'Failed to create download' }, { status: 500 });
  }
}
