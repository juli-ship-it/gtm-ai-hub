-- Template enhancements migration (safe version)
-- This migration only adds the essential template functionality

-- Add new columns to template table (if they don't exist)
DO $$ 
BEGIN
    -- Add n8n_workflow_json column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'template' AND column_name = 'n8n_workflow_json') THEN
        ALTER TABLE template ADD COLUMN n8n_workflow_json jsonb;
    END IF;
    
    -- Add workflow_variables column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'template' AND column_name = 'workflow_variables') THEN
        ALTER TABLE template ADD COLUMN workflow_variables jsonb;
    END IF;
    
    -- Add execution_instructions column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'template' AND column_name = 'execution_instructions') THEN
        ALTER TABLE template ADD COLUMN execution_instructions text;
    END IF;
    
    -- Add estimated_duration_minutes column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'template' AND column_name = 'estimated_duration_minutes') THEN
        ALTER TABLE template ADD COLUMN estimated_duration_minutes integer;
    END IF;
    
    -- Add tags column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'template' AND column_name = 'tags') THEN
        ALTER TABLE template ADD COLUMN tags text[];
    END IF;
    
    -- Add difficulty_level column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'template' AND column_name = 'difficulty_level') THEN
        ALTER TABLE template ADD COLUMN difficulty_level text;
    END IF;
    
    -- Add systems_required column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'template' AND column_name = 'systems_required') THEN
        ALTER TABLE template ADD COLUMN systems_required text[];
    END IF;
    
    -- Add file_requirements column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'template' AND column_name = 'file_requirements') THEN
        ALTER TABLE template ADD COLUMN file_requirements jsonb;
    END IF;
    
    -- Add is_public column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'template' AND column_name = 'is_public') THEN
        ALTER TABLE template ADD COLUMN is_public boolean DEFAULT true;
    END IF;
    
    -- Add last_modified_at column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'template' AND column_name = 'last_modified_at') THEN
        ALTER TABLE template ADD COLUMN last_modified_at timestamptz DEFAULT now();
    END IF;
END $$;

-- Create template_variable table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS template_variable (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES template(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL,
  required boolean DEFAULT false,
  description text,
  default_value jsonb,
  validation_rules jsonb,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create template_execution_context table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS template_execution_context (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_run_id uuid REFERENCES template_run(id) ON DELETE CASCADE,
  variable_name text NOT NULL,
  variable_value jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create template_favorite table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS template_favorite (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES template(id) ON DELETE CASCADE,
  user_id uuid REFERENCES app_user(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Create template_rating table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS template_rating (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES template(id) ON DELETE CASCADE,
  user_id uuid REFERENCES app_user(id) ON DELETE CASCADE,
  rating integer,
  feedback text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create template_version table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS template_version (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES template(id) ON DELETE CASCADE,
  version_number text NOT NULL,
  n8n_workflow_json jsonb NOT NULL,
  workflow_variables jsonb,
  changelog text,
  is_active boolean DEFAULT false,
  created_by uuid REFERENCES app_user(id),
  created_at timestamptz DEFAULT now()
);

-- Add indexes (if they don't exist)
CREATE INDEX IF NOT EXISTS idx_template_variable_template_id ON template_variable(template_id);
CREATE INDEX IF NOT EXISTS idx_template_execution_context_template_run_id ON template_execution_context(template_run_id);
CREATE INDEX IF NOT EXISTS idx_template_favorite_template_id ON template_favorite(template_id);
CREATE INDEX IF NOT EXISTS idx_template_favorite_user_id ON template_favorite(user_id);
CREATE INDEX IF NOT EXISTS idx_template_rating_template_id ON template_rating(template_id);
CREATE INDEX IF NOT EXISTS idx_template_rating_user_id ON template_rating(user_id);
CREATE INDEX IF NOT EXISTS idx_template_version_template_id ON template_version(template_id);
CREATE INDEX IF NOT EXISTS idx_template_tags ON template USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_template_systems_required ON template USING GIN(systems_required);

-- Enable RLS (if not already enabled)
ALTER TABLE template_variable ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_execution_context ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_favorite ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_rating ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_version ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies (if they don't exist)
DO $$ 
BEGIN
    -- Template variable policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'template_variable' AND policyname = 'Users can view template variables for public templates') THEN
        CREATE POLICY "Users can view template variables for public templates" ON template_variable
          FOR SELECT USING (
            template_id IN (
              SELECT id FROM template WHERE is_public = true
            )
          );
    END IF;

    -- Template execution context policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'template_execution_context' AND policyname = 'Users can view their own execution context') THEN
        CREATE POLICY "Users can view their own execution context" ON template_execution_context
          FOR SELECT USING (
            template_run_id IN (
              SELECT id FROM template_run WHERE triggered_by = auth.uid()
            )
          );
    END IF;

    -- Template favorite policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'template_favorite' AND policyname = 'Users can manage their own favorites') THEN
        CREATE POLICY "Users can manage their own favorites" ON template_favorite
          FOR ALL USING (user_id = auth.uid());
    END IF;

    -- Template rating policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'template_rating' AND policyname = 'Users can manage their own ratings') THEN
        CREATE POLICY "Users can manage their own ratings" ON template_rating
          FOR ALL USING (user_id = auth.uid());
    END IF;

    -- Template version policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'template_version' AND policyname = 'Users can view versions for public templates') THEN
        CREATE POLICY "Users can view versions for public templates" ON template_version
          FOR SELECT USING (
            template_id IN (
              SELECT id FROM template WHERE is_public = true
            )
          );
    END IF;
END $$;
