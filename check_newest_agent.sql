-- Check the newest GPT agent that was just created
-- Run this in the Supabase SQL Editor

-- 1. Check the most recent agent (from the logs: 72a57c5e-44a3-4e94-945c-839ad8defb51)
SELECT 
    id, 
    name, 
    created_by, 
    configuration->>'created_by_user' as created_by_user,
    configuration->>'source' as source,
    (SELECT email FROM app_user WHERE id = created_by) as created_by_email,
    created_at
FROM gpt_agent 
WHERE id = '72a57c5e-44a3-4e94-945c-839ad8defb51';

-- 2. Test RLS policy for this agent
SELECT 
    CASE 
        WHEN created_by = '229e38f9-ca7f-4b01-8614-34e529511c00'
        THEN '✅ UUID match - RLS should work!'
        WHEN configuration->>'created_by_user' = 'juliana.reyes@workleap.com'
        THEN '✅ Email match - RLS should work!'
        WHEN configuration->>'created_by_user' = 'juliana.reyes'
        THEN '✅ Username match - RLS should work!'
        ELSE '❌ No match - RLS will block'
    END as rls_test_result,
    created_by,
    '229e38f9-ca7f-4b01-8614-34e529511c00' as expected_user_id
FROM gpt_agent 
WHERE id = '72a57c5e-44a3-4e94-945c-839ad8defb51';

-- 3. Check current RLS policies
SELECT 
    policyname, 
    cmd as operation,
    qual as policy_condition
FROM pg_policies 
WHERE tablename = 'gpt_agent'
ORDER BY policyname;
