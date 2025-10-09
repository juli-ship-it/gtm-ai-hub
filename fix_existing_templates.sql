-- Fix existing templates by moving analysis data to workflow_analysis column
-- This script should be run in your Supabase SQL editor

-- First, add the workflow_analysis column if it doesn't exist
ALTER TABLE template ADD COLUMN IF NOT EXISTS workflow_analysis jsonb;

-- Move analysis data from n8n_workflow_json to workflow_analysis
-- and clear n8n_workflow_json for templates that have analysis data
UPDATE template 
SET 
  workflow_analysis = n8n_workflow_json,
  n8n_workflow_json = NULL
WHERE n8n_workflow_json IS NOT NULL 
  AND n8n_workflow_json::text LIKE '%"systems"%'  -- Check if it's analysis data
  AND n8n_workflow_json::text LIKE '%"variables"%';

-- Add comments to clarify column purposes
COMMENT ON COLUMN template.n8n_workflow_json IS 'Original n8n workflow JSON for cloning and execution';
COMMENT ON COLUMN template.workflow_analysis IS 'Parsed workflow analysis metadata (systems, variables, complexity, etc.)';

-- Show affected templates
SELECT 
  id, 
  name, 
  CASE 
    WHEN n8n_workflow_json IS NULL THEN 'Analysis data moved to workflow_analysis'
    ELSE 'Has original workflow JSON'
  END as status
FROM template 
WHERE workflow_analysis IS NOT NULL;
