# Feature-LogisticsOnboardingMigrations.00

**Date:** 16 May 2026 (16 พฤษภาคม 2569)

---

## Overview

Added five Supabase SQL migration files (013–016 + 013b) that extend the
GreenPlus Ai database schema to support on-demand logistics, buyer onboarding,
in-app chat, admin report improvements, and rider location realtime tracking.

---

## Reason

Upcoming features (logistics flow, buyer onboarding wizard, chat, admin
training-image workflow, rider GPS tracking) required database-level changes
before any frontend work could start.  All migrations were designed to be
idempotent and backward-compatible with the existing schema.

---

## Changes (file-by-file)

### `supabase/migrations/013_logistics_onboarding.sql`
- `user_profiles`: added `is_online`, `current_lat`, `current_lng`, `onboarding_complete`
- `bookings`: added scheduling columns (`scheduled_date`, `start_hour`, `duration_hours`) and logistics state columns (`pickup_lat`, `pickup_lng`, `actual_weight`, `actual_value`, `arrived_at`, `completed_at`)
- `bookings`: expanded `status` CHECK constraint to include on-demand lifecycle values (`searching`, `arrived`, `cancelled`)
- `shops`: added `description`, `line_id`, `pickup_radius_km`, `phone`

### `supabase/migrations/013b_pricing_no_grade.sql`
- `shop_pricing`: added `price_per_kg`, `cap_kg` columns
- Backfilled `price_per_kg` from `price_grade_a`
- Dropped `price_grade_a`, `price_grade_b`, `price_grade_c` columns
- Dropped `grade` and `condition` columns (guarded with IF EXISTS)
- Re-asserted `UNIQUE (shop_id, material_type)` constraint

### `supabase/migrations/014_chat.sql`
- New `chat_rooms` table: one room per user-shop pair, RLS for participants
- New `messages` table: text/offer/system messages, RLS for senders/participants
- Indexes on `messages(room_id, created_at)`, `chat_rooms(user_id/shop_id)`
- `ALTER PUBLICATION supabase_realtime ADD TABLE messages, chat_rooms`

### `supabase/migrations/015_training_images.sql`
- Extended existing `training_images` table (from migration 003) with `report_id` FK and `approved_by` columns
- Replaced migration-003's recursive-subquery admin policy with `current_user_role()` helper version

### `supabase/migrations/016_rider_realtime_rls.sql`
- Added `user_profiles_rider_location_select` policy (authenticated users can read all profiles for rider tracking)
- Added `user_profiles_own_update` policy (idempotent, skipped if 004's policy already exists)
- `ALTER PUBLICATION supabase_realtime ADD TABLE user_profiles`

### `NowProject/MIGRATIONS_WRITTEN.md`
- Summary of all migrations with tables, changes, execution order, and manual steps for ALTER PUBLICATION fallback

---

## Validation

- All SQL is idempotent: `ADD COLUMN IF NOT EXISTS`, `DROP COLUMN IF EXISTS`, `DROP CONSTRAINT IF EXISTS`, and `DO $$ EXCEPTION WHEN duplicate_object THEN NULL` guards
- No existing columns dropped without IF EXISTS protection
- Migration order: 013 → 013b → 014 → 015 → 016
- `ALTER PUBLICATION` fallback documented for hosted Supabase environments

---

## Notes

- `shop_pricing` simplification (013b) requires frontend changes in `useMarketPricing.js`, `useShops.js`, and `PricingPage.jsx` to use `price_per_kg` instead of `price_grade_a/c`
- Migration 015 adapted from a CREATE TABLE spec to ALTER TABLE because `training_images` already existed from migration 003
- `ALTER PUBLICATION supabase_realtime` may require manual dashboard steps on some hosted instances (documented in summary file)
