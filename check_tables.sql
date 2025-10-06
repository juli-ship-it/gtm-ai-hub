-- Check what tables exist in the database
-- Run this in the Supabase SQL Editor

SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

