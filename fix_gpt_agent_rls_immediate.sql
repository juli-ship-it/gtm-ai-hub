-- Fix GPT agent RLS policies immediately
-- Run this in the Supabase SQL Editor

-- Check current RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'gpt_agent';

-- Drop all existing policies
DROP POLICY IF EXISTS "Allow all users to read gpt_agents" ON gpt_agent;
DROP POLICY IF EXISTS "Allow all users to insert gpt_agents" ON gpt_agent;
DROP POLICY IF EXISTS "Allow all users to update gpt_agents" ON gpt_agent;
DROP POLICY IF EXISTS "Allow all users to delete gpt_agents" ON gpt_agent;
DROP POLICY IF EXISTS "Allow all users to read active gpt_agents" ON gpt_agent;
DROP POLICY IF EXISTS "Allow all users to insert gpt_agents" ON gpt_agent;
DROP POLICY IF EXISTS "Allow all users to update gpt_agents" ON gpt_agent;
DROP POLICY IF EXISTS "Allow all users to delete gpt_agents" ON gpt_agent;

-- Create new permissive policies
CREATE POLICY "Allow all users to read gpt_agents" ON gpt_agent
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow all users to insert gpt_agents" ON gpt_agent
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Allow all users to update gpt_agents" ON gpt_agent
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all users to delete gpt_agents" ON gpt_agent
    FOR DELETE
    TO authenticated
    USING (true);

-- Verify policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'gpt_agent';

-- Test the query
SELECT COUNT(*) as total_gpt_agents FROM gpt_agent;
SELECT id, name, category, status, created_at FROM gpt_agent ORDER BY created_at DESC;
