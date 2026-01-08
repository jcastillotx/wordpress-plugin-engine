/*
  # Fix Security Issues
  
  1. Remove Unused Indexes
    - Drop all indexes that have not been used to improve performance and reduce storage
    - Indexes can be re-added later if query patterns show they are needed
  
  2. Fix Multiple Permissive Policies
    - Consolidate multiple permissive SELECT policies into single policies
    - Use restrictive policies where both admin and regular user access is needed
    - Ensures clear security boundaries without policy conflicts
  
  3. Tables Affected
    - plugin_requests: Remove unused status and builder_type indexes
    - generated_plugins: Remove unused user_id and request_id indexes
    - pages: Remove unused slug and published indexes, consolidate policies
    - admin_logs: Remove unused admin_id index
    - profiles: Remove unused role index
    - design_conversions: Remove unused indexes, consolidate policies
    - divi_modules: Remove unused indexes, consolidate policies
    - elementor_widgets: Remove unused indexes, consolidate policies
    - design_tool_connections: Remove unused indexes
    - imported_designs: Remove unused indexes
    - site_settings: Consolidate policies
*/

-- Drop unused indexes
DROP INDEX IF EXISTS idx_plugin_requests_status;
DROP INDEX IF EXISTS idx_generated_plugins_user_id;
DROP INDEX IF EXISTS idx_generated_plugins_request_id;
DROP INDEX IF EXISTS idx_plugin_requests_builder_type;
DROP INDEX IF EXISTS idx_pages_slug;
DROP INDEX IF EXISTS idx_pages_published;
DROP INDEX IF EXISTS idx_admin_logs_admin_id;
DROP INDEX IF EXISTS idx_profiles_role;
DROP INDEX IF EXISTS idx_design_conversions_user_id;
DROP INDEX IF EXISTS idx_design_conversions_status;
DROP INDEX IF EXISTS idx_design_conversions_type;
DROP INDEX IF EXISTS idx_design_conversions_created;
DROP INDEX IF EXISTS idx_divi_modules_slug;
DROP INDEX IF EXISTS idx_divi_modules_category;
DROP INDEX IF EXISTS idx_elementor_widgets_slug;
DROP INDEX IF EXISTS idx_elementor_widgets_category;
DROP INDEX IF EXISTS idx_connections_user_id;
DROP INDEX IF EXISTS idx_connections_tool_name;
DROP INDEX IF EXISTS idx_connections_active;
DROP INDEX IF EXISTS idx_imports_user_id;
DROP INDEX IF EXISTS idx_imports_connection_id;
DROP INDEX IF EXISTS idx_imports_tool_name;
DROP INDEX IF EXISTS idx_imports_external_id;

-- Fix multiple permissive policies on design_conversions
DROP POLICY IF EXISTS "Admins can view all conversions" ON design_conversions;
DROP POLICY IF EXISTS "Users can view own conversions" ON design_conversions;

CREATE POLICY "Users can view own conversions, admins view all"
  ON design_conversions
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Fix multiple permissive policies on divi_modules
DROP POLICY IF EXISTS "Admins can manage divi modules" ON divi_modules;
DROP POLICY IF EXISTS "Anyone can view divi modules" ON divi_modules;

CREATE POLICY "Anyone can view divi modules"
  ON divi_modules
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert divi modules"
  ON divi_modules
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update divi modules"
  ON divi_modules
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete divi modules"
  ON divi_modules
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Fix multiple permissive policies on elementor_widgets
DROP POLICY IF EXISTS "Admins can manage elementor widgets" ON elementor_widgets;
DROP POLICY IF EXISTS "Anyone can view elementor widgets" ON elementor_widgets;

CREATE POLICY "Anyone can view elementor widgets"
  ON elementor_widgets
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert elementor widgets"
  ON elementor_widgets
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update elementor widgets"
  ON elementor_widgets
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete elementor widgets"
  ON elementor_widgets
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Fix multiple permissive policies on pages
DROP POLICY IF EXISTS "Admins can view all pages" ON pages;
DROP POLICY IF EXISTS "Anyone can view published pages" ON pages;

CREATE POLICY "Users can view published pages, admins view all"
  ON pages
  FOR SELECT
  TO authenticated
  USING (
    published = true OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Fix multiple permissive policies on site_settings
DROP POLICY IF EXISTS "Admins can manage settings" ON site_settings;
DROP POLICY IF EXISTS "Anyone can view settings" ON site_settings;

CREATE POLICY "Anyone can view settings"
  ON site_settings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert settings"
  ON site_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update settings"
  ON site_settings
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete settings"
  ON site_settings
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );