-- Remove the foreign key constraint causing infinite recursion
-- Run this in the Supabase SQL Editor

-- 1. Check current foreign key constraints
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    tc.constraint_type,
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

-- 2. Drop the problematic foreign key constraint
ALTER TABLE gpt_agent DROP CONSTRAINT IF EXISTS gpt_agent_created_by_fkey;

-- 3. Verify it's gone
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

-- 4. Test the query now (should work without infinite recursion)
SELECT COUNT(*) as total_gpt_agents FROM gpt_agent;
SELECT id, name, category, status, created_at FROM gpt_agent ORDER BY created_at DESC;

-- 5. The created_by column will still exist, just without the foreign key constraint
-- This means we can still store user IDs, but Supabase won't try to validate them
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'gpt_agent'
AND column_name = 'created_by';
