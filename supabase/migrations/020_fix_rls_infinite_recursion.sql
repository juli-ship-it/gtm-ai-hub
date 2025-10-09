-- Fix RLS infinite recursion issue
-- The problem is circular dependencies between template and app_user policies

-- First, let's drop the problematic policies that cause infinite recursion
DO $$
BEGIN
    -- Drop existing template policies that might cause recursion
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'template' AND policyname = 'Users can view public templates') THEN
        DROP POLICY "Users can view public templates" ON template;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'template' AND policyname = 'Users can view their own templates') THEN
        DROP POLICY "Users can view their own templates" ON template;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'template' AND policyname = 'Users can create templates') THEN
        DROP POLICY "Users can create templates" ON template;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'template' AND policyname = 'Users can update their own templates') THEN
        DROP POLICY "Users can update their own templates" ON template;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'template' AND policyname = 'Users can delete their own templates') THEN
        DROP POLICY "Users can delete their own templates" ON template;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'template' AND policyname = 'Admins can manage all templates') THEN
        DROP POLICY "Admins can manage all templates" ON template;
    END IF;
END $$;

-- Create simplified, non-recursive policies
-- Allow all authenticated users to view public templates
CREATE POLICY "Allow authenticated users to view public templates" ON template
  FOR SELECT USING (
    auth.role() = 'authenticated' AND is_public = true
  );

-- Allow users to view their own templates (without checking app_user table)
CREATE POLICY "Allow users to view their own templates" ON template
  FOR SELECT USING (
    auth.role() = 'authenticated' AND created_by = auth.uid()
  );

-- Allow authenticated users to create templates
CREATE POLICY "Allow authenticated users to create templates" ON template
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND created_by = auth.uid()
  );

-- Allow users to update their own templates
CREATE POLICY "Allow users to update their own templates" ON template
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND created_by = auth.uid()
  );

-- Allow users to delete their own templates
CREATE POLICY "Allow users to delete their own templates" ON template
  FOR DELETE USING (
    auth.role() = 'authenticated' AND created_by = auth.uid()
  );

-- Fix template_variable policies to avoid recursion
DO $$
BEGIN
    -- Drop existing template_variable policies
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'template_variable' AND policyname = 'Users can view template variables for public templates') THEN
        DROP POLICY "Users can view template variables for public templates" ON template_variable;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'template_variable' AND policyname = 'Users can manage template variables for their own templates') THEN
        DROP POLICY "Users can manage template variables for their own templates" ON template_variable;
    END IF;
END $$;

-- Create simplified template_variable policies
CREATE POLICY "Allow viewing template variables for public templates" ON template_variable
  FOR SELECT USING (
    auth.role() = 'authenticated' AND 
    template_id IN (
      SELECT id FROM template WHERE is_public = true
    )
  );

CREATE POLICY "Allow viewing template variables for own templates" ON template_variable
  FOR SELECT USING (
    auth.role() = 'authenticated' AND 
    template_id IN (
      SELECT id FROM template WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Allow managing template variables for own templates" ON template_variable
  FOR ALL USING (
    auth.role() = 'authenticated' AND 
    template_id IN (
      SELECT id FROM template WHERE created_by = auth.uid()
    )
  );
