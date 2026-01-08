/*
  # Fix Security and Performance Issues

  1. Add Missing Indexes on Foreign Keys
    - admin_logs.admin_id (already exists, verify)
    - design_conversions.user_id
    - generated_plugins.request_id
    - generated_plugins.user_id
    - imported_designs.connection_id

  2. Optimize RLS Policies
    - Replace `auth.uid()` with `(select auth.uid())` to prevent re-evaluation per row
    - Affects: design_conversions, divi_modules, elementor_widgets, pages, site_settings, api_keys, pricing_plans

  3. Remove Unused Indexes
    - idx_pricing_plans_slug
    - idx_pricing_plans_active

  4. Fix Multiple Permissive Policies
    - Consolidate overlapping SELECT policies on pricing_plans table

  5. Notes
    - These changes significantly improve query performance at scale
    - RLS policy optimization prevents function re-evaluation for each row
*/

-- ============================================================================
-- 1. Add Missing Indexes on Foreign Keys
-- ============================================================================

-- admin_logs.admin_id already has index from previous migration, but verify
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id 
  ON admin_logs(admin_id);

CREATE INDEX IF NOT EXISTS idx_design_conversions_user_id 
  ON design_conversions(user_id);

CREATE INDEX IF NOT EXISTS idx_generated_plugins_request_id 
  ON generated_plugins(request_id);

CREATE INDEX IF NOT EXISTS idx_generated_plugins_user_id 
  ON generated_plugins(user_id);

CREATE INDEX IF NOT EXISTS idx_imported_designs_connection_id 
  ON imported_designs(connection_id);

-- ============================================================================
-- 2. Optimize RLS Policies - Replace auth.uid() with (select auth.uid())
-- ============================================================================

-- design_conversions
DROP POLICY IF EXISTS "Users can view own conversions, admins view all" ON design_conversions;
CREATE POLICY "Users can view own conversions, admins view all"
  ON design_conversions
  FOR SELECT
  TO authenticated
  USING (
    user_id = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

-- divi_modules
DROP POLICY IF EXISTS "Admins can insert divi modules" ON divi_modules;
CREATE POLICY "Admins can insert divi modules"
  ON divi_modules
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update divi modules" ON divi_modules;
CREATE POLICY "Admins can update divi modules"
  ON divi_modules
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can delete divi modules" ON divi_modules;
CREATE POLICY "Admins can delete divi modules"
  ON divi_modules
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

-- elementor_widgets
DROP POLICY IF EXISTS "Admins can insert elementor widgets" ON elementor_widgets;
CREATE POLICY "Admins can insert elementor widgets"
  ON elementor_widgets
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update elementor widgets" ON elementor_widgets;
CREATE POLICY "Admins can update elementor widgets"
  ON elementor_widgets
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can delete elementor widgets" ON elementor_widgets;
CREATE POLICY "Admins can delete elementor widgets"
  ON elementor_widgets
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

-- pages
DROP POLICY IF EXISTS "Users can view published pages, admins view all" ON pages;
CREATE POLICY "Users can view published pages, admins view all"
  ON pages
  FOR SELECT
  TO authenticated
  USING (
    published = true
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

-- site_settings
DROP POLICY IF EXISTS "Admins can insert settings" ON site_settings;
CREATE POLICY "Admins can insert settings"
  ON site_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update settings" ON site_settings;
CREATE POLICY "Admins can update settings"
  ON site_settings
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can delete settings" ON site_settings;
CREATE POLICY "Admins can delete settings"
  ON site_settings
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

-- api_keys
DROP POLICY IF EXISTS "Only admins can view API keys" ON api_keys;
CREATE POLICY "Only admins can view API keys"
  ON api_keys
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Only admins can insert API keys" ON api_keys;
CREATE POLICY "Only admins can insert API keys"
  ON api_keys
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Only admins can update API keys" ON api_keys;
CREATE POLICY "Only admins can update API keys"
  ON api_keys
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Only admins can delete API keys" ON api_keys;
CREATE POLICY "Only admins can delete API keys"
  ON api_keys
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

-- pricing_plans - Drop old policies
DROP POLICY IF EXISTS "Admins can view all pricing plans" ON pricing_plans;
DROP POLICY IF EXISTS "Anyone can view active pricing plans" ON pricing_plans;
DROP POLICY IF EXISTS "Admins can insert pricing plans" ON pricing_plans;
DROP POLICY IF EXISTS "Admins can update pricing plans" ON pricing_plans;
DROP POLICY IF EXISTS "Admins can delete pricing plans" ON pricing_plans;

-- pricing_plans - Create consolidated optimized policies
CREATE POLICY "View pricing plans"
  ON pricing_plans
  FOR SELECT
  TO authenticated
  USING (
    is_active = true
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert pricing plans"
  ON pricing_plans
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update pricing plans"
  ON pricing_plans
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete pricing plans"
  ON pricing_plans
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- 3. Remove Unused Indexes
-- ============================================================================

DROP INDEX IF EXISTS idx_pricing_plans_slug;
DROP INDEX IF EXISTS idx_pricing_plans_active;