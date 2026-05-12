-- ============================================================
-- Migration 006: Materialized Views
-- GreenPlus Ai — PRD Section 16.5
-- ============================================================

-- Pre-aggregated user eco stats
-- Refreshed via Supabase Edge Function triggered by DB webhook on scan_history INSERT
CREATE MATERIALIZED VIEW user_eco_stats AS
SELECT
  user_id,
  COUNT(*)                AS total_scans,
  SUM(calculated_value)   AS total_value,
  SUM(weight_estimate)    AS total_weight_kg
FROM scan_history
GROUP BY user_id;

CREATE UNIQUE INDEX ON user_eco_stats (user_id);

-- Pre-aggregated shop booking stats per day
-- Refreshed via Edge Function on bookings INSERT/UPDATE
CREATE MATERIALIZED VIEW shop_booking_stats AS
SELECT
  shop_id,
  date_trunc('day', created_at) AS day,
  COUNT(*) FILTER (WHERE status = 'pending')   AS pending,
  COUNT(*) FILTER (WHERE status = 'confirmed') AS confirmed
FROM bookings
GROUP BY shop_id, day;

CREATE INDEX ON shop_booking_stats (shop_id, day);
