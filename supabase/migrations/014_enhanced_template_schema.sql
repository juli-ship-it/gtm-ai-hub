-- Enhanced template schema for n8n workflow integration
-- This migration adds support for n8n workflow upload, variable detection, and enhanced metadata

-- Add new columns to template table
ALTER TABLE template ADD COLUMN IF NOT EXISTS n8n_workflow_json jsonb;
ALTER TABLE template ADD COLUMN IF NOT EXISTS workflow_variables jsonb; -- Auto-detected variables
ALTER TABLE template ADD COLUMN IF NOT EXISTS execution_instructions text;
ALTER TABLE template ADD COLUMN IF NOT EXISTS estimated_duration_minutes integer;
ALTER TABLE template ADD COLUMN IF NOT EXISTS tags text[];
ALTER TABLE template ADD COLUMN IF NOT EXISTS difficulty_level text CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced'));
ALTER TABLE template ADD COLUMN IF NOT EXISTS systems_required text[]; -- e.g., ['hubspot', 'slack', 'excel']
ALTER TABLE template ADD COLUMN IF NOT EXISTS file_requirements jsonb; -- File upload requirements
ALTER TABLE template ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT true; -- Whether template is visible to all users
ALTER TABLE template ADD COLUMN IF NOT EXISTS last_modified_at timestamptz DEFAULT now();

-- Create template_variable table for detailed variable definitions
CREATE TABLE IF NOT EXISTS template_variable (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES template(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('string', 'number', 'boolean', 'file', 'select', 'multiselect', 'date', 'email', 'url')),
  required boolean DEFAULT false,
  description text,
  default_value jsonb,
  validation_rules jsonb, -- {min, max, pattern, options, fileTypes, etc.}
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(template_id, name)
);

-- Create template_execution_context table for storing execution variables
CREATE TABLE IF NOT EXISTS template_execution_context (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_run_id uuid REFERENCES template_run(id) ON DELETE CASCADE,
  variable_name text NOT NULL,
  variable_value jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create template_favorite table for user favorites
CREATE TABLE IF NOT EXISTS template_favorite (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES template(id) ON DELETE CASCADE,
  user_id uuid REFERENCES app_user(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(template_id, user_id)
);

-- Create template_rating table for user ratings and feedback
CREATE TABLE IF NOT EXISTS template_rating (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES template(id) ON DELETE CASCADE,
  user_id uuid REFERENCES app_user(id) ON DELETE CASCADE,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  feedback text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(template_id, user_id)
);

-- Create template_version table for versioning
CREATE TABLE IF NOT EXISTS template_version (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES template(id) ON DELETE CASCADE,
  version_number text NOT NULL, -- e.g., "v1.2.3"
  n8n_workflow_json jsonb NOT NULL,
  workflow_variables jsonb,
  changelog text,
  is_active boolean DEFAULT false,
  created_by uuid REFERENCES app_user(id),
  created_at timestamptz DEFAULT now(),
  UNIQUE(template_id, version_number)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_template_variable_template_id ON template_variable(template_id);
CREATE INDEX IF NOT EXISTS idx_template_variable_name ON template_variable(name);
CREATE INDEX IF NOT EXISTS idx_template_execution_context_template_run_id ON template_execution_context(template_run_id);
CREATE INDEX IF NOT EXISTS idx_template_favorite_template_id ON template_favorite(template_id);
CREATE INDEX IF NOT EXISTS idx_template_favorite_user_id ON template_favorite(user_id);
CREATE INDEX IF NOT EXISTS idx_template_rating_template_id ON template_rating(template_id);
CREATE INDEX IF NOT EXISTS idx_template_rating_user_id ON template_rating(user_id);
CREATE INDEX IF NOT EXISTS idx_template_version_template_id ON template_version(template_id);
CREATE INDEX IF NOT EXISTS idx_template_version_active ON template_version(is_active);
CREATE INDEX IF NOT EXISTS idx_template_tags ON template USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_template_systems_required ON template USING GIN(systems_required);
CREATE INDEX IF NOT EXISTS idx_template_difficulty_level ON template(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_template_is_public ON template(is_public);

-- Add trigger to update last_modified_at
CREATE OR REPLACE FUNCTION update_template_last_modified()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_modified_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_template_last_modified
  BEFORE UPDATE ON template
  FOR EACH ROW
  EXECUTE FUNCTION update_template_last_modified();

-- Add trigger to update template_variable updated_at
CREATE OR REPLACE FUNCTION update_template_variable_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_template_variable_updated_at
  BEFORE UPDATE ON template_variable
  FOR EACH ROW
  EXECUTE FUNCTION update_template_variable_updated_at();

-- Add trigger to update template_rating updated_at
CREATE OR REPLACE FUNCTION update_template_rating_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_template_rating_updated_at
  BEFORE UPDATE ON template_rating
  FOR EACH ROW
  EXECUTE FUNCTION update_template_rating_updated_at();

-- RLS policies for new tables
ALTER TABLE template_variable ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_execution_context ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_favorite ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_rating ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_version ENABLE ROW LEVEL SECURITY;

-- Template variable policies
CREATE POLICY "Users can view template variables for public templates" ON template_variable
  FOR SELECT USING (
    template_id IN (
      SELECT id FROM template WHERE is_public = true
    )
  );

CREATE POLICY "Users can view template variables for their own templates" ON template_variable
  FOR SELECT USING (
    template_id IN (
      SELECT id FROM template WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Users can manage template variables for their own templates" ON template_variable
  FOR ALL USING (
    template_id IN (
      SELECT id FROM template WHERE created_by = auth.uid()
    )
  );

-- Template execution context policies
CREATE POLICY "Users can view their own execution context" ON template_execution_context
  FOR SELECT USING (
    template_run_id IN (
      SELECT id FROM template_run WHERE triggered_by = auth.uid()
    )
  );

CREATE POLICY "Users can create execution context for their runs" ON template_execution_context
  FOR INSERT WITH CHECK (
    template_run_id IN (
      SELECT id FROM template_run WHERE triggered_by = auth.uid()
    )
  );

-- Template favorite policies
CREATE POLICY "Users can view their own favorites" ON template_favorite
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own favorites" ON template_favorite
  FOR ALL USING (user_id = auth.uid());

-- Template rating policies
CREATE POLICY "Users can view ratings for public templates" ON template_rating
  FOR SELECT USING (
    template_id IN (
      SELECT id FROM template WHERE is_public = true
    )
  );

CREATE POLICY "Users can manage their own ratings" ON template_rating
  FOR ALL USING (user_id = auth.uid());

-- Template version policies
CREATE POLICY "Users can view versions for public templates" ON template_version
  FOR SELECT USING (
    template_id IN (
      SELECT id FROM template WHERE is_public = true
    )
  );

CREATE POLICY "Users can view versions for their own templates" ON template_version
  FOR SELECT USING (
    template_id IN (
      SELECT id FROM template WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Users can manage versions for their own templates" ON template_version
  FOR ALL USING (
    template_id IN (
      SELECT id FROM template WHERE created_by = auth.uid()
    )
  );

-- Update existing template table RLS to include new columns
CREATE POLICY "Users can view public templates" ON template
  FOR SELECT USING (is_public = true OR created_by = auth.uid());

-- Add comments for documentation
COMMENT ON COLUMN template.n8n_workflow_json IS 'The complete n8n workflow JSON for transparency and learning';
COMMENT ON COLUMN template.workflow_variables IS 'Auto-detected variables from n8n workflow with metadata';
COMMENT ON COLUMN template.execution_instructions IS 'Instructions for users on how to use this template';
COMMENT ON COLUMN template.estimated_duration_minutes IS 'Estimated time to complete the automation';
COMMENT ON COLUMN template.tags IS 'Searchable tags for template discovery';
COMMENT ON COLUMN template.difficulty_level IS 'Complexity level for learning purposes';
COMMENT ON COLUMN template.systems_required IS 'List of systems/integrations required';
COMMENT ON COLUMN template.file_requirements IS 'File upload requirements and validation rules';
COMMENT ON COLUMN template.is_public IS 'Whether template is visible to all users';
COMMENT ON COLUMN template.last_modified_at IS 'Last time template was updated';

COMMENT ON TABLE template_variable IS 'Detailed variable definitions for templates';
COMMENT ON TABLE template_execution_context IS 'Variable values for specific template executions';
COMMENT ON TABLE template_favorite IS 'User favorites for templates';
COMMENT ON TABLE template_rating IS 'User ratings and feedback for templates';
COMMENT ON TABLE template_version IS 'Version history for templates';
