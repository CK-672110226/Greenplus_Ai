-- Fix for RLS infinite recursion 500 Error
-- Replaces the language sql function with language plpgsql to prevent inlining

create or replace function public.current_user_role()
returns text
language plpgsql
security definer
stable
set search_path = public
as $$
declare
  v_role text;
begin
  select role into v_role from public.user_profiles where id = auth.uid();
  return v_role;
end;
$$;
