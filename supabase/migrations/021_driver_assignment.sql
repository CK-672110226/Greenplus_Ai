-- Driver identity on user_profiles
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS is_driver      BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS driver_vehicle TEXT;  -- motorcycle | pickup | truck

-- Assignment tracking on bookings
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS assigned_driver_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS driver_assignment_status TEXT DEFAULT 'unassigned';
  -- unassigned | invited | accepted | rejected

-- Drivers can read bookings assigned to them
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'bookings' AND policyname = 'drivers see assigned bookings'
  ) THEN
    CREATE POLICY "drivers see assigned bookings" ON public.bookings
      FOR SELECT USING (assigned_driver_id = auth.uid());
  END IF;
END $$;

-- Drivers can update assignment status on their own bookings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'bookings' AND policyname = 'drivers update assignment status'
  ) THEN
    CREATE POLICY "drivers update assignment status" ON public.bookings
      FOR UPDATE USING (assigned_driver_id = auth.uid())
      WITH CHECK (assigned_driver_id = auth.uid());
  END IF;
END $$;

-- Shops can read driver profiles (needed for driver picker)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'shops read driver profiles'
  ) THEN
    CREATE POLICY "shops read driver profiles" ON public.user_profiles
      FOR SELECT USING (
        is_driver = true
        OR id = auth.uid()
        OR EXISTS (SELECT 1 FROM public.shops WHERE owner_id = auth.uid())
      );
  END IF;
END $$;
