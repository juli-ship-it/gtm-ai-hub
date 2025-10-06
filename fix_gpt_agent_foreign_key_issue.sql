-- Aggressive fix for GPT agent foreign key RLS issue
-- Run this in the Supabase SQL Editor

-- 1. First, let's temporarily drop the foreign key constraint
-- This will break the circular dependency between gpt_agent and app_user
ALTER TABLE gpt_agent DROP CONSTRAINT IF EXISTS gpt_agent_created_by_fkey;

-- 2. Verify the constraint is gone
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

-- 3. Test the query now
SELECT COUNT(*) as total_gpt_agents FROM gpt_agent;
SELECT id, name, category, status, created_at FROM gpt_agent ORDER BY created_at DESC;

-- 4. If this works, we can add the constraint back later with a different approach
-- For now, let's just make sure the data is accessible

-- 5. Also, let's make sure the created_by column allows null (it should already)
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'gpt_agent'
AND column_name = 'created_by';
