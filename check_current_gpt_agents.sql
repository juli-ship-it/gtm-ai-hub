-- Check current GPT agents and their created_by values to diagnose the issue
-- Run this in the Supabase SQL Editor

-- 1. Check all current GPT agents and their ownership details
SELECT 
    g.id,
    g.name,
    g.created_by,
    g.configuration->>'created_by_user' as slack_username,
    g.configuration->>'created_by_slack_id' as slack_user_id,
    g.configuration->>'source' as source,
    g.configuration->>'actual_creator' as scraped_creator,
    u.email as created_by_email,
    u.role as created_by_role,
    g.created_at
FROM gpt_agent g
LEFT JOIN app_user u ON g.created_by = u.id
ORDER BY g.created_at DESC;

-- 2. Check if juliana.reyes@workleap.com exists in app_user
SELECT 
    id, 
    email, 
    role,
    created_at
FROM app_user 
WHERE email = 'juliana.reyes@workleap.com';

-- 3. Check all users in app_user table
SELECT 
    id, 
    email, 
    role,
    created_at
FROM app_user 
ORDER BY created_at DESC;

-- 4. Test the user lookup logic that the Slack intake function uses
-- This simulates what happens when juliana.reyes submits via Slack
WITH test_lookup AS (
    SELECT 
        'juliana.reyes' as submitter_username,
        'juliana.reyes@workleap.com' as constructed_email
)
SELECT 
    t.submitter_username,
    t.constructed_email,
    u.id as found_user_id,
    u.email as found_user_email,
    u.role as found_user_role,
    CASE 
        WHEN u.id IS NOT NULL THEN '✅ User found - should work!'
        ELSE '❌ User not found - created_by will be null'
    END as lookup_result
FROM test_lookup t
LEFT JOIN app_user u ON u.email = t.constructed_email;

-- 5. Check for any GPT agents with null created_by
SELECT 
    COUNT(*) as agents_with_null_created_by
FROM gpt_agent 
WHERE created_by IS NULL;

-- 6. Check for any GPT agents with non-null created_by but no matching user
SELECT 
    g.id,
    g.name,
    g.created_by,
    g.configuration->>'created_by_user' as slack_username,
    '❌ created_by points to non-existent user' as issue
FROM gpt_agent g
LEFT JOIN app_user u ON g.created_by = u.id
WHERE g.created_by IS NOT NULL AND u.id IS NULL;

-- 7. Test RLS policy matching for juliana.reyes@workleap.com
SELECT 
    g.id,
    g.name,
    g.created_by,
    g.configuration->>'created_by_user' as slack_username,
    u.email as created_by_email,
    CASE 
        WHEN g.created_by = (SELECT id FROM app_user WHERE email = 'juliana.reyes@workleap.com')
        THEN '✅ UUID match - RLS should work!'
        WHEN g.configuration->>'created_by_user' = 'juliana.reyes@workleap.com'
        THEN '✅ Direct email match - RLS should work!'
        WHEN g.configuration->>'created_by_user' = 'juliana.reyes'
        THEN '✅ Username match - RLS should work!'
        WHEN g.created_by IS NULL
        THEN '⚠️ created_by is NULL - RLS depends on email matching'
        ELSE '❌ No match - RLS will block'
    END as rls_test_result
FROM gpt_agent g
LEFT JOIN app_user u ON g.created_by = u.id
ORDER BY g.created_at DESC;
