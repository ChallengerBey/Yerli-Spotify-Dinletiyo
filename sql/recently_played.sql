-- ============================================
-- RECENTLY PLAYED SYSTEM (Son Çalınanlar)
-- ============================================

-- Recently played table
CREATE TABLE IF NOT EXISTS public.recently_played (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    song_id TEXT NOT NULL,
    song_data JSONB NOT NULL,
    played_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_recently_played_user_id ON public.recently_played(user_id);
CREATE INDEX IF NOT EXISTS idx_recently_played_user_date ON public.recently_played(user_id, played_at DESC);
CREATE INDEX IF NOT EXISTS idx_recently_played_song ON public.recently_played(song_id);

-- Enable RLS
ALTER TABLE public.recently_played ENABLE ROW LEVEL SECURITY;

-- RLS Policies (with safe creation)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'recently_played' AND policyname = 'Users can view their own recently played'
    ) THEN
        CREATE POLICY "Users can view their own recently played"
            ON public.recently_played FOR SELECT
            USING (auth.uid() = user_id);
        RAISE NOTICE 'Created policy: Users can view their own recently played';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'recently_played' AND policyname = 'Users can add to their recently played'
    ) THEN
        CREATE POLICY "Users can add to their recently played"
            ON public.recently_played FOR INSERT
            WITH CHECK (auth.uid() = user_id);
        RAISE NOTICE 'Created policy: Users can add to their recently played';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'recently_played' AND policyname = 'Users can delete their recently played'
    ) THEN
        CREATE POLICY "Users can delete their recently played"
            ON public.recently_played FOR DELETE
            USING (auth.uid() = user_id);
        RAISE NOTICE 'Created policy: Users can delete their recently played';
    END IF;
END $$;

-- Function to limit recently played entries per user
CREATE OR REPLACE FUNCTION limit_recently_played()
RETURNS TRIGGER AS $$
BEGIN
    -- Keep only the last 100 entries per user
    DELETE FROM public.recently_played
    WHERE user_id = NEW.user_id
    AND id NOT IN (
        SELECT id FROM public.recently_played
        WHERE user_id = NEW.user_id
        ORDER BY played_at DESC
        LIMIT 100
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to limit entries
DROP TRIGGER IF EXISTS trigger_limit_recently_played ON public.recently_played;
CREATE TRIGGER trigger_limit_recently_played
    AFTER INSERT ON public.recently_played
    FOR EACH ROW
    EXECUTE FUNCTION limit_recently_played();

-- Comments
COMMENT ON TABLE public.recently_played IS 'User recently played songs history';