-- GreenPlus Ai — Remove grade system from all tables
-- Grade (A/B/C) is no longer part of the product.
-- Idempotent: IF EXISTS guards throughout.

ALTER TABLE public.bookings         DROP COLUMN IF EXISTS grade;
ALTER TABLE public.scan_history     DROP COLUMN IF EXISTS grade;
ALTER TABLE public.marketplace_posts DROP COLUMN IF EXISTS grade;
