-- Simple fix: temporarily disable RLS on gpt_agent table
-- Run this in the Supabase SQL Editor

-- 1. Disable RLS on gpt_agent table completely
ALTER TABLE gpt_agent DISABLE ROW LEVEL SECURITY;

-- 2. Test the query (should work now)
SELECT COUNT(*) as total_gpt_agents FROM gpt_agent;
SELECT id, name, category, status, created_at FROM gpt_agent ORDER BY created_at DESC;

-- 3. Verify RLS is disabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'gpt_agent';

-- 4. Show all GPT agents
SELECT 
    id, 
    name, 
    category, 
    status, 
    created_at,
    CASE 
        WHEN configuration->>'source' = 'slack_intake' THEN 'YES' 
        ELSE 'NO' 
    END as from_slack
FROM gpt_agent 
ORDER BY created_at DESC;
