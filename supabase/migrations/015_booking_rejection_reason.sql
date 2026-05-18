-- GreenPlus Ai — Add rejection_reason to bookings
-- Idempotent: ADD COLUMN IF NOT EXISTS

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
