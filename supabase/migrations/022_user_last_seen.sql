-- Track last activity timestamp for all users (presence / system monitor)
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS last_seen TIMESTAMPTZ DEFAULT now();

-- Fast lookup for "who is online in last N minutes"
CREATE INDEX IF NOT EXISTS idx_user_profiles_last_seen
  ON public.user_profiles (last_seen DESC);

-- Allow each user to update their own last_seen
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'users update own last_seen'
  ) THEN
    CREATE POLICY "users update own last_seen" ON public.user_profiles
      FOR UPDATE USING (id = auth.uid())
      WITH CHECK (id = auth.uid());
  END IF;
END $$;
