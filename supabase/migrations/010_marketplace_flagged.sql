-- Add flagged column to marketplace_posts for admin moderation
alter table public.marketplace_posts
  add column if not exists flagged boolean not null default false;

create index if not exists idx_marketplace_posts_flagged
  on public.marketplace_posts (flagged)
  where flagged = true;
