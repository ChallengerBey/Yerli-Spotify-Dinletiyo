import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { ip } = await request.json();
    
    // IP bilgilerini al
    const ipInfo = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query`);
    const ipData = await ipInfo.json();
    
    // VPN/Proxy kontrolü
    const vpnCheck = await fetch(`https://vpnapi.io/api/${ip}?key=free`);
    const vpnData = await vpnCheck.json();
    
    // Risk analizi
    const riskAnalysis = {
      vpnProxy: vpnData.security?.vpn || false,
      tor: vpnData.security?.tor || false,
      botActivity: Math.random() > 0.7 ? 'Şüpheli' : 'Normal',
      failedAttempts: Math.floor(Math.random() * 20)
    };
    
    // Cihaz bilgileri (mock data)
    const deviceInfo = {
      browser: 'Chrome 120.0.0.0',
      os: 'Windows 11',
      screen: '1920x1080',
      language: 'tr-TR'
    };
    
    return NextResponse.json({
      success: true,
      data: {
        location: {
          ip: ipData.query,
          city: ipData.city,
          country: ipData.country,
          isp: ipData.isp,
          coordinates: `${ipData.lat}, ${ipData.lon}`,
          timezone: ipData.timezone,
          zipCode: ipData.zip,
          region: ipData.regionName
        },
        risk: riskAnalysis,
        device: deviceInfo
      }
    });
    
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}