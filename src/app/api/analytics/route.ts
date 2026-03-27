import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// IP'den konum bilgisi almak için ipapi.co kullanacağız (ücretsiz)
async function getLocationFromIP(ip: string) {
  try {
    // Localhost kontrolü
    if (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
      return {
        country: 'Turkey',
        country_code: 'TR',
        city: 'Istanbul',
        region: 'Istanbul',
        latitude: 41.0082,
        longitude: 28.9784,
        timezone: 'Europe/Istanbul'
      };
    }

    const response = await fetch(`https://ipapi.co/${ip}/json/`, {
      headers: {
        'User-Agent': 'Dinletiyo Analytics/1.0'
      }
    });
    
    if (!response.ok) {
      throw new Error('IP API failed');
    }
    
    const data = await response.json();
    
    return {
      country: data.country_name || 'Unknown',
      country_code: data.country_code || 'XX',
      city: data.city || 'Unknown',
      region: data.region || 'Unknown',
      latitude: data.latitude || 0,
      longitude: data.longitude || 0,
      timezone: data.timezone || 'UTC'
    };
  } catch (error) {
    console.error('Location fetch error:', error);
    // Fallback Türkiye
    return {
      country: 'Turkey',
      country_code: 'TR',
      city: 'Unknown',
      region: 'Unknown',
      latitude: 39.9334,
      longitude: 32.8597,
      timezone: 'Europe/Istanbul'
    };
  }
}

// Gerçek IP adresini al (Vercel için)
function getRealIP(request: NextRequest): string {
  // Vercel'de gerçek IP'yi almak için
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const vercelForwardedFor = request.headers.get('x-vercel-forwarded-for');
  
  if (vercelForwardedFor) {
    return vercelForwardedFor.split(',')[0].trim();
  }
  
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return request.ip || '127.0.0.1';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event, events, userId, songId, data } = body;
    
    const ip = getRealIP(request);
    const userAgent = request.headers.get('user-agent') || '';
    const referer = request.headers.get('referer') || '';
    
    // Konum bilgisini al
    const location = await getLocationFromIP(ip);
    
    // Batch event'ler varsa onları işle
    if (events && Array.isArray(events)) {
      const analyticsData = events.map((evt: any) => ({
        event_type: evt.event,
        user_id: evt.userId,
        song_id: evt.songId,
        ip_address: ip,
        user_agent: userAgent,
        referer: referer,
        country: location.country,
        country_code: location.country_code,
        city: location.city,
        region: location.region,
        latitude: location.latitude,
        longitude: location.longitude,
        timezone: location.timezone,
        additional_data: evt.data || {},
        created_at: new Date(evt.timestamp || Date.now()).toISOString()
      }));

      const { error } = await supabase
        .from('analytics')
        .insert(analyticsData);

      if (error) {
        console.error('Batch analytics insert error:', error);
        return NextResponse.json({ error: 'Failed to save analytics' }, { status: 500 });
      }

      return NextResponse.json({ success: true, count: events.length, location });
    }
    
    // Tek event işle
    const { error } = await supabase
      .from('analytics')
      .insert({
        event_type: event,
        user_id: userId,
        song_id: songId,
        ip_address: ip,
        user_agent: userAgent,
        referer: referer,
        country: location.country,
        country_code: location.country_code,
        city: location.city,
        region: location.region,
        latitude: location.latitude,
        longitude: location.longitude,
        timezone: location.timezone,
        additional_data: data || {},
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Analytics insert error:', error);
      return NextResponse.json({ error: 'Failed to save analytics' }, { status: 500 });
    }

    return NextResponse.json({ success: true, location });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'overview';
    const days = parseInt(searchParams.get('days') || '7');
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    switch (type) {
      case 'map':
        // Dünya haritası için ülke bazlı veriler
        const { data: mapData, error: mapError } = await supabase
          .from('analytics')
          .select('country, country_code, latitude, longitude, city')
          .gte('created_at', startDate.toISOString())
          .not('country_code', 'eq', null);

        if (mapError) throw mapError;

        // Ülke bazlı gruplama
        const countryStats = mapData.reduce((acc: any, item) => {
          const key = item.country_code;
          if (!acc[key]) {
            acc[key] = {
              country: item.country,
              country_code: item.country_code,
              count: 0,
              cities: new Set(),
              coordinates: []
            };
          }
          acc[key].count++;
          acc[key].cities.add(item.city);
          if (item.latitude && item.longitude) {
            acc[key].coordinates.push([item.latitude, item.longitude]);
          }
          return acc;
        }, {});

        return NextResponse.json({
          countries: Object.values(countryStats).map((country: any) => ({
            ...country,
            cities: Array.from(country.cities),
            avgCoordinates: country.coordinates.length > 0 ? [
              country.coordinates.reduce((sum: number, coord: number[]) => sum + coord[0], 0) / country.coordinates.length,
              country.coordinates.reduce((sum: number, coord: number[]) => sum + coord[1], 0) / country.coordinates.length
            ] : [0, 0]
          }))
        });

      case 'stats':
        // Genel istatistikler
        const { data: statsData, error: statsError } = await supabase
          .from('analytics')
          .select('event_type, country, created_at')
          .gte('created_at', startDate.toISOString());

        if (statsError) throw statsError;

        const stats = {
          totalEvents: statsData.length,
          uniqueCountries: new Set(statsData.map(d => d.country)).size,
          eventTypes: statsData.reduce((acc: any, item) => {
            acc[item.event_type] = (acc[item.event_type] || 0) + 1;
            return acc;
          }, {}),
          dailyStats: statsData.reduce((acc: any, item) => {
            const date = new Date(item.created_at).toISOString().split('T')[0];
            acc[date] = (acc[date] || 0) + 1;
            return acc;
          }, {})
        };

        return NextResponse.json(stats);

      case 'realtime':
        // Son 1 saatteki canlı veriler
        const oneHourAgo = new Date();
        oneHourAgo.setHours(oneHourAgo.getHours() - 1);

        const { data: realtimeData, error: realtimeError } = await supabase
          .from('analytics')
          .select('*')
          .gte('created_at', oneHourAgo.toISOString())
          .order('created_at', { ascending: false })
          .limit(100);

        if (realtimeError) throw realtimeError;

        return NextResponse.json({
          events: realtimeData,
          activeUsers: new Set(realtimeData.map(d => d.ip_address)).size
        });

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }
  } catch (error) {
    console.error('Analytics GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}