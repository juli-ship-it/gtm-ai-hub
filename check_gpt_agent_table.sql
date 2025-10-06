-- Check if gpt_agent table exists and has data
-- Run this in the Supabase SQL Editor

-- Check if table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'gpt_agent';

-- Check table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'gpt_agent'
ORDER BY ordinal_position;

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'gpt_agent';

-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'gpt_agent';

-- Count existing GPT agents
SELECT COUNT(*) as total_gpt_agents FROM gpt_agent;

-- Show sample GPT agents
SELECT id, name, category, status, created_at 
FROM gpt_agent 
ORDER BY created_at DESC 
LIMIT 5;
