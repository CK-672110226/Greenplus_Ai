-- GreenPlus Ai — Rider Location Realtime + RLS
-- Adds update/select policies for rider location tracking on user_profiles,
-- then enables Realtime publication for the table.
--
-- Idempotent: policy additions wrapped in DO $$ EXCEPTION WHEN duplicate_object.
-- Existing policies from migrations 001/004 are NOT dropped — only net-new ones
-- are added.  Specifically:
--   "Users can update their own profile" (004) already covers own-row UPDATE.
--   We add a broader authenticated-read policy for rider tracking purposes.

-- ── 1. Own-row UPDATE policy (covers location + is_online writes) ─────────────
-- Migration 004 already has "Users can update their own profile" with the same
-- predicate.  This is a no-op if that policy exists; silently skipped.
DO $$ BEGIN
  CREATE POLICY "user_profiles_own_update" ON public.user_profiles
    FOR UPDATE USING ((SELECT auth.uid()) = id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── 2. Authenticated read policy (rider location visible to all logged-in users) ─
-- This supplements the existing own-row SELECT policy so that other users
-- (e.g. someone booking a pickup) can see a rider's current_lat/current_lng.
-- Only authenticated requests are allowed — anonymous reads are blocked by RLS.
DO $$ BEGIN
  CREATE POLICY "user_profiles_rider_location_select" ON public.user_profiles
    FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── 3. Enable Realtime for rider location push ────────────────────────────────
-- NOTE: ALTER PUBLICATION requires superuser/replication privileges.
-- On hosted Supabase projects this works via the SQL editor (service-role context).
-- If it fails with "permission denied for publication supabase_realtime", enable
-- Realtime for user_profiles manually:
--   Supabase Dashboard → Database → Replication → supabase_realtime → Add table.
-- Only the columns needed for rider tracking (is_online, current_lat, current_lng)
-- are semantically relevant, but Supabase Realtime publishes the full row;
-- column-level filtering is not supported at the publication level.

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'user_profiles') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.user_profiles;
  END IF;
END $$;
