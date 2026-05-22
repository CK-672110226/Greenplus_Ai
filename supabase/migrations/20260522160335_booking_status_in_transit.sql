-- GreenPlus Ai — Expand bookings.status to include in_transit
-- Rider assignment (AdminPage) sets status = 'in_transit' after assigning a rider.
-- The constraint from 013_logistics_onboarding only covers:
--   pending | accepted | rejected | completed | searching | arrived | cancelled
-- This migration adds in_transit to that set.

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
        'searching','arrived','cancelled',
        'in_transit'
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
