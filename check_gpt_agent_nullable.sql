-- Check if gpt_agent.created_by allows null
-- Run this in the Supabase SQL Editor

-- Check column constraints
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'gpt_agent'
AND column_name = 'created_by';

-- If created_by doesn't allow null, we need to modify the table
-- This will make created_by nullable
ALTER TABLE gpt_agent ALTER COLUMN created_by DROP NOT NULL;

-- Verify the change
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'gpt_agent'
AND column_name = 'created_by';
