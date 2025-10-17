-- Migration: Update runner role permissions
-- This migration implements the following runner role permissions:
-- 1. Runners can CREATE templates, prompts, and GPT agents
-- 2. Runners can EDIT only their own created content (except stage tracking)
-- 3. Runners can COMMENT on any content they can't edit
-- 4. Runners cannot edit content created by others

-- ============================================================================
-- TEMPLATE POLICIES
-- ============================================================================

-- Drop existing template policies that restrict runners
DROP POLICY IF EXISTS "Editors and admins can create templates" ON template;
DROP POLICY IF EXISTS "Editors and admins can update templates" ON template;
DROP POLICY IF EXISTS "Users can create templates" ON template;
DROP POLICY IF EXISTS "Users can update their own templates" ON template;
DROP POLICY IF EXISTS "Users can delete their own templates" ON template;

-- Create new template policies that allow runners to create and edit their own
CREATE POLICY "All authenticated users can create templates" ON template
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND created_by = auth.uid()
  );

CREATE POLICY "Users can update their own templates" ON template
  FOR UPDATE USING (
    created_by = auth.uid()
  );

CREATE POLICY "Users can delete their own templates" ON template
  FOR DELETE USING (
    created_by = auth.uid()
  );

-- Keep existing read policies (all authenticated users can read enabled templates)
-- Keep existing admin delete policy

-- ============================================================================
-- PROMPT POLICIES
-- ============================================================================

-- Drop existing prompt policies that restrict runners
DROP POLICY IF EXISTS "Editors and admins can create prompts" ON prompt;
DROP POLICY IF EXISTS "Editors and admins can update prompts" ON prompt;

-- Create new prompt policies that allow runners to create and edit their own
CREATE POLICY "All authenticated users can create prompts" ON prompt
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND created_by = auth.uid()
  );

CREATE POLICY "Users can update their own prompts" ON prompt
  FOR UPDATE USING (
    created_by = auth.uid()
  );

CREATE POLICY "Users can delete their own prompts" ON prompt
  FOR DELETE USING (
    created_by = auth.uid()
  );

-- Keep existing read policy (all authenticated users can read prompts)

-- ============================================================================
-- GPT AGENT POLICIES
-- ============================================================================

-- Drop existing GPT agent policies that restrict runners
DROP POLICY IF EXISTS "Allow admins to manage all gpt_agents" ON gpt_agent;

-- Create new GPT agent policies that allow runners to create and edit their own
CREATE POLICY "All authenticated users can create gpt_agents" ON gpt_agent
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND created_by = auth.uid()
  );

CREATE POLICY "Users can update their own gpt_agents" ON gpt_agent
  FOR UPDATE USING (
    created_by = auth.uid()
  );

CREATE POLICY "Users can delete their own gpt_agents" ON gpt_agent
  FOR DELETE USING (
    created_by = auth.uid()
  );

-- Keep existing read policy (all users can read active agents)

-- ============================================================================
-- GPT AGENT CONFIG POLICIES
-- ============================================================================

-- Drop existing GPT agent config policies that restrict runners
DROP POLICY IF EXISTS "Allow admins to manage all gpt_agent_config" ON gpt_agent_config;

-- Create new GPT agent config policies that allow runners to manage their own
CREATE POLICY "Users can manage their own gpt_agent_config" ON gpt_agent_config
  FOR ALL USING (
    agent_id IN (
      SELECT id FROM gpt_agent WHERE created_by = auth.uid()
    )
  );

-- ============================================================================
-- PLAYBOOK POLICIES
-- ============================================================================

-- Drop existing playbook policies that restrict runners
DROP POLICY IF EXISTS "Editors and admins can create playbooks" ON playbook;

-- Create new playbook policies that allow runners to create and edit their own
CREATE POLICY "All authenticated users can create playbooks" ON playbook
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND owner = auth.uid()
  );

-- Keep existing update policies (playbook owners can update, admins can update all)
-- Keep existing read policy (all authenticated users can read playbooks)

-- ============================================================================
-- COMMENT POLICIES (Already allow anyone to comment - keeping as is)
-- ============================================================================

-- Comment policies are already set up correctly:
-- - All authenticated users can read all comments
-- - All authenticated users can create comments
-- - Only comment authors can update/delete their own comments

-- ============================================================================
-- INTAKE REQUEST POLICIES (Already updated in previous migration)
-- ============================================================================

-- Intake request policies are already set up correctly:
-- - All authenticated users can read all requests
-- - Users can create their own requests
-- - Users can update their own requests (with field restrictions)
-- - juliana.reyes@workleap.com can update any field

-- ============================================================================
-- ADD HELPFUL COMMENTS
-- ============================================================================

COMMENT ON TABLE template IS 'Templates: All users can create, users can edit/delete their own, all can read enabled templates';
COMMENT ON TABLE prompt IS 'Prompts: All users can create, users can edit/delete their own, all can read';
COMMENT ON TABLE gpt_agent IS 'GPT Agents: All users can create, users can edit/delete their own, all can read active agents';
COMMENT ON TABLE playbook IS 'Playbooks: All users can create, owners can edit their own, admins can edit all, all can read';

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Show current policies for verification
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  cmd as operation,
  CASE 
    WHEN policyname LIKE '%create%' OR policyname LIKE '%insert%' THEN 'CREATE'
    WHEN policyname LIKE '%update%' THEN 'UPDATE'
    WHEN policyname LIKE '%delete%' THEN 'DELETE'
    WHEN policyname LIKE '%read%' OR policyname LIKE '%select%' THEN 'READ'
    ELSE 'OTHER'
  END as permission_type
FROM pg_policies 
WHERE tablename IN ('template', 'prompt', 'gpt_agent', 'gpt_agent_config', 'playbook', 'intake_comment')
ORDER BY tablename, policyname;

-- Show role distribution
SELECT 
  role,
  COUNT(*) as user_count
FROM app_user 
GROUP BY role
ORDER BY role;
