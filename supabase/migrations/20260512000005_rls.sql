-- ============================================================
-- Migration 005: Row-Level Security (RLS)
-- GreenPlus Ai — PRD Section 16.4
-- ============================================================

-- Enable RLS on every table
ALTER TABLE waste_items        ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE shops              ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_history       ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_posts  ENABLE ROW LEVEL SECURITY;
ALTER TABLE grading_criteria   ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_hours         ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_closures      ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_slots         ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings           ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_images    ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_versions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_jobs      ENABLE ROW LEVEL SECURITY;

-- Helper: is current user an admin?
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean LANGUAGE sql STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
$$;

-- ── waste_items ─────────────────────────────────────────────
-- Everyone reads; only admin writes
CREATE POLICY "waste_items_read"   ON waste_items FOR SELECT USING (true);
CREATE POLICY "waste_items_admin"  ON waste_items FOR ALL    USING (is_admin());

-- ── user_profiles ────────────────────────────────────────────
-- Own row only
CREATE POLICY "profiles_own_read"  ON user_profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "profiles_own_write" ON user_profiles FOR ALL    USING (id = auth.uid());
CREATE POLICY "profiles_insert"    ON user_profiles FOR INSERT WITH CHECK (id = auth.uid());

-- ── shops ─────────────────────────────────────────────────────
-- Everyone reads active shops; owner manages own; admin manages all
CREATE POLICY "shops_read_active"  ON shops FOR SELECT USING (status = 'active' OR owner_id = auth.uid() OR is_admin());
CREATE POLICY "shops_owner_write"  ON shops FOR ALL    USING (owner_id = auth.uid());
CREATE POLICY "shops_admin"        ON shops FOR ALL    USING (is_admin());
CREATE POLICY "shops_insert"       ON shops FOR INSERT WITH CHECK (owner_id = auth.uid());

-- ── scan_history ──────────────────────────────────────────────
-- Own rows only; admin reads all
CREATE POLICY "scan_own_read"      ON scan_history FOR SELECT USING (user_id = auth.uid() OR is_admin());
CREATE POLICY "scan_own_write"     ON scan_history FOR ALL    USING (user_id = auth.uid());
CREATE POLICY "scan_insert"        ON scan_history FOR INSERT WITH CHECK (user_id = auth.uid());

-- ── marketplace_posts ─────────────────────────────────────────
-- Everyone reads unflagged; author manages own; admin can flag/delete
CREATE POLICY "market_read"        ON marketplace_posts FOR SELECT USING (flagged = false OR user_id = auth.uid() OR is_admin());
CREATE POLICY "market_own_write"   ON marketplace_posts FOR ALL    USING (user_id = auth.uid());
CREATE POLICY "market_admin"       ON marketplace_posts FOR ALL    USING (is_admin());
CREATE POLICY "market_insert"      ON marketplace_posts FOR INSERT WITH CHECK (user_id = auth.uid());

-- ── grading_criteria ──────────────────────────────────────────
-- Everyone reads; only admin writes
CREATE POLICY "criteria_read"      ON grading_criteria FOR SELECT USING (true);
CREATE POLICY "criteria_admin"     ON grading_criteria FOR ALL    USING (is_admin());

-- ── shop_hours / shop_closures / time_slots ───────────────────
-- Everyone reads; shop owner manages own shop's rows
CREATE POLICY "hours_read"         ON shop_hours    FOR SELECT USING (true);
CREATE POLICY "hours_owner"        ON shop_hours    FOR ALL    USING (
  shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid())
);

CREATE POLICY "closures_read"      ON shop_closures FOR SELECT USING (true);
CREATE POLICY "closures_owner"     ON shop_closures FOR ALL    USING (
  shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid())
);

CREATE POLICY "slots_read"         ON time_slots    FOR SELECT USING (true);
CREATE POLICY "slots_owner"        ON time_slots    FOR ALL    USING (
  shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid())
);

-- ── bookings ──────────────────────────────────────────────────
-- User sees own; shop owner sees bookings for their shop
CREATE POLICY "bookings_user_read" ON bookings FOR SELECT USING (
  user_id = auth.uid()
  OR shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid())
);
CREATE POLICY "bookings_user_create" ON bookings FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "bookings_user_cancel" ON bookings FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "bookings_shop_update" ON bookings FOR UPDATE USING (
  shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid())
);

-- ── training_images / model_versions / training_jobs ─────────
-- Admin only
CREATE POLICY "training_admin"     ON training_images FOR ALL USING (is_admin());
CREATE POLICY "model_ver_read"     ON model_versions  FOR SELECT USING (status = 'active' OR is_admin());
CREATE POLICY "model_ver_admin"    ON model_versions  FOR ALL    USING (is_admin());
CREATE POLICY "training_jobs_admin" ON training_jobs  FOR ALL    USING (is_admin());
