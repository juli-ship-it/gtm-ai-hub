-- Enhance template_variable table for AI analysis
-- This stores the AI-analyzed variables for each template

-- Add new columns to template_variable table
ALTER TABLE template_variable ADD COLUMN IF NOT EXISTS category text;
ALTER TABLE template_variable ADD COLUMN IF NOT EXISTS business_context text;
ALTER TABLE template_variable ADD COLUMN IF NOT EXISTS ai_reasoning text;
ALTER TABLE template_variable ADD COLUMN IF NOT EXISTS options jsonb;

-- Add comments to clarify the enhanced columns
COMMENT ON COLUMN template_variable.category IS 'Variable category: schedule, data_source, data_destination, configuration, notification, filter, mapping';
COMMENT ON COLUMN template_variable.business_context IS 'Why the user needs to configure this variable';
COMMENT ON COLUMN template_variable.ai_reasoning IS 'AI explanation for why this variable was identified';
COMMENT ON COLUMN template_variable.options IS 'Available options for select/multiselect variables';

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_template_variable_category ON template_variable(category);
CREATE INDEX IF NOT EXISTS idx_template_variable_template_id ON template_variable(template_id);

-- Example of how variables will be stored:
-- INSERT INTO template_variable (
--   template_id,
--   name,
--   type,
--   required,
--   description,
--   default_value,
--   category,
--   business_context,
--   ai_reasoning,
--   options,
--   order_index
-- ) VALUES (
--   'template-uuid',
--   'hubspotListId',
--   'string',
--   true,
--   'HubSpot list ID to export',
--   '12345',
--   'data_source',
--   'Identifies which HubSpot contact list to export',
--   'Found HubSpot API call with list ID parameter',
--   null,
--   1
-- );
