// Token alma ve auth yardımcı fonksiyonları

export function getAuthToken(): string | null {
  // Önce localStorage'dan dene
  const storageAuth = localStorage.getItem('supabase.auth');
  if (storageAuth) {
    try {
      const parsed = JSON.parse(storageAuth);
      return parsed.access_token || null;
    } catch (e) {
      console.error('Auth parse error:', e);
    }
  }

  // Sonra sessionStorage'dan dene
  const sessionAuth = sessionStorage.getItem('supabase.auth');
  if (sessionAuth) {
    try {
      const parsed = JSON.parse(sessionAuth);
      return parsed.access_token || null;
    } catch (e) {
      console.error('Session auth parse error:', e);
    }
  }

  // Eski format için
  const oldToken = localStorage.getItem('supabase.auth.token');
  if (oldToken) {
    return oldToken;
  }

  const oldSessionToken = sessionStorage.getItem('supabase.auth.token');
  if (oldSessionToken) {
    return oldSessionToken;
  }

  return null;
}

export function isUserLoggedIn(): boolean {
  return !!getAuthToken();
}

export function clearAuth() {
  localStorage.removeItem('supabase.auth');
  localStorage.removeItem('supabase.auth.token');
  sessionStorage.removeItem('supabase.auth');
  sessionStorage.removeItem('supabase.auth.token');
}
