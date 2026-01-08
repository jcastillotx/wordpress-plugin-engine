/*
  # Add Integrations System

  1. New Tables
    - `api_keys`
      - `id` (uuid, primary key)
      - `service_name` (text) - e.g., 'stripe', 'openai', 'anthropic'
      - `key_type` (text) - e.g., 'secret_key', 'publishable_key', 'api_key'
      - `encrypted_value` (text) - encrypted API key value
      - `is_active` (boolean) - whether this key is currently active
      - `last_used_at` (timestamptz) - when the key was last used
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on `api_keys` table
    - Only admins can view and manage API keys
    - Add policies for secure access
  
  3. Notes
    - API keys should be encrypted at rest in production
    - This table stores third-party service credentials
    - Unique constraint on (service_name, key_type) to prevent duplicates
*/

CREATE TABLE IF NOT EXISTS api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name text NOT NULL,
  key_type text NOT NULL,
  encrypted_value text NOT NULL,
  is_active boolean DEFAULT true,
  last_used_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(service_name, key_type)
);

ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view API keys"
  ON api_keys
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can insert API keys"
  ON api_keys
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can update API keys"
  ON api_keys
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

CREATE POLICY "Only admins can delete API keys"
  ON api_keys
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );