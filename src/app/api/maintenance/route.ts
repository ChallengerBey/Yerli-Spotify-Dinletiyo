import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

function getBearerToken(request: Request) {
  const auth = request.headers.get('authorization') || request.headers.get('Authorization');
  if (!auth) return null;
  const match = auth.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? null;
}

export async function GET() {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('maintenance_settings')
      .select('*')
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Maintenance fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      maintenanceMode: data?.is_maintenance || false,
      message: data?.message || 'Sistem bakımda. Lütfen daha sonra tekrar deneyin.',
      settings: data
    });
  } catch (error: any) {
    console.error('Maintenance GET error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const token = getBearerToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseWithAuth = createClient(token);
    const { data: { user }, error: userError } = await supabaseWithAuth.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, message } = await request.json();
    
    if (action === 'toggle') {
      const supabase = createClient();
      
      // Get current state
      const { data: current } = await supabase
        .from('maintenance_settings')
        .select('is_maintenance')
        .single();
      
      const newMaintenanceMode = current ? !current.is_maintenance : true;
      
      const { data, error } = await supabase
        .from('maintenance_settings')
        .upsert({
          is_maintenance: newMaintenanceMode,
          message: message || 'Sistem bakımda. Lütfen daha sonra tekrar deneyin.',
          updated_by: user.id,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) {
        console.error('Maintenance toggle error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      
      return NextResponse.json({
        success: true,
        maintenanceMode: newMaintenanceMode,
        message: `Bakım modu ${newMaintenanceMode ? 'açıldı' : 'kapatıldı'}`,
        settings: data
      });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    
  } catch (error: any) {
    console.error('Maintenance POST error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}                                                                           