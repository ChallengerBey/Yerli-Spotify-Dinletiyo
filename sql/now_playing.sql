-- Now Playing tablosu - Kullanıcıların şu an çalan şarkıları
CREATE TABLE IF NOT EXISTS now_playing (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  song_id TEXT NOT NULL,
  song_title TEXT NOT NULL,
  song_artist TEXT NOT NULL,
  song_image_url TEXT,
  song_audio_url TEXT,
  progress REAL DEFAULT 0,
  duration REAL DEFAULT 0,
  is_playing BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_now_playing_user_id ON now_playing(user_id);
CREATE INDEX IF NOT EXISTS idx_now_playing_updated_at ON now_playing(updated_at);

-- RLS Policies
ALTER TABLE now_playing ENABLE ROW LEVEL SECURITY;

-- Önce mevcut policy'leri sil
DROP POLICY IF EXISTS "Anyone can read now playing" ON now_playing;
DROP POLICY IF EXISTS "Users can update own now playing" ON now_playing;
DROP POLICY IF EXISTS "Users can insert own now playing" ON now_playing;
DROP POLICY IF EXISTS "Users can delete own now playing" ON now_playing;
DROP POLICY IF EXISTS "Anyone can insert now playing" ON now_playing;
DROP POLICY IF EXISTS "Anyone can update now playing" ON now_playing;
DROP POLICY IF EXISTS "Anyone can delete now playing" ON now_playing;

-- Herkes okuyabilir (overlay için)
CREATE POLICY "Anyone can read now playing"
  ON now_playing FOR SELECT
  USING (true);

-- Herkes ekleyebilir/güncelleyebilir (geçici - overlay için)
CREATE POLICY "Anyone can insert now playing"
  ON now_playing FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update now playing"
  ON now_playing FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete now playing"
  ON now_playing FOR DELETE
  USING (true);

-- Otomatik güncelleme trigger'ı
CREATE OR REPLACE FUNCTION update_now_playing_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_now_playing_timestamp ON now_playing;
CREATE TRIGGER update_now_playing_timestamp
  BEFORE UPDATE ON now_playing
  FOR EACH ROW
  EXECUTE FUNCTION update_now_playing_timestamp();