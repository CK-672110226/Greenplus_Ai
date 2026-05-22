-- GreenPlus Ai — Admin ban capabilities
-- Adds is_banned to user_profiles and 'banned' status to shops.
-- Also adds admin RLS policies to update ban fields.

-- 1. Add is_banned column to user_profiles
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS is_banned BOOLEAN NOT NULL DEFAULT false;

-- 2. Expand shops.status CHECK to include 'banned'
DO $$ BEGIN
  ALTER TABLE public.shops
    DROP CONSTRAINT IF EXISTS shops_status_check;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.shops
    ADD CONSTRAINT shops_status_check CHECK (
      status IN ('pending', 'active', 'rejected', 'banned')
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 3. Allow admins to update any user_profile (for ban/unban)
DO $$ BEGIN
  CREATE POLICY "Admins can update all profiles"
    ON public.user_profiles FOR UPDATE
    USING (exists (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    ));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 4. Allow admins to update any shop (for ban/unban)
DO $$ BEGIN
  CREATE POLICY "Admins can update all shops"
    ON public.shops FOR UPDATE
    USING (exists (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    ));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
