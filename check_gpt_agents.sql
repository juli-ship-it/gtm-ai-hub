-- Check if GPT agents table exists and its structure
-- Run this in the Supabase SQL Editor

-- Check if gpt_agent table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'gpt_agent'
) as gpt_agent_exists;

-- If it exists, show its structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'gpt_agent'
ORDER BY ordinal_position;

-- Check for any tables with 'gpt' in the name
SELECT 
    schemaname,
    tablename
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename LIKE '%gpt%'
ORDER BY tablename;

