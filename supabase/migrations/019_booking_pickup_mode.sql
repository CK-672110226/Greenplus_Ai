-- Add pickup_mode to bookings (dropOff | onDemand)
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS pickup_mode TEXT DEFAULT 'dropOff';
