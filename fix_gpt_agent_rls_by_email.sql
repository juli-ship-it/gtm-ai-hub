-- Fix GPT agent RLS policies to match by email instead of UUID
-- This is more reliable since the configuration contains the actual submitter email
-- Run this in the Supabase SQL Editor

-- First, check current RLS status and policies
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'gpt_agent';

-- Show all existing policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'gpt_agent';

-- Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Allow all users to read gpt_agents" ON gpt_agent;
DROP POLICY IF EXISTS "Allow all users to insert gpt_agents" ON gpt_agent;
DROP POLICY IF EXISTS "Allow all users to update gpt_agents" ON gpt_agent;
DROP POLICY IF EXISTS "Allow all users to delete gpt_agents" ON gpt_agent;
DROP POLICY IF EXISTS "Allow all users to read active gpt_agents" ON gpt_agent;
DROP POLICY IF EXISTS "All authenticated users can create gpt_agents" ON gpt_agent;
DROP POLICY IF EXISTS "Users can update their own gpt_agents" ON gpt_agent;
DROP POLICY IF EXISTS "Users can delete their own gpt_agents" ON gpt_agent;
DROP POLICY IF EXISTS "Allow admins to manage all gpt_agents" ON gpt_agent;
DROP POLICY IF EXISTS "gpt_agent_select_policy" ON gpt_agent;
DROP POLICY IF EXISTS "gpt_agent_insert_policy" ON gpt_agent;
DROP POLICY IF EXISTS "gpt_agent_update_policy" ON gpt_agent;
DROP POLICY IF EXISTS "gpt_agent_delete_policy" ON gpt_agent;

-- Create email-based RLS policies
-- 1. Allow all authenticated users to read active agents
CREATE POLICY "Allow read active gpt_agents" ON gpt_agent
    FOR SELECT
    TO authenticated
    USING (status = 'active');

-- 2. Allow users to create agents (they become the creator)
CREATE POLICY "Allow users to create gpt_agents" ON gpt_agent
    FOR INSERT
    TO authenticated
    WITH CHECK (created_by = auth.uid());

-- 3. Allow users to update agents they submitted (match by email in configuration)
CREATE POLICY "Allow users to update own gpt_agents_by_email" ON gpt_agent
    FOR UPDATE
    TO authenticated
    USING (
        -- Match by created_by UUID (for properly created agents)
        created_by = auth.uid()
        OR
        -- Match by email in configuration (for Slack-submitted agents)
        (
            configuration->>'created_by_user' IS NOT NULL 
            AND (
                -- Direct email match
                configuration->>'created_by_user' = (SELECT email FROM app_user WHERE id = auth.uid())
                OR
                -- Username match (juliana.reyes matches juliana.reyes@workleap.com)
                configuration->>'created_by_user' = split_part((SELECT email FROM app_user WHERE id = auth.uid()), '@', 1)
                OR
                -- Reverse match (juliana.reyes@workleap.com matches juliana.reyes)
                split_part(configuration->>'created_by_user', '@', 1) = split_part((SELECT email FROM app_user WHERE id = auth.uid()), '@', 1)
            )
        )
    )
    WITH CHECK (
        -- Same logic for WITH CHECK
        created_by = auth.uid()
        OR
        (
            configuration->>'created_by_user' IS NOT NULL 
            AND (
                configuration->>'created_by_user' = (SELECT email FROM app_user WHERE id = auth.uid())
                OR
                configuration->>'created_by_user' = split_part((SELECT email FROM app_user WHERE id = auth.uid()), '@', 1)
                OR
                split_part(configuration->>'created_by_user', '@', 1) = split_part((SELECT email FROM app_user WHERE id = auth.uid()), '@', 1)
            )
        )
    );

-- 4. Allow users to delete agents they submitted
CREATE POLICY "Allow users to delete own gpt_agents_by_email" ON gpt_agent
    FOR DELETE
    TO authenticated
    USING (
        created_by = auth.uid()
        OR
        (
            configuration->>'created_by_user' IS NOT NULL 
            AND (
                configuration->>'created_by_user' = (SELECT email FROM app_user WHERE id = auth.uid())
                OR
                configuration->>'created_by_user' = split_part((SELECT email FROM app_user WHERE id = auth.uid()), '@', 1)
                OR
                split_part(configuration->>'created_by_user', '@', 1) = split_part((SELECT email FROM app_user WHERE id = auth.uid()), '@', 1)
            )
        )
    );

-- Verify the new policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'gpt_agent'
ORDER BY policyname;

-- Test: Check current agent data to see the email matching
SELECT 
    id, 
    name, 
    created_by, 
    configuration->>'created_by_user' as created_by_user,
    (SELECT email FROM app_user WHERE id = created_by) as created_by_email
FROM gpt_agent 
ORDER BY created_at DESC 
LIMIT 10;
