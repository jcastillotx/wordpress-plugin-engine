/*
  # Add Design Tool Integrations (Figma & Canva)

  ## Overview
  This migration adds the ability to connect to Figma and Canva accounts
  to import designs directly for conversion to Divi or Elementor layouts.

  ## New Tables

  ### design_tool_connections
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users) - User who owns the connection
  - `tool_name` (text) - Tool name: figma or canva
  - `access_token` (text) - Encrypted OAuth access token
  - `refresh_token` (text) - Encrypted OAuth refresh token
  - `token_expires_at` (timestamptz) - When the access token expires
  - `account_email` (text) - Connected account email
  - `account_name` (text) - Connected account display name
  - `metadata` (jsonb) - Additional connection metadata
  - `is_active` (boolean) - Whether the connection is active
  - `last_synced_at` (timestamptz) - Last time files were synced
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### imported_designs
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `connection_id` (uuid, references design_tool_connections)
  - `tool_name` (text) - Source tool: figma or canva
  - `external_id` (text) - ID in the external tool
  - `file_name` (text) - Name of the design file
  - `file_url` (text) - URL to the design in the external tool
  - `thumbnail_url` (text) - Thumbnail/preview image URL
  - `export_url` (text) - Exported image URL for conversion
  - `metadata` (jsonb) - File metadata (dimensions, pages, etc)
  - `imported_at` (timestamptz)
  - `created_at` (timestamptz)

  ## Security
  - Users can only view/manage their own connections
  - Tokens are stored securely (should be encrypted in production)
  - Comprehensive RLS policies
*/

-- Create design_tool_connections table
CREATE TABLE IF NOT EXISTS design_tool_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tool_name text NOT NULL,
  access_token text NOT NULL,
  refresh_token text,
  token_expires_at timestamptz,
  account_email text,
  account_name text,
  metadata jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  last_synced_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_tool_name CHECK (tool_name IN ('figma', 'canva')),
  CONSTRAINT unique_user_tool UNIQUE (user_id, tool_name)
);

ALTER TABLE design_tool_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own connections"
  ON design_tool_connections FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own connections"
  ON design_tool_connections FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own connections"
  ON design_tool_connections FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own connections"
  ON design_tool_connections FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create imported_designs table
CREATE TABLE IF NOT EXISTS imported_designs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  connection_id uuid REFERENCES design_tool_connections(id) ON DELETE CASCADE NOT NULL,
  tool_name text NOT NULL,
  external_id text NOT NULL,
  file_name text NOT NULL,
  file_url text,
  thumbnail_url text,
  export_url text,
  metadata jsonb DEFAULT '{}'::jsonb,
  imported_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_tool_name_import CHECK (tool_name IN ('figma', 'canva')),
  CONSTRAINT unique_external_file UNIQUE (user_id, tool_name, external_id)
);

ALTER TABLE imported_designs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own imports"
  ON imported_designs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own imports"
  ON imported_designs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own imports"
  ON imported_designs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own imports"
  ON imported_designs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_connections_user_id ON design_tool_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_connections_tool_name ON design_tool_connections(tool_name);
CREATE INDEX IF NOT EXISTS idx_connections_active ON design_tool_connections(is_active);
CREATE INDEX IF NOT EXISTS idx_imports_user_id ON imported_designs(user_id);
CREATE INDEX IF NOT EXISTS idx_imports_connection_id ON imported_designs(connection_id);
CREATE INDEX IF NOT EXISTS idx_imports_tool_name ON imported_designs(tool_name);
CREATE INDEX IF NOT EXISTS idx_imports_external_id ON imported_designs(external_id);

-- Create trigger for design_tool_connections updated_at
DROP TRIGGER IF EXISTS update_design_tool_connections_updated_at ON design_tool_connections;
CREATE TRIGGER update_design_tool_connections_updated_at
  BEFORE UPDATE ON design_tool_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();