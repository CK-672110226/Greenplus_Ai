-- Drop the recursive "Admins can update all profiles" RLS policy on user_profiles.
-- This policy called a helper that queried shops, whose RLS policy queried back
-- into user_profiles — causing infinite recursion and 500 errors on PATCH requests.
-- The "Admins can manage all profiles" ALL policy with current_user_role() already
-- covers admin updates non-recursively.
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.user_profiles;
