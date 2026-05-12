-- ============================================================
-- Migration 004: Indexes
-- GreenPlus Ai — PRD Sections 16.3, 18.4
-- ============================================================

-- shops
CREATE INDEX idx_shops_status_verified ON shops (status, verified);
CREATE INDEX idx_shops_owner           ON shops (owner_id);
CREATE INDEX idx_shops_location        ON shops (lat, lng);

-- scan_history
CREATE INDEX idx_scan_history_user     ON scan_history (user_id, scanned_at DESC);
CREATE INDEX idx_scan_history_type     ON scan_history (item_type, grade);

-- marketplace_posts
CREATE INDEX idx_marketplace_status    ON marketplace_posts (status, grade);
CREATE INDEX idx_marketplace_user      ON marketplace_posts (user_id, status);

-- bookings
CREATE INDEX idx_bookings_user         ON bookings (user_id, status);
CREATE INDEX idx_bookings_shop         ON bookings (shop_id, slot_id, status);

-- calendar
CREATE INDEX idx_time_slots_avail      ON time_slots    (shop_id, date, booked_count);
CREATE INDEX idx_shop_closures_lookup  ON shop_closures (shop_id, start_date, end_date);
CREATE INDEX idx_shop_hours_shop       ON shop_hours    (shop_id, day_of_week);

-- AI model
CREATE INDEX idx_training_images_queue ON training_images (status, material_type);
CREATE INDEX idx_model_versions_active ON model_versions  (stage, status);
