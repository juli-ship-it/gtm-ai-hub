-- Apply runner role permission changes
-- Run this script in the Supabase SQL Editor

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

-- ============================================================================
-- VERIFICATION
-- ============================================================================

SELECT 'Runner role permissions updated successfully!' as status;

-- Show current policies for verification
SELECT 
  tablename, 
  policyname, 
  cmd as operation
FROM pg_policies 
WHERE tablename IN ('template', 'prompt', 'gpt_agent', 'gpt_agent_config', 'playbook')
ORDER BY tablename, policyname;

-- Show role distribution
SELECT 
  role,
  COUNT(*) as user_count
FROM app_user 
GROUP BY role
ORDER BY role;
