-- Comprehensive debug for GPT agent access issues
-- Run this in the Supabase SQL Editor

-- 1. Check RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'gpt_agent';

-- 2. Check all policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'gpt_agent';

-- 3. Count with different approaches
SELECT 'Direct count' as method, COUNT(*) as count FROM gpt_agent
UNION ALL
SELECT 'With auth context' as method, COUNT(*) as count FROM gpt_agent WHERE true
UNION ALL
SELECT 'With specific user' as method, COUNT(*) as count FROM gpt_agent WHERE created_by IS NULL;

-- 4. Check if there are any hidden columns or data issues
SELECT 
    id, 
    name, 
    category, 
    status, 
    created_at,
    created_by,
    CASE WHEN created_by IS NULL THEN 'NULL' ELSE 'HAS_VALUE' END as created_by_status
FROM gpt_agent 
ORDER BY created_at DESC;

-- 5. Check if there are any constraints or triggers affecting visibility
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
WHERE tc.table_name='gpt_agent';

-- 6. Try to temporarily disable RLS to test
-- ALTER TABLE gpt_agent DISABLE ROW LEVEL SECURITY;
-- SELECT COUNT(*) as count_with_rls_disabled FROM gpt_agent;
-- ALTER TABLE gpt_agent ENABLE ROW LEVEL SECURITY;
