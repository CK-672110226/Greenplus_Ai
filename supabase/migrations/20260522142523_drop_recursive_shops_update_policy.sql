-- Drop the recursive "Admins can update all shops" RLS policy on shops.
-- Same infinite-recursion pattern as user_profiles: this policy queried
-- user_profiles, whose RLS policy queried back into shops.
-- The "Admins can manage all shops" ALL policy with current_user_role() already
-- covers admin updates non-recursively.
DROP POLICY IF EXISTS "Admins can update all shops" ON public.shops;
