-- Complete RLS fix - remove all problematic policies and recreate them properly
-- This will fix the infinite recursion issue once and for all

-- First, completely disable RLS temporarily to clear all policies
ALTER TABLE template DISABLE ROW LEVEL SECURITY;
ALTER TABLE template_variable DISABLE ROW LEVEL SECURITY;
ALTER TABLE template_run DISABLE ROW LEVEL SECURITY;
ALTER TABLE template_execution_context DISABLE ROW LEVEL SECURITY;
ALTER TABLE template_favorite DISABLE ROW LEVEL SECURITY;
ALTER TABLE template_rating DISABLE ROW LEVEL SECURITY;
ALTER TABLE template_version DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies to start fresh
DO $$
DECLARE
    pol RECORD;
BEGIN
    -- Drop all policies on template table
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'template' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON template', pol.policyname);
    END LOOP;
    
    -- Drop all policies on template_variable table
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'template_variable' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON template_variable', pol.policyname);
    END LOOP;
    
    -- Drop all policies on template_run table
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'template_run' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON template_run', pol.policyname);
    END LOOP;
    
    -- Drop all policies on template_execution_context table
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'template_execution_context' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON template_execution_context', pol.policyname);
    END LOOP;
    
    -- Drop all policies on template_favorite table
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'template_favorite' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON template_favorite', pol.policyname);
    END LOOP;
    
    -- Drop all policies on template_rating table
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'template_rating' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON template_rating', pol.policyname);
    END LOOP;
    
    -- Drop all policies on template_version table
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'template_version' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON template_version', pol.policyname);
    END LOOP;
END $$;

-- Re-enable RLS
ALTER TABLE template ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_variable ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_run ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_execution_context ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_favorite ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_rating ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_version ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies for template table
CREATE POLICY "template_select_public" ON template
  FOR SELECT USING (is_public = true);

CREATE POLICY "template_select_own" ON template
  FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "template_insert" ON template
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "template_update_own" ON template
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "template_delete_own" ON template
  FOR DELETE USING (created_by = auth.uid());

-- Create simple policies for template_variable table
CREATE POLICY "template_variable_select_public" ON template_variable
  FOR SELECT USING (
    template_id IN (
      SELECT id FROM template WHERE is_public = true
    )
  );

CREATE POLICY "template_variable_select_own" ON template_variable
  FOR SELECT USING (
    template_id IN (
      SELECT id FROM template WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "template_variable_all_own" ON template_variable
  FOR ALL USING (
    template_id IN (
      SELECT id FROM template WHERE created_by = auth.uid()
    )
  );

-- Create simple policies for template_run table
CREATE POLICY "template_run_select_own" ON template_run
  FOR SELECT USING (triggered_by = auth.uid());

CREATE POLICY "template_run_insert" ON template_run
  FOR INSERT WITH CHECK (triggered_by = auth.uid());

CREATE POLICY "template_run_update_own" ON template_run
  FOR UPDATE USING (triggered_by = auth.uid());

-- Create simple policies for template_execution_context table
CREATE POLICY "template_execution_context_select_own" ON template_execution_context
  FOR SELECT USING (
    template_run_id IN (
      SELECT id FROM template_run WHERE triggered_by = auth.uid()
    )
  );

CREATE POLICY "template_execution_context_insert" ON template_execution_context
  FOR INSERT WITH CHECK (
    template_run_id IN (
      SELECT id FROM template_run WHERE triggered_by = auth.uid()
    )
  );

-- Create simple policies for template_favorite table
CREATE POLICY "template_favorite_all_own" ON template_favorite
  FOR ALL USING (user_id = auth.uid());

-- Create simple policies for template_rating table
CREATE POLICY "template_rating_all_own" ON template_rating
  FOR ALL USING (user_id = auth.uid());

-- Create simple policies for template_version table
CREATE POLICY "template_version_select_public" ON template_version
  FOR SELECT USING (
    template_id IN (
      SELECT id FROM template WHERE is_public = true
    )
  );

CREATE POLICY "template_version_select_own" ON template_version
  FOR SELECT USING (
    template_id IN (
      SELECT id FROM template WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "template_version_all_own" ON template_version
  FOR ALL USING (
    template_id IN (
      SELECT id FROM template WHERE created_by = auth.uid()
    )
  );
