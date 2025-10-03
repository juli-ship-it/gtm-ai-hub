-- Migration: Create user sync trigger
-- This migration creates a trigger to automatically sync app_user table when auth users are created

-- Create a function to handle user creation sync
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.app_user (id, email, role, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    'runner', -- default role for new users
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users table
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create trigger on auth.users table for updates
CREATE OR REPLACE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add updated_at column to app_user table if it doesn't exist
ALTER TABLE public.app_user 
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT NOW();

-- Create trigger to update updated_at on app_user changes
CREATE OR REPLACE FUNCTION public.update_app_user_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER update_app_user_updated_at
  BEFORE UPDATE ON public.app_user
  FOR EACH ROW EXECUTE FUNCTION public.update_app_user_updated_at();

-- Sync existing auth users to app_user table
INSERT INTO public.app_user (id, email, role, created_at)
SELECT 
  id,
  email,
  'runner' as role,
  created_at
FROM auth.users
WHERE email IS NOT NULL
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  updated_at = NOW();

-- Add helpful comments
COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates app_user record when auth user is created';
COMMENT ON TRIGGER on_auth_user_created ON auth.users IS 'Triggers app_user creation when new auth user is created';
COMMENT ON TRIGGER on_auth_user_updated ON auth.users IS 'Triggers app_user update when auth user is updated';
