/*
  # Create First Admin User

  1. Purpose
    - Creates the initial admin user account
    - Sets up admin profile with proper role
    - Provides a secure default password that must be changed on first login

  2. Changes
    - Inserts admin user into auth.users table if not exists
    - Creates corresponding profile with 'admin' role
    - Default credentials: admin@example.com / ChangeMe123!

  3. Security Notes
    - User MUST change password after first login
    - Email confirmation is set to true to allow immediate login
    - This is a one-time setup migration
*/

DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Check if admin user already exists
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'admin@example.com';

  -- If admin doesn't exist, create it
  IF admin_user_id IS NULL THEN
    -- Generate new UUID for admin user
    admin_user_id := gen_random_uuid();
    
    -- Insert admin user into auth.users
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      admin_user_id,
      'authenticated',
      'authenticated',
      'admin@example.com',
      crypt('ChangeMe123!', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    );

    -- Create admin profile
    INSERT INTO profiles (id, role, full_name, created_at, updated_at)
    VALUES (
      admin_user_id,
      'admin',
      'System Administrator',
      NOW(),
      NOW()
    );

    RAISE NOTICE 'Admin user created successfully with email: admin@example.com';
  ELSE
    -- Update existing user to admin role
    UPDATE profiles
    SET role = 'admin', full_name = 'System Administrator'
    WHERE id = admin_user_id;

    RAISE NOTICE 'Existing user updated to admin role';
  END IF;
END $$;
