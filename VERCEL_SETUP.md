# Vercel Deployment Setup

## Environment Variables

Vercel'de deployment için aşağıdaki environment variables'ları eklemeniz gerekiyor:

### 1. Vercel Dashboard'a gidin
- https://vercel.com/dashboard
- Projenizi seçin
- Settings > Environment Variables

### 2. Gerekli Environment Variables

#### Supabase (Zorunlu)
```
NEXT_PUBLIC_SUPABASE_URL=https://axcixgsyofjpwxlvikes.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4Y2l4Z3N5b2ZqcHd4bHZpa2VzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MzQ1MTEsImV4cCI6MjA4MjUxMDUxMX0.d_pGMTzUDmH9LUK6n-5aCq3JHck6mpa1MKNdYZJOyIs
SUPABASE_SERVICE_ROLE_KEY=[Supabase'den alınacak service role key]
```

#### API Keys (Opsiyonel - özellikler çalışması için)
```
YOUTUBE_API_KEY=[YouTube Data API v3 key]
LASTFM_API_KEY=[Last.fm API key]
GOOGLE_GENAI_API_KEY=[Google Gemini API key]
GOOGLE_CLIENT_ID=[Google OAuth Client ID]
GOOGLE_CLIENT_SECRET=[Google OAuth Client Secret]
```

### 3. Supabase Service Role Key Nasıl Alınır

1. https://supabase.com/dashboard/project/axcixgsyofjpwxlvikes
2. Settings > API
3. "service_role" key'ini kopyalayın
4. Vercel'de `SUPABASE_SERVICE_ROLE_KEY` olarak ekleyin

### 4. Deployment

Environment variables eklendikten sonra:
1. Vercel otomatik olarak yeniden deploy edecek
2. Veya manuel olarak "Redeploy" butonuna basın

## Hata Giderme

### "supabaseKey is required" hatası
- `SUPABASE_SERVICE_ROLE_KEY` environment variable'ının Vercel'de eklendiğinden emin olun

### Build hatası
- Tüm environment variables'ların doğru şekilde eklendiğinden emin olun
- Vercel logs'ları kontrol edin

## Test

Deployment başarılı olduktan sonra:
- https://dinletiyo.com adresini ziyaret edin
- Admin panel: https://dinletiyo.com/yonetim