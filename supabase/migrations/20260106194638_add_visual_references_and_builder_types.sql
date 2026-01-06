/*
  # Add Visual References and Builder Type Support

  ## Overview
  This migration adds support for:
  1. Visual reference images that users can upload to show desired plugin output
  2. Specific builder module types (Divi, Elementor)
  3. Builder-specific configuration options

  ## Changes to Tables

  ### plugin_requests
  - Add `reference_images` (jsonb) - Array of image URLs for visual references
  - Add `builder_type` (text) - Type of builder module: divi, elementor, or null for standard plugin
  - Add `builder_config` (jsonb) - Builder-specific configuration options

  ## Notes
  - reference_images will store an array of image URLs
  - builder_type determines if this is a standard plugin or a builder module
  - builder_config stores module-specific settings like controls, styling options, etc.
*/

-- Add new columns to plugin_requests table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'plugin_requests' AND column_name = 'reference_images'
  ) THEN
    ALTER TABLE plugin_requests ADD COLUMN reference_images jsonb DEFAULT '[]'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'plugin_requests' AND column_name = 'builder_type'
  ) THEN
    ALTER TABLE plugin_requests ADD COLUMN builder_type text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'plugin_requests' AND column_name = 'builder_config'
  ) THEN
    ALTER TABLE plugin_requests ADD COLUMN builder_config jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Create index for builder_type for faster queries
CREATE INDEX IF NOT EXISTS idx_plugin_requests_builder_type ON plugin_requests(builder_type);