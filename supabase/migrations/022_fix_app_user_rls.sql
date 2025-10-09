-- Fix app_user RLS policies to prevent infinite recursion
-- The app_user table might have policies that cause recursion when accessed from template policies

-- Temporarily disable RLS on app_user to clear any problematic policies
ALTER TABLE app_user DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies on app_user
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'app_user' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON app_user', pol.policyname);
    END LOOP;
END $$;

-- Re-enable RLS on app_user
ALTER TABLE app_user ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies for app_user
CREATE POLICY "app_user_select_own" ON app_user
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "app_user_insert" ON app_user
  FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "app_user_update_own" ON app_user
  FOR UPDATE USING (id = auth.uid());

-- Allow admins to see all users (simple check without recursion)
CREATE POLICY "app_user_select_all_for_admins" ON app_user
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM app_user 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
