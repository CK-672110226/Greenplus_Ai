-- Atomic eco-points increment — avoids read-modify-write race on the client
create or replace function public.increment_eco_points(
  user_id_param uuid,
  points_param  integer
)
returns integer
language plpgsql
security definer
as $$
declare
  new_total integer;
begin
  update public.user_profiles
     set eco_points = eco_points + points_param
   where id = user_id_param
   returning eco_points into new_total;
  return coalesce(new_total, 0);
end;
$$;
