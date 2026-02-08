-- ============================================
-- FAVORITES SYSTEM (Favoriler Sistemi)
-- ============================================

-- Favorites table
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    song_id TEXT NOT NULL,
    song_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, song_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_date ON public.favorites(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_favorites_song ON public.favorites(song_id);

-- Enable RLS
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies (with safe creation)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'favorites' AND policyname = 'Users can view their own favorites'
    ) THEN
        CREATE POLICY "Users can view their own favorites"
            ON public.favorites FOR SELECT
            USING (auth.uid() = user_id);
        RAISE NOTICE 'Created policy: Users can view their own favorites';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'favorites' AND policyname = 'Users can add to their favorites'
    ) THEN
        CREATE POLICY "Users can add to their favorites"
            ON public.favorites FOR INSERT
            WITH CHECK (auth.uid() = user_id);
        RAISE NOTICE 'Created policy: Users can add to their favorites';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'favorites' AND policyname = 'Users can remove from their favorites'
    ) THEN
        CREATE POLICY "Users can remove from their favorites"
            ON public.favorites FOR DELETE
            USING (auth.uid() = user_id);
        RAISE NOTICE 'Created policy: Users can remove from their favorites';
    END IF;
END $$;

-- Comments
COMMENT ON TABLE public.favorites IS 'User favorite songs';