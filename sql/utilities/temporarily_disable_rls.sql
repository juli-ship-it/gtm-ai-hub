-- Temporarily disable RLS on intake_request table to test
-- Run this in the Supabase SQL Editor

-- Disable RLS temporarily
ALTER TABLE intake_request DISABLE ROW LEVEL SECURITY;

-- Test query to see if data exists
SELECT COUNT(*) as total_requests FROM intake_request;

-- Show sample data
SELECT id, title, status, priority, created_at, slack_username 
FROM intake_request 
ORDER BY created_at DESC 
LIMIT 5;
