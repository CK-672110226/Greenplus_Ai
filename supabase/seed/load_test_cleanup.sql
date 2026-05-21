-- ============================================================
-- GreenPlus Ai — Load Test Cleanup
-- Removes all data inserted by load_test_20users_100orders.sql
-- Safe to run multiple times (DELETE … WHERE is idempotent)
-- ============================================================

-- eco point ledger entries from load test orders
DELETE FROM public.eco_point_ledger
WHERE reason LIKE 'Completed order:%'
  AND user_id IN (
    SELECT id FROM public.user_profiles
    WHERE id::text LIKE 'c1000000-%'
  );

-- scan history
DELETE FROM public.scan_history
WHERE user_id::text LIKE 'c1000000-%';

-- marketplace posts
DELETE FROM public.marketplace_posts
WHERE user_id::text LIKE 'c1000000-%';

-- bookings
DELETE FROM public.bookings
WHERE id::text LIKE 'f0000000-%';

-- shop pricing
DELETE FROM public.shop_pricing
WHERE shop_id::text LIKE 't1000000-%';

-- shops
DELETE FROM public.shops
WHERE id::text LIKE 't1000000-%';

-- user profiles (cascades scan_history, eco_points, etc.)
DELETE FROM public.user_profiles
WHERE id::text LIKE 'b1000000-%'
   OR id::text LIKE 'd1000000-%'
   OR id::text LIKE 'c1000000-%';

-- auth users
DELETE FROM auth.users
WHERE email LIKE '%@greenplus.test';

SELECT 'Load test data removed.' AS status;
