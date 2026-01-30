-- ============================================
-- FRIENDSHIP SYSTEM (Arkadaşlık Sistemi)
-- ============================================

-- Friendships table
CREATE TABLE IF NOT EXISTS public.friendships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    friend_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, friend_id),
    CHECK (user_id != friend_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_friendships_user_id ON public.friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend_id ON public.friendships(friend_id);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON public.friendships(status);

-- Enable RLS
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- RLS Policies (with safe creation)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'friendships' AND policyname = 'Users can view their own friendships'
    ) THEN
        CREATE POLICY "Users can view their own friendships"
            ON public.friendships FOR SELECT
            USING (auth.uid() = user_id OR auth.uid() = friend_id);
        RAISE NOTICE 'Created policy: Users can view their own friendships';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'friendships' AND policyname = 'Users can create friendship requests'
    ) THEN
        CREATE POLICY "Users can create friendship requests"
            ON public.friendships FOR INSERT
            WITH CHECK (auth.uid() = user_id);
        RAISE NOTICE 'Created policy: Users can create friendship requests';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'friendships' AND policyname = 'Users can update friendship status'
    ) THEN
        CREATE POLICY "Users can update friendship status"
            ON public.friendships FOR UPDATE
            USING (auth.uid() = user_id OR auth.uid() = friend_id);
        RAISE NOTICE 'Created policy: Users can update friendship status';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'friendships' AND policyname = 'Users can delete their friendships'
    ) THEN
        CREATE POLICY "Users can delete their friendships"
            ON public.friendships FOR DELETE
            USING (auth.uid() = user_id OR auth.uid() = friend_id);
        RAISE NOTICE 'Created policy: Users can delete their friendships';
    END IF;
END $$;

-- Function to create mutual friendship
CREATE OR REPLACE FUNCTION create_mutual_friendship()
RETURNS TRIGGER AS $$
BEGIN
    -- When a friendship is accepted, create the reverse relationship
    IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
        INSERT INTO public.friendships (user_id, friend_id, status)
        VALUES (NEW.friend_id, NEW.user_id, 'accepted')
        ON CONFLICT (user_id, friend_id) 
        DO UPDATE SET status = 'accepted', updated_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for mutual friendship
DROP TRIGGER IF EXISTS trigger_mutual_friendship ON public.friendships;
CREATE TRIGGER trigger_mutual_friendship
    AFTER UPDATE ON public.friendships
    FOR EACH ROW
    EXECUTE FUNCTION create_mutual_friendship();

-- Comments
COMMENT ON TABLE public.friendships IS 'User friendship relationships and requests';