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
      .from('user_storage_quota')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) throw error;

    return NextResponse.json({
      total_quota_bytes: data?.total_quota_bytes || 5368709120, // 5GB
      used_quota_bytes: data?.used_quota_bytes || 0,
      available_bytes: (data?.total_quota_bytes || 5368709120) - (data?.used_quota_bytes || 0),
      usage_percentage: Math.round(
        ((data?.used_quota_bytes || 0) / (data?.total_quota_bytes || 5368709120)) * 100
      ),
    });
  } catch (error) {
    console.error('Error fetching quota:', error);
    return NextResponse.json({ error: 'Failed to fetch quota' }, { status: 500 });
  }
}
