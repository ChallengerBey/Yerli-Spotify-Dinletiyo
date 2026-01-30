import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    
    if (!code) {
      return NextResponse.redirect(new URL('/login?error=no_code', request.url));
    }

    // Google'dan access token al
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${request.nextUrl.origin}/api/auth/google/callback`,
      }),
    });

    const tokenData = await tokenResponse.json();
    
    if (!tokenData.access_token) {
      return NextResponse.redirect(new URL('/login?error=token_error', request.url));
    }

    // Google'dan kullanıcı bilgilerini al
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const userData = await userResponse.json();
    
    if (!userData.email) {
      return NextResponse.redirect(new URL('/login?error=user_error', request.url));
    }

    // Kullanıcıyı veritabanında oluştur/bul
    const user = {
      id: userData.id,
      email: userData.email,
      username: userData.name || userData.email.split('@')[0],
      avatar: userData.picture,
      provider: 'google'
    };

    // Kullanıcı bilgilerini URL parametresi olarak gönder
    const redirectUrl = new URL('/login/success', request.url);
    redirectUrl.searchParams.set('user', encodeURIComponent(JSON.stringify(user)));
    
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Google OAuth error:', error);
    return NextResponse.redirect(new URL('/login?error=oauth_error', request.url));
  }
}