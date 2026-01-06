/*
  # WordPress Plugin Builder Platform Schema

  ## Overview
  This migration creates the complete database schema for the AI-powered WordPress plugin builder platform.

  ## New Tables

  ### 1. profiles
  Extends Supabase auth.users with additional user information:
  - `id` (uuid, primary key, references auth.users)
  - `full_name` (text) - User's full name
  - `subscription_tier` (text) - Current subscription level: free, pro, enterprise
  - `subscription_status` (text) - Status: trial, active, cancelled, expired
  - `trial_ends_at` (timestamptz) - When trial period ends
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last profile update

  ### 2. plugin_requests
  Stores customer plugin requirements and specifications:
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `plugin_name` (text) - Desired plugin name
  - `plugin_type` (text) - Type: woocommerce, seo, membership, custom, etc.
  - `description` (text) - Detailed plugin description
  - `custom_features` (jsonb) - Array of requested features
  - `theme_compatibility` (jsonb) - Themes to test compatibility with
  - `status` (text) - Status: pending, generating, testing, completed, failed
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. generated_plugins
  Tracks generated plugins and download information:
  - `id` (uuid, primary key)
  - `request_id` (uuid, references plugin_requests)
  - `user_id` (uuid, references auth.users)
  - `plugin_file_url` (text) - URL to download the plugin
  - `version` (text) - Plugin version number
  - `test_site_url` (text, nullable) - Temporary WordPress test site URL
  - `download_count` (integer) - Number of times downloaded
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 4. subscriptions
  Manages Stripe subscription details:
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `stripe_customer_id` (text) - Stripe customer identifier
  - `stripe_subscription_id` (text) - Stripe subscription identifier
  - `plan_type` (text) - Plan: free, pro, enterprise
  - `status` (text) - Status: active, cancelled, past_due, trialing
  - `current_period_start` (timestamptz)
  - `current_period_end` (timestamptz)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Users can only access their own data
  - Authenticated users required for all operations
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text DEFAULT '',
  subscription_tier text DEFAULT 'free',
  subscription_status text DEFAULT 'trial',
  trial_ends_at timestamptz DEFAULT (now() + interval '14 days'),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create plugin_requests table
CREATE TABLE IF NOT EXISTS plugin_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plugin_name text NOT NULL,
  plugin_type text NOT NULL,
  description text DEFAULT '',
  custom_features jsonb DEFAULT '[]'::jsonb,
  theme_compatibility jsonb DEFAULT '[]'::jsonb,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE plugin_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own plugin requests"
  ON plugin_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create plugin requests"
  ON plugin_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own plugin requests"
  ON plugin_requests FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own plugin requests"
  ON plugin_requests FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create generated_plugins table
CREATE TABLE IF NOT EXISTS generated_plugins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid REFERENCES plugin_requests(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plugin_file_url text DEFAULT '',
  version text DEFAULT '1.0.0',
  test_site_url text,
  download_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE generated_plugins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own generated plugins"
  ON generated_plugins FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create generated plugins"
  ON generated_plugins FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own generated plugins"
  ON generated_plugins FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  stripe_customer_id text DEFAULT '',
  stripe_subscription_id text DEFAULT '',
  plan_type text DEFAULT 'free',
  status text DEFAULT 'trialing',
  current_period_start timestamptz DEFAULT now(),
  current_period_end timestamptz DEFAULT (now() + interval '14 days'),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription"
  ON subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
  ON subscriptions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_plugin_requests_user_id ON plugin_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_plugin_requests_status ON plugin_requests(status);
CREATE INDEX IF NOT EXISTS idx_generated_plugins_user_id ON generated_plugins(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_plugins_request_id ON generated_plugins(request_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_plugin_requests_updated_at ON plugin_requests;
CREATE TRIGGER update_plugin_requests_updated_at
  BEFORE UPDATE ON plugin_requests
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