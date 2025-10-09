-- Add workflow_analysis column to template table
-- This stores the parsed workflow analysis metadata separately from the original workflow JSON

ALTER TABLE template ADD COLUMN IF NOT EXISTS workflow_analysis jsonb;

-- Update existing templates to move analysis data to the new column
-- and restore original workflow JSON to n8n_workflow_json
UPDATE template 
SET 
  workflow_analysis = n8n_workflow_json,
  n8n_workflow_json = NULL
WHERE n8n_workflow_json IS NOT NULL 
  AND n8n_workflow_json::text LIKE '%"systems"%'  -- Check if it's analysis data
  AND n8n_workflow_json::text LIKE '%"variables"%';

-- Add comment to clarify the column purposes
COMMENT ON COLUMN template.n8n_workflow_json IS 'Original n8n workflow JSON for cloning and execution';
COMMENT ON COLUMN template.workflow_analysis IS 'Parsed workflow analysis metadata (systems, variables, complexity, etc.)';
