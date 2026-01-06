/*
  # Add Design-to-Code Conversion System

  ## Overview
  This migration adds the ability to convert design images to HTML/CSS,
  Divi layouts, or Elementor layouts with automatic companion plugin generation.

  ## New Tables

  ### design_conversions
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users) - User who created the conversion
  - `name` (text) - Name/title for the conversion
  - `image_url` (text) - URL of the uploaded design image
  - `conversion_type` (text) - Type: html, divi, elementor
  - `status` (text) - Status: pending, analyzing, generating, completed, failed
  - `prompt` (text) - Additional instructions from user
  - `result` (jsonb) - Generated code/layout data
  - `companion_plugin` (jsonb) - Companion plugin data if needed
  - `needs_companion_plugin` (boolean) - Whether a companion plugin was generated
  - `analysis` (jsonb) - AI analysis of the design
  - `error_message` (text) - Error message if failed
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  - `completed_at` (timestamptz) - When conversion completed

  ### divi_modules
  - `id` (uuid, primary key)
  - `name` (text) - Module name
  - `slug` (text, unique) - Module slug
  - `category` (text) - Category (basic, layout, content, etc)
  - `capabilities` (jsonb) - What the module can do
  - `is_baseline` (boolean) - Whether it's a baseline Divi module
  - `created_at` (timestamptz)

  ### elementor_widgets
  - `id` (uuid, primary key)
  - `name` (text) - Widget name
  - `slug` (text, unique) - Widget slug
  - `category` (text) - Category
  - `capabilities` (jsonb) - What the widget can do
  - `is_baseline` (boolean) - Whether it's a baseline Elementor widget
  - `created_at` (timestamptz)

  ## Security
  - Users can only view their own conversions
  - Admins can view all conversions
  - Comprehensive RLS policies
*/

-- Create design_conversions table
CREATE TABLE IF NOT EXISTS design_conversions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  image_url text NOT NULL,
  conversion_type text NOT NULL DEFAULT 'html',
  status text NOT NULL DEFAULT 'pending',
  prompt text DEFAULT '',
  result jsonb DEFAULT '{}'::jsonb,
  companion_plugin jsonb,
  needs_companion_plugin boolean DEFAULT false,
  analysis jsonb DEFAULT '{}'::jsonb,
  error_message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  CONSTRAINT valid_conversion_type CHECK (conversion_type IN ('html', 'divi', 'elementor')),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'analyzing', 'generating', 'completed', 'failed'))
);

ALTER TABLE design_conversions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversions"
  ON design_conversions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all conversions"
  ON design_conversions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can create conversions"
  ON design_conversions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversions"
  ON design_conversions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversions"
  ON design_conversions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create divi_modules table
CREATE TABLE IF NOT EXISTS divi_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  category text NOT NULL DEFAULT 'basic',
  capabilities jsonb DEFAULT '{}'::jsonb,
  is_baseline boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE divi_modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view divi modules"
  ON divi_modules FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage divi modules"
  ON divi_modules FOR ALL
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

-- Create elementor_widgets table
CREATE TABLE IF NOT EXISTS elementor_widgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  category text NOT NULL DEFAULT 'basic',
  capabilities jsonb DEFAULT '{}'::jsonb,
  is_baseline boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE elementor_widgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view elementor widgets"
  ON elementor_widgets FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage elementor widgets"
  ON elementor_widgets FOR ALL
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_design_conversions_user_id ON design_conversions(user_id);
CREATE INDEX IF NOT EXISTS idx_design_conversions_status ON design_conversions(status);
CREATE INDEX IF NOT EXISTS idx_design_conversions_type ON design_conversions(conversion_type);
CREATE INDEX IF NOT EXISTS idx_design_conversions_created ON design_conversions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_divi_modules_slug ON divi_modules(slug);
CREATE INDEX IF NOT EXISTS idx_divi_modules_category ON divi_modules(category);
CREATE INDEX IF NOT EXISTS idx_elementor_widgets_slug ON elementor_widgets(slug);
CREATE INDEX IF NOT EXISTS idx_elementor_widgets_category ON elementor_widgets(category);

-- Create trigger for design_conversions updated_at
DROP TRIGGER IF EXISTS update_design_conversions_updated_at ON design_conversions;
CREATE TRIGGER update_design_conversions_updated_at
  BEFORE UPDATE ON design_conversions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert baseline Divi modules
INSERT INTO divi_modules (name, slug, category, capabilities, is_baseline) VALUES
  ('Text', 'et_pb_text', 'basic', '{"text": true, "formatting": true, "typography": true}', true),
  ('Image', 'et_pb_image', 'basic', '{"image": true, "alignment": true, "link": true}', true),
  ('Button', 'et_pb_button', 'basic', '{"text": true, "link": true, "style": true, "icon": true}', true),
  ('Blurb', 'et_pb_blurb', 'basic', '{"icon": true, "image": true, "text": true, "title": true}', true),
  ('Section', 'et_pb_section', 'layout', '{"columns": true, "background": true, "padding": true}', true),
  ('Row', 'et_pb_row', 'layout', '{"columns": true, "gutter": true}', true),
  ('Column', 'et_pb_column', 'layout', '{"width": true, "background": true}', true),
  ('Video', 'et_pb_video', 'media', '{"video": true, "youtube": true, "vimeo": true}', true),
  ('Gallery', 'et_pb_gallery', 'media', '{"images": true, "columns": true, "lightbox": true}', true),
  ('Slider', 'et_pb_slider', 'media', '{"slides": true, "autoplay": true, "controls": true}', true),
  ('Accordion', 'et_pb_accordion', 'content', '{"items": true, "toggle": true}', true),
  ('Tabs', 'et_pb_tabs', 'content', '{"tabs": true, "content": true}', true),
  ('Toggle', 'et_pb_toggle', 'content', '{"title": true, "content": true, "icon": true}', true),
  ('Contact Form', 'et_pb_contact_form', 'content', '{"fields": true, "validation": true, "email": true}', true),
  ('Divider', 'et_pb_divider', 'basic', '{"style": true, "color": true, "width": true}', true),
  ('Code', 'et_pb_code', 'basic', '{"html": true, "css": true, "javascript": true}', true)
ON CONFLICT (slug) DO NOTHING;

-- Insert baseline Elementor widgets
INSERT INTO elementor_widgets (name, slug, category, capabilities, is_baseline) VALUES
  ('Heading', 'heading', 'basic', '{"text": true, "typography": true, "alignment": true, "tag": true}', true),
  ('Text Editor', 'text-editor', 'basic', '{"text": true, "formatting": true, "typography": true}', true),
  ('Image', 'image', 'basic', '{"image": true, "alignment": true, "link": true, "caption": true}', true),
  ('Button', 'button', 'basic', '{"text": true, "link": true, "style": true, "icon": true}', true),
  ('Divider', 'divider', 'basic', '{"style": true, "alignment": true, "width": true}', true),
  ('Spacer', 'spacer', 'basic', '{"height": true, "responsive": true}', true),
  ('Icon', 'icon', 'basic', '{"icon": true, "size": true, "color": true, "link": true}', true),
  ('Icon Box', 'icon-box', 'general', '{"icon": true, "title": true, "description": true, "link": true}', true),
  ('Image Box', 'image-box', 'general', '{"image": true, "title": true, "description": true, "link": true}', true),
  ('Video', 'video', 'general', '{"youtube": true, "vimeo": true, "hosted": true, "controls": true}', true),
  ('Section', 'section', 'layout', '{"columns": true, "background": true, "height": true}', true),
  ('Column', 'column', 'layout', '{"width": true, "background": true, "padding": true}', true),
  ('Tabs', 'tabs', 'general', '{"tabs": true, "content": true, "icon": true}', true),
  ('Accordion', 'accordion', 'general', '{"items": true, "icon": true, "toggle": true}', true),
  ('Toggle', 'toggle', 'general', '{"title": true, "content": true, "icon": true}', true),
  ('Gallery', 'gallery', 'general', '{"images": true, "columns": true, "lightbox": true}', true),
  ('Form', 'form', 'general', '{"fields": true, "validation": true, "actions": true}', true),
  ('HTML', 'html', 'general', '{"html": true, "css": true, "javascript": true}', true)
ON CONFLICT (slug) DO NOTHING;