-- Booking groups: link multiple shop bookings from one on-demand request
CREATE TABLE IF NOT EXISTS public.booking_groups (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id   UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status      TEXT NOT NULL DEFAULT 'searching',
  -- searching | partial | complete | timeout | cancelled
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '10 minutes')
);

ALTER TABLE public.booking_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "seller sees own groups" ON public.booking_groups
  FOR ALL USING (seller_id = auth.uid());

-- Add group + scheduling columns to bookings
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS booking_group_id UUID REFERENCES public.booking_groups(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS scheduled_for    TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS expires_at       TIMESTAMPTZ DEFAULT (now() + INTERVAL '10 minutes');

-- Transfer jobs: inter-shop logistics
CREATE TABLE IF NOT EXISTS public.transfer_jobs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_shop_id  UUID REFERENCES public.shops(id) ON DELETE CASCADE,
  to_shop_id    UUID REFERENCES public.shops(id) ON DELETE CASCADE,
  driver_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  material_type TEXT NOT NULL,
  weight_kg     NUMERIC NOT NULL,
  offered_price NUMERIC,
  actual_weight NUMERIC,
  actual_value  NUMERIC,
  status        TEXT NOT NULL DEFAULT 'available',
  -- available | accepted | picked_up | delivered | cancelled
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at  TIMESTAMPTZ
);

ALTER TABLE public.transfer_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "buyers see transfer jobs" ON public.transfer_jobs
  FOR ALL USING (
    driver_id = auth.uid()
    OR from_shop_id IN (SELECT id FROM public.shops WHERE owner_id = auth.uid())
    OR to_shop_id   IN (SELECT id FROM public.shops WHERE owner_id = auth.uid())
  );
CREATE POLICY "buyers insert transfer jobs" ON public.transfer_jobs
  FOR INSERT WITH CHECK (
    from_shop_id IN (SELECT id FROM public.shops WHERE owner_id = auth.uid())
  );
