-- Persistent notifications for buyer real-time alerts
create table if not exists notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  type        text not null,
  title       text not null,
  body        text,
  read        boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists notifications_user_id_idx on notifications(user_id);
create index if not exists notifications_read_idx    on notifications(user_id, read) where read = false;

-- RLS: users can only see their own notifications
alter table notifications enable row level security;

create policy "owner read"   on notifications for select using (auth.uid() = user_id);
create policy "owner insert" on notifications for insert with check (auth.uid() = user_id);
create policy "owner update" on notifications for update using (auth.uid() = user_id);
create policy "owner delete" on notifications for delete using (auth.uid() = user_id);
