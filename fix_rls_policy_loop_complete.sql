-- Complete fix for RLS policy loop between gpt_agent and app_user
-- Run this in the Supabase SQL Editor

-- 1. First, let's see all current policies on both tables
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename IN ('gpt_agent', 'app_user')
ORDER BY tablename, policyname;

-- 2. Drop ALL existing policies on both tables to completely break the loop
-- GPT Agent policies
DROP POLICY IF EXISTS "gpt_agent_select_policy" ON gpt_agent;
DROP POLICY IF EXISTS "gpt_agent_insert_policy" ON gpt_agent;
DROP POLICY IF EXISTS "gpt_agent_update_policy" ON gpt_agent;
DROP POLICY IF EXISTS "gpt_agent_delete_policy" ON gpt_agent;
DROP POLICY IF EXISTS "Allow all users to read gpt_agents" ON gpt_agent;
DROP POLICY IF EXISTS "Allow all users to insert gpt_agents" ON gpt_agent;
DROP POLICY IF EXISTS "Allow all users to update gpt_agents" ON gpt_agent;
DROP POLICY IF EXISTS "Allow all users to delete gpt_agents" ON gpt_agent;
DROP POLICY IF EXISTS "Allow all users to read active gpt_agents" ON gpt_agent;

-- App User policies
DROP POLICY IF EXISTS "app_user_select_policy" ON app_user;
DROP POLICY IF EXISTS "app_user_insert_policy" ON app_user;
DROP POLICY IF EXISTS "app_user_update_policy" ON app_user;
DROP POLICY IF EXISTS "app_user_delete_policy" ON app_user;
DROP POLICY IF EXISTS "Allow all users to read app_user" ON app_user;
DROP POLICY IF EXISTS "Allow all users to insert app_user" ON app_user;
DROP POLICY IF EXISTS "Allow all users to update app_user" ON app_user;
DROP POLICY IF EXISTS "Allow all users to delete app_user" ON app_user;

-- Drop any other policies that might exist
DROP POLICY IF EXISTS "Enable read access for all users" ON gpt_agent;
DROP POLICY IF EXISTS "Enable insert for all users" ON gpt_agent;
DROP POLICY IF EXISTS "Enable update for all users" ON gpt_agent;
DROP POLICY IF EXISTS "Enable delete for all users" ON gpt_agent;
DROP POLICY IF EXISTS "Enable read access for all users" ON app_user;
DROP POLICY IF EXISTS "Enable insert for all users" ON app_user;
DROP POLICY IF EXISTS "Enable update for all users" ON app_user;
DROP POLICY IF EXISTS "Enable delete for all users" ON app_user;

-- 3. Remove the foreign key constraint that's causing the circular dependency
ALTER TABLE gpt_agent DROP CONSTRAINT IF EXISTS gpt_agent_created_by_fkey;

-- 4. Create simple, isolated policies that don't reference each other
-- GPT Agent policies (completely independent)
CREATE POLICY "gpt_agent_read" ON gpt_agent
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "gpt_agent_write" ON gpt_agent
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "gpt_agent_update" ON gpt_agent
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "gpt_agent_delete" ON gpt_agent
    FOR DELETE
    TO authenticated
    USING (true);

-- App User policies (completely independent)
CREATE POLICY "app_user_read" ON app_user
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "app_user_write" ON app_user
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "app_user_update" ON app_user
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "app_user_delete" ON app_user
    FOR DELETE
    TO authenticated
    USING (true);

-- 5. Verify the policies are created correctly
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename IN ('gpt_agent', 'app_user')
ORDER BY tablename, policyname;

-- 6. Test the queries
SELECT 'Testing gpt_agent query...' as status;
SELECT COUNT(*) as total_gpt_agents FROM gpt_agent;
SELECT id, name, category, status, created_at FROM gpt_agent ORDER BY created_at DESC LIMIT 5;

SELECT 'Testing app_user query...' as status;
SELECT COUNT(*) as total_app_users FROM app_user;
SELECT id, email FROM app_user LIMIT 3;

-- 7. Verify no foreign key constraints exist
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    tc.constraint_type,
    kcu.column_name
FROM 
    information_schema.table_constraints AS tc 
    LEFT JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
WHERE tc.table_name='gpt_agent'
AND tc.constraint_type = 'FOREIGN KEY';
