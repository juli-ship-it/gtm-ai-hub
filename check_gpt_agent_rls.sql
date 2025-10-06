-- Check GPT agent RLS policies and data
-- Run this in the Supabase SQL Editor

-- Check if RLS is enabled on gpt_agent table
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'gpt_agent';

-- Check existing RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'gpt_agent';

-- Count total GPT agents (bypassing RLS)
SELECT COUNT(*) as total_gpt_agents FROM gpt_agent;

-- Show all GPT agents (bypassing RLS)
SELECT id, name, category, status, created_at, created_by
FROM gpt_agent 
ORDER BY created_at DESC;

-- Check if there are any policies that might be restricting access
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name='gpt_agent';
