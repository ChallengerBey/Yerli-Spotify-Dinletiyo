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
    const { action, ip, reason } = await request.json();
    
    // Check action için token gerekmez
    if (action === 'check') {
      if (!ip) {
        return NextResponse.json({ error: 'IP address is required' }, { status: 400 });
      }
      
      const supabase = createClient();
      const { data, error } = await supabase
        .from('ip_bans')
        .select('id')
        .eq('ip_address', ip)
        .single();
      
      const isBanned = !error && data;
      
      return NextResponse.json({ 
        banned: isBanned,
        ip: ip
      });
    }

    // Ban/unban için token gerekli
    const token = getBearerToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseWithAuth = createClient(token);
    const { data: { user }, error: userError } = await supabaseWithAuth.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (action === 'ban') {
      if (!ip) {
        return NextResponse.json({ error: 'IP address is required' }, { status: 400 });
      }
      
      const supabase = createClient();
      const { data, error } = await supabase
        .from('ip_bans')
        .insert({
          ip_address: ip,
          banned_by: user.id,
          reason: reason || 'Admin ban'
        })
        .select()
        .single();
      
      if (error) {
        if (error.code === '23505') {
          return NextResponse.json({ error: 'IP already banned' }, { status: 400 });
        }
        console.error('IP ban error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      
      return NextResponse.json({ 
        success: true, 
        message: `IP ${ip} banned successfully`,
        ban: data
      });
    }
    
    if (action === 'unban') {
      if (!ip) {
        return NextResponse.json({ error: 'IP address is required' }, { status: 400 });
      }
      
      const supabase = createClient();
      const { error } = await supabase
        .from('ip_bans')
        .delete()
        .eq('ip_address', ip);
      
      if (error) {
        console.error('IP unban error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      
      return NextResponse.json({ 
        success: true, 
        message: `IP ${ip} unbanned successfully` 
      });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('IP ban POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('ip_bans')
      .select(`
        *,
        profiles:banned_by (username, avatar_url)
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('IP bans fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true,
      bans: data || []
    });
  } catch (error: any) {
    console.error('IP bans GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const supabase = createClient();
    const { error } = await supabase
      .from('ip_bans')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
    if (error) {
      console.error('Clear IP bans error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'All IP bans cleared successfully' 
    });
  } catch (error: any) {
    console.error('Clear IP bans DELETE error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}