-- GreenPlus Ai — Logistics + Onboarding Additions
-- Idempotent: safe to run twice (all ADD COLUMN use IF NOT EXISTS, constraint
-- additions wrapped in DO $$ EXCEPTION WHEN duplicate_object blocks).

-- ── user_profiles: rider/online tracking + onboarding flag ──────────────────

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS is_online          BOOLEAN  DEFAULT false,
  ADD COLUMN IF NOT EXISTS current_lat        NUMERIC,
  ADD COLUMN IF NOT EXISTS current_lng        NUMERIC,
  ADD COLUMN IF NOT EXISTS onboarding_complete BOOLEAN DEFAULT false;

-- ── bookings: scheduling + on-demand logistics state machine ────────────────
-- Note: bookings.seller_id is the existing FK (not user_id — see migration 001).

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS scheduled_date  DATE,
  ADD COLUMN IF NOT EXISTS start_hour      SMALLINT CHECK (start_hour BETWEEN 8 AND 18),
  ADD COLUMN IF NOT EXISTS duration_hours  NUMERIC  DEFAULT 1.0,
  ADD COLUMN IF NOT EXISTS pickup_lat      NUMERIC,
  ADD COLUMN IF NOT EXISTS pickup_lng      NUMERIC,
  ADD COLUMN IF NOT EXISTS actual_weight   NUMERIC,
  ADD COLUMN IF NOT EXISTS actual_value    NUMERIC,
  ADD COLUMN IF NOT EXISTS arrived_at      TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS completed_at    TIMESTAMPTZ;

-- Ensure DEFAULT is set (safe even if already 'pending')
ALTER TABLE public.bookings
  ALTER COLUMN status SET DEFAULT 'pending';

-- Expand status CHECK constraint to cover on-demand lifecycle values:
--   pending | accepted | rejected | completed   (original scheduled states)
--   searching | arrived | cancelled             (on-demand additions)
-- The original inline CHECK was auto-named bookings_status_check by Postgres.
-- Drop it (ignore if missing) then add the expanded version.
DO $$ BEGIN
  ALTER TABLE public.bookings
    DROP CONSTRAINT IF EXISTS bookings_status_check;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.bookings
    ADD CONSTRAINT bookings_status_check CHECK (
      status IN (
        'pending','accepted','rejected','completed',
        'searching','arrived','cancelled'
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── shops: extra fields for buyer onboarding ────────────────────────────────
-- Note: the actual shops table uses 'accepts' and 'area' (from migration 001),
-- not 'accepted_materials' / 'location'.  We add only net-new columns here.

ALTER TABLE public.shops
  ADD COLUMN IF NOT EXISTS description       TEXT,
  ADD COLUMN IF NOT EXISTS line_id           TEXT,
  ADD COLUMN IF NOT EXISTS pickup_radius_km  NUMERIC DEFAULT 5.0,
  ADD COLUMN IF NOT EXISTS phone             TEXT;
