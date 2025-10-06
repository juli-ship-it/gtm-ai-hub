-- Check gpt_agent foreign key constraints and data
-- Run this in the Supabase SQL Editor

-- Check if created_by column allows null
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'gpt_agent'
AND column_name = 'created_by';

-- Check foreign key constraints
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

-- Check if there are any users in app_user table
SELECT COUNT(*) as user_count FROM app_user;
SELECT id, email FROM app_user LIMIT 5;

-- Check gpt_agent data with created_by values
SELECT id, name, created_by, created_at 
FROM gpt_agent 
ORDER BY created_at DESC;

-- If created_by doesn't allow null, make it nullable
-- ALTER TABLE gpt_agent ALTER COLUMN created_by DROP NOT NULL;
