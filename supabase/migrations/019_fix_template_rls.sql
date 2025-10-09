-- Fix RLS policies for template table
-- The template table has RLS enabled but no policies, blocking all access

DO $$ 
BEGIN
    -- Enable RLS on template table if not already enabled
    ALTER TABLE template ENABLE ROW LEVEL SECURITY;
    
    -- Policy for viewing templates - everyone can view public templates
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'template' AND policyname = 'Everyone can view public templates') THEN
        CREATE POLICY "Everyone can view public templates" ON template
          FOR SELECT USING (is_public = true);
    END IF;
    
    -- Policy for viewing own templates
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'template' AND policyname = 'Users can view their own templates') THEN
        CREATE POLICY "Users can view their own templates" ON template
          FOR SELECT USING (created_by = auth.uid());
    END IF;
    
    -- Policy for creating templates
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'template' AND policyname = 'Users can create templates') THEN
        CREATE POLICY "Users can create templates" ON template
          FOR INSERT WITH CHECK (created_by = auth.uid());
    END IF;
    
    -- Policy for updating own templates
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'template' AND policyname = 'Users can update their own templates') THEN
        CREATE POLICY "Users can update their own templates" ON template
          FOR UPDATE USING (created_by = auth.uid());
    END IF;
    
    -- Policy for deleting own templates
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'template' AND policyname = 'Users can delete their own templates') THEN
        CREATE POLICY "Users can delete their own templates" ON template
          FOR DELETE USING (created_by = auth.uid());
    END IF;
    
    -- Admin policy for full access
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'template' AND policyname = 'Admins have full access to templates') THEN
        CREATE POLICY "Admins have full access to templates" ON template
          FOR ALL USING (
            EXISTS (
              SELECT 1 FROM app_user 
              WHERE id = auth.uid() AND role = 'admin'
            )
          );
    END IF;
    
END $$;
