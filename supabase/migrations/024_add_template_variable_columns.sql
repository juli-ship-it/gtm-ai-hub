-- Add new columns to template_variable table for enhanced n8n and Excel support
ALTER TABLE template_variable ADD COLUMN IF NOT EXISTS n8n_enum text[];
ALTER TABLE template_variable ADD COLUMN IF NOT EXISTS excel_config jsonb;
ALTER TABLE template_variable ADD COLUMN IF NOT EXISTS category text;
ALTER TABLE template_variable ADD COLUMN IF NOT EXISTS business_context text;
ALTER TABLE template_variable ADD COLUMN IF NOT EXISTS ai_reasoning text;
ALTER TABLE template_variable ADD COLUMN IF NOT EXISTS validation jsonb;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_template_variable_category ON template_variable(category);
CREATE INDEX IF NOT EXISTS idx_template_variable_type ON template_variable(type);

-- Update existing records to have default category
UPDATE template_variable 
SET category = 'configuration' 
WHERE category IS NULL;
