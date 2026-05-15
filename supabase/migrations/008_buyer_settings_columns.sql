-- Add buyer-specific settings columns to user_profiles
-- open_days: array of weekday ints 0-6 (0=Sunday)
-- accepted_materials: array of material_type strings

alter table public.user_profiles
  add column if not exists open_days         integer[]  default '{1,2,3,4,5,6}',
  add column if not exists accepted_materials text[]     default '{}';
