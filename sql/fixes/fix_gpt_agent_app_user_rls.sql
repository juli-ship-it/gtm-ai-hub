-- Fix the infinite recursion issue between gpt_agent and app_user
-- Run this in the Supabase SQL Editor

-- 1. First, let's check the current RLS policies on both tables
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename IN ('gpt_agent', 'app_user')
ORDER BY tablename, policyname;

-- 2. Drop ALL existing policies on both tables to break the recursion
DROP POLICY IF EXISTS "Allow all users to read gpt_agents" ON gpt_agent;
DROP POLICY IF EXISTS "Allow all users to insert gpt_agents" ON gpt_agent;
DROP POLICY IF EXISTS "Allow all users to update gpt_agents" ON gpt_agent;
DROP POLICY IF EXISTS "Allow all users to delete gpt_agents" ON gpt_agent;
DROP POLICY IF EXISTS "Allow all users to read active gpt_agents" ON gpt_agent;

-- Drop app_user policies that might be causing recursion
DROP POLICY IF EXISTS "Allow all users to read app_user" ON app_user;
DROP POLICY IF EXISTS "Allow all users to insert app_user" ON app_user;
DROP POLICY IF EXISTS "Allow all users to update app_user" ON app_user;
DROP POLICY IF EXISTS "Allow all users to delete app_user" ON app_user;

-- 3. Create simple, non-recursive policies for gpt_agent
CREATE POLICY "gpt_agent_select_policy" ON gpt_agent
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "gpt_agent_insert_policy" ON gpt_agent
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "gpt_agent_update_policy" ON gpt_agent
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "gpt_agent_delete_policy" ON gpt_agent
    FOR DELETE
    TO authenticated
    USING (true);

-- 4. Create simple, non-recursive policies for app_user
CREATE POLICY "app_user_select_policy" ON app_user
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "app_user_insert_policy" ON app_user
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "app_user_update_policy" ON app_user
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "app_user_delete_policy" ON app_user
    FOR DELETE
    TO authenticated
    USING (true);

-- 5. Verify the policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename IN ('gpt_agent', 'app_user')
ORDER BY tablename, policyname;

-- 6. Test the query
SELECT COUNT(*) as total_gpt_agents FROM gpt_agent;
SELECT id, name, category, status, created_at FROM gpt_agent ORDER BY created_at DESC LIMIT 5;
