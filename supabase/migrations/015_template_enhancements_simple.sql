-- Simple template enhancements migration
-- This migration adds the essential new columns without complex constraints

-- Add new columns to template table
ALTER TABLE template ADD COLUMN IF NOT EXISTS n8n_workflow_json jsonb;
ALTER TABLE template ADD COLUMN IF NOT EXISTS workflow_variables jsonb;
ALTER TABLE template ADD COLUMN IF NOT EXISTS execution_instructions text;
ALTER TABLE template ADD COLUMN IF NOT EXISTS estimated_duration_minutes integer;
ALTER TABLE template ADD COLUMN IF NOT EXISTS tags text[];
ALTER TABLE template ADD COLUMN IF NOT EXISTS difficulty_level text;
ALTER TABLE template ADD COLUMN IF NOT EXISTS systems_required text[];
ALTER TABLE template ADD COLUMN IF NOT EXISTS file_requirements jsonb;
ALTER TABLE template ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT true;
ALTER TABLE template ADD COLUMN IF NOT EXISTS last_modified_at timestamptz DEFAULT now();

-- Create template_variable table
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

-- Create template_execution_context table
CREATE TABLE IF NOT EXISTS template_execution_context (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_run_id uuid REFERENCES template_run(id) ON DELETE CASCADE,
  variable_name text NOT NULL,
  variable_value jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create template_favorite table
CREATE TABLE IF NOT EXISTS template_favorite (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES template(id) ON DELETE CASCADE,
  user_id uuid REFERENCES app_user(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Create template_rating table
CREATE TABLE IF NOT EXISTS template_rating (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES template(id) ON DELETE CASCADE,
  user_id uuid REFERENCES app_user(id) ON DELETE CASCADE,
  rating integer,
  feedback text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create template_version table
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

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_template_variable_template_id ON template_variable(template_id);
CREATE INDEX IF NOT EXISTS idx_template_execution_context_template_run_id ON template_execution_context(template_run_id);
CREATE INDEX IF NOT EXISTS idx_template_favorite_template_id ON template_favorite(template_id);
CREATE INDEX IF NOT EXISTS idx_template_favorite_user_id ON template_favorite(user_id);
CREATE INDEX IF NOT EXISTS idx_template_rating_template_id ON template_rating(template_id);
CREATE INDEX IF NOT EXISTS idx_template_rating_user_id ON template_rating(user_id);
CREATE INDEX IF NOT EXISTS idx_template_version_template_id ON template_version(template_id);
CREATE INDEX IF NOT EXISTS idx_template_tags ON template USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_template_systems_required ON template USING GIN(systems_required);

-- Enable RLS
ALTER TABLE template_variable ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_execution_context ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_favorite ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_rating ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_version ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies
CREATE POLICY "Users can view template variables for public templates" ON template_variable
  FOR SELECT USING (
    template_id IN (
      SELECT id FROM template WHERE is_public = true
    )
  );

CREATE POLICY "Users can view their own execution context" ON template_execution_context
  FOR SELECT USING (
    template_run_id IN (
      SELECT id FROM template_run WHERE triggered_by = auth.uid()
    )
  );

CREATE POLICY "Users can manage their own favorites" ON template_favorite
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own ratings" ON template_rating
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can view versions for public templates" ON template_version
  FOR SELECT USING (
    template_id IN (
      SELECT id FROM template WHERE is_public = true
    )
  );
