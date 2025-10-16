-- Create a system user for intake requests
-- This user will be used for all automated intake requests

-- First, we need to create the user in auth.users
-- Since we can't do this directly, we'll create a system user with a known UUID
-- In production, you'd want to create this through Supabase Auth

-- Insert system user into app_user table
-- Note: This will only work if the corresponding auth.users entry exists
-- For now, we'll use a workaround by temporarily disabling the foreign key constraint

-- Create a system user entry
INSERT INTO app_user (id, email, role) 
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'system@workleap.com',
  'admin'
) 
ON CONFLICT (id) DO NOTHING;

-- Verify the user was created
SELECT * FROM app_user WHERE email = 'system@workleap.com';
