/*
  # Optimize RLS Policies for Performance

  ## Overview
  This migration optimizes all RLS policies to prevent re-evaluation of auth.uid() 
  for each row by wrapping it in a SELECT statement. This significantly improves 
  query performance at scale.

  ## Changes Made
  1. Replace all `auth.uid()` with `(select auth.uid())` in RLS policies
  2. Fix function search_path for update_updated_at_column
  
  ## Tables Updated
  - plugin_requests (4 policies)
  - profiles (3 policies)
  - generated_plugins (3 policies)
  - subscriptions (3 policies)
  - admin_logs (2 policies)
  - pages (4 policies)
  - site_settings (1 policy)
  - design_conversions (5 policies)
  - divi_modules (1 policy)
  - elementor_widgets (1 policy)
  - design_tool_connections (4 policies)
  - imported_designs (4 policies)

  ## Security
  All policies maintain the same security rules, only optimized for performance.
*/

-- Fix function search_path first
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- plugin_requests policies
DROP POLICY IF EXISTS "Users can view own plugin requests" ON plugin_requests;
CREATE POLICY "Users can view own plugin requests"
  ON plugin_requests FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can create plugin requests" ON plugin_requests;
CREATE POLICY "Users can create plugin requests"
  ON plugin_requests FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own plugin requests" ON plugin_requests;
CREATE POLICY "Users can update own plugin requests"
  ON plugin_requests FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own plugin requests" ON plugin_requests;
CREATE POLICY "Users can delete own plugin requests"
  ON plugin_requests FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = (select auth.uid()))
  WITH CHECK (id = (select auth.uid()));

-- generated_plugins policies
DROP POLICY IF EXISTS "Users can view own generated plugins" ON generated_plugins;
CREATE POLICY "Users can view own generated plugins"
  ON generated_plugins FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can create generated plugins" ON generated_plugins;
CREATE POLICY "Users can create generated plugins"
  ON generated_plugins FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own generated plugins" ON generated_plugins;
CREATE POLICY "Users can update own generated plugins"
  ON generated_plugins FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- subscriptions policies
DROP POLICY IF EXISTS "Users can view own subscription" ON subscriptions;
CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own subscription" ON subscriptions;
CREATE POLICY "Users can insert own subscription"
  ON subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own subscription" ON subscriptions;
CREATE POLICY "Users can update own subscription"
  ON subscriptions FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- admin_logs policies
DROP POLICY IF EXISTS "Admins can view logs" ON admin_logs;
CREATE POLICY "Admins can view logs"
  ON admin_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can create logs" ON admin_logs;
CREATE POLICY "Admins can create logs"
  ON admin_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

-- pages policies
DROP POLICY IF EXISTS "Admins can view all pages" ON pages;
CREATE POLICY "Admins can view all pages"
  ON pages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can create pages" ON pages;
CREATE POLICY "Admins can create pages"
  ON pages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update pages" ON pages;
CREATE POLICY "Admins can update pages"
  ON pages FOR UPDATE
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

DROP POLICY IF EXISTS "Admins can delete pages" ON pages;
CREATE POLICY "Admins can delete pages"
  ON pages FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

-- site_settings policies
DROP POLICY IF EXISTS "Admins can manage settings" ON site_settings;
CREATE POLICY "Admins can manage settings"
  ON site_settings FOR ALL
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

-- design_conversions policies
DROP POLICY IF EXISTS "Users can view own conversions" ON design_conversions;
CREATE POLICY "Users can view own conversions"
  ON design_conversions FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Admins can view all conversions" ON design_conversions;
CREATE POLICY "Admins can view all conversions"
  ON design_conversions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Users can create conversions" ON design_conversions;
CREATE POLICY "Users can create conversions"
  ON design_conversions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own conversions" ON design_conversions;
CREATE POLICY "Users can update own conversions"
  ON design_conversions FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own conversions" ON design_conversions;
CREATE POLICY "Users can delete own conversions"
  ON design_conversions FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- divi_modules policies
DROP POLICY IF EXISTS "Admins can manage divi modules" ON divi_modules;
CREATE POLICY "Admins can manage divi modules"
  ON divi_modules FOR ALL
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

-- elementor_widgets policies
DROP POLICY IF EXISTS "Admins can manage elementor widgets" ON elementor_widgets;
CREATE POLICY "Admins can manage elementor widgets"
  ON elementor_widgets FOR ALL
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

-- design_tool_connections policies
DROP POLICY IF EXISTS "Users can view own connections" ON design_tool_connections;
CREATE POLICY "Users can view own connections"
  ON design_tool_connections FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can create own connections" ON design_tool_connections;
CREATE POLICY "Users can create own connections"
  ON design_tool_connections FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own connections" ON design_tool_connections;
CREATE POLICY "Users can update own connections"
  ON design_tool_connections FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own connections" ON design_tool_connections;
CREATE POLICY "Users can delete own connections"
  ON design_tool_connections FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- imported_designs policies
DROP POLICY IF EXISTS "Users can view own imports" ON imported_designs;
CREATE POLICY "Users can view own imports"
  ON imported_designs FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can create own imports" ON imported_designs;
CREATE POLICY "Users can create own imports"
  ON imported_designs FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own imports" ON imported_designs;
CREATE POLICY "Users can update own imports"
  ON imported_designs FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own imports" ON imported_designs;
CREATE POLICY "Users can delete own imports"
  ON imported_designs FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- Recreate triggers that were dropped with CASCADE
DROP TRIGGER IF EXISTS update_plugin_requests_updated_at ON plugin_requests;
CREATE TRIGGER update_plugin_requests_updated_at
  BEFORE UPDATE ON plugin_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_generated_plugins_updated_at ON generated_plugins;
CREATE TRIGGER update_generated_plugins_updated_at
  BEFORE UPDATE ON generated_plugins
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_pages_updated_at ON pages;
CREATE TRIGGER update_pages_updated_at
  BEFORE UPDATE ON pages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_design_conversions_updated_at ON design_conversions;
CREATE TRIGGER update_design_conversions_updated_at
  BEFORE UPDATE ON design_conversions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_design_tool_connections_updated_at ON design_tool_connections;
CREATE TRIGGER update_design_tool_connections_updated_at
  BEFORE UPDATE ON design_tool_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();