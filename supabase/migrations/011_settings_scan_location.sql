-- notification_prefs: per-user toggle preferences stored as JSONB
alter table public.user_profiles
  add column if not exists notification_prefs jsonb not null
  default '{"price_alerts":true,"pickup_reminders":true,"marketing":false}'::jsonb;

-- lat/lng on scan_history for admin heatmap
alter table public.scan_history
  add column if not exists lat double precision,
  add column if not exists lng double precision;

create index if not exists idx_scan_history_location
  on public.scan_history (lat, lng)
  where lat is not null;
