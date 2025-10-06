-- Fix RLS policies for gpt_agent table
-- Run this in the Supabase SQL Editor

-- First, check current RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'gpt_agent';

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all users to read gpt_agents" ON gpt_agent;
DROP POLICY IF EXISTS "Allow all users to insert gpt_agents" ON gpt_agent;
DROP POLICY IF EXISTS "Allow all users to update gpt_agents" ON gpt_agent;
DROP POLICY IF EXISTS "Allow all users to delete gpt_agents" ON gpt_agent;

-- Create permissive policies for all authenticated users
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

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'gpt_agent';

-- Test the query that the UI uses
SELECT COUNT(*) as total_gpt_agents FROM gpt_agent;
SELECT id, name, category, status, created_at FROM gpt_agent ORDER BY created_at DESC LIMIT 10;
