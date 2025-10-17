-- Fix RLS policies with proper permissions for gpt_agent and app_user
-- This script creates policies that respect ownership and admin privileges

-- 1. First, let's see all current policies on both tables
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename IN ('gpt_agent', 'app_user')
ORDER BY tablename, policyname;

-- 2. Drop ALL existing policies on all three tables to completely break the loop
-- First, let's drop all policies dynamically to avoid naming conflicts
DO $$
DECLARE
    pol RECORD;
BEGIN
    -- Drop all policies on gpt_agent
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'gpt_agent' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON gpt_agent', pol.policyname);
    END LOOP;
    
    -- Drop all policies on app_user
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'app_user' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON app_user', pol.policyname);
    END LOOP;
    
    -- Drop all policies on intake_request
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'intake_request' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON intake_request', pol.policyname);
    END LOOP;
END $$;

-- 3. Remove foreign key constraints that could cause circular dependencies
ALTER TABLE gpt_agent DROP CONSTRAINT IF EXISTS gpt_agent_created_by_fkey;
ALTER TABLE intake_request DROP CONSTRAINT IF EXISTS intake_request_requester_fkey;

-- 4. Create proper RLS policies for GPT Agents
-- Everyone can read all GPT agents
CREATE POLICY "gpt_agent_read_all" ON gpt_agent
    FOR SELECT
    TO authenticated
    USING (true);

-- Everyone can create GPT agents
CREATE POLICY "gpt_agent_create" ON gpt_agent
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Only the creator can update their own GPT agents
CREATE POLICY "gpt_agent_update_own" ON gpt_agent
    FOR UPDATE
    TO authenticated
    USING (created_by = auth.uid())
    WITH CHECK (created_by = auth.uid());

-- Only the creator can delete their own GPT agents
CREATE POLICY "gpt_agent_delete_own" ON gpt_agent
    FOR DELETE
    TO authenticated
    USING (created_by = auth.uid());

-- 5. Create proper RLS policies for App Users
-- Everyone can read all app users (needed for joins)
CREATE POLICY "app_user_read_all" ON app_user
    FOR SELECT
    TO authenticated
    USING (true);

-- Users can create their own app_user record
CREATE POLICY "app_user_create_own" ON app_user
    FOR INSERT
    TO authenticated
    WITH CHECK (id = auth.uid());

-- Users can update their own app_user record
CREATE POLICY "app_user_update_own" ON app_user
    FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- Only admins can delete app_user records (or users can delete their own)
CREATE POLICY "app_user_delete_own_or_admin" ON app_user
    FOR DELETE
    TO authenticated
    USING (
        id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM app_user 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 6. Create proper RLS policies for Intake Requests
-- (Policies already dropped in the dynamic section above)

-- Everyone can read all intake requests
CREATE POLICY "intake_request_read_all" ON intake_request
    FOR SELECT
    TO authenticated
    USING (true);

-- Everyone can create intake requests
CREATE POLICY "intake_request_create" ON intake_request
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Only the requester or admins can update intake requests
CREATE POLICY "intake_request_update_own_or_admin" ON intake_request
    FOR UPDATE
    TO authenticated
    USING (
        requester = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM app_user 
            WHERE id = auth.uid() AND role = 'admin'
        )
    )
    WITH CHECK (
        requester = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM app_user 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Only the requester or admins can delete intake requests
CREATE POLICY "intake_request_delete_own_or_admin" ON intake_request
    FOR DELETE
    TO authenticated
    USING (
        requester = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM app_user 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 7. Verify the policies are created correctly
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename IN ('gpt_agent', 'app_user', 'intake_request')
ORDER BY tablename, policyname;

-- 8. Test the queries
SELECT 'Testing gpt_agent query...' as status;
SELECT COUNT(*) as total_gpt_agents FROM gpt_agent;
SELECT id, name, category, status, created_at, created_by FROM gpt_agent ORDER BY created_at DESC LIMIT 5;

SELECT 'Testing app_user query...' as status;
SELECT COUNT(*) as total_app_users FROM app_user;
SELECT id, email, role FROM app_user LIMIT 3;

SELECT 'Testing intake_request query...' as status;
SELECT COUNT(*) as total_intake_requests FROM intake_request;
SELECT id, title, requester, status, created_at FROM intake_request ORDER BY created_at DESC LIMIT 5;

-- 9. Verify no foreign key constraints exist that could cause recursion
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
WHERE tc.table_name IN ('gpt_agent', 'intake_request')
AND tc.constraint_type = 'FOREIGN KEY';
