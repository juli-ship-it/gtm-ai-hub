-- Update execution instructions for all templates with generic step-by-step format
-- This script provides a comprehensive update for all template types

-- First, let's see what we have
SELECT 
  id,
  name,
  category,
  systems_required,
  execution_instructions,
  LENGTH(execution_instructions) as instruction_length
FROM template
ORDER BY created_at DESC;

-- Update all templates with a comprehensive step-by-step format
UPDATE template 
SET execution_instructions = 'Step-by-Step Instructions:

1. Initial Setup
• Review the workflow requirements and variables
• Ensure you have access to all required systems
• Gather necessary credentials and API keys

2. Configuration
• Configure schedule settings (if applicable)
• Set up data source connections (HubSpot, APIs, etc.)
• Configure data destination settings (Excel, Google Sheets, etc.)
• Set up notification preferences

3. Variable Configuration
• Fill in all required template variables
• Test connections to external systems
• Verify data mapping and transformations

4. Testing & Deployment
• Run the workflow in test mode
• Verify data output and format
• Set up monitoring and alerts
• Deploy to production environment

5. Maintenance
• Monitor workflow performance
• Update credentials as needed
• Review and optimize data processing
• Keep documentation up to date

' || COALESCE(
  CASE 
    WHEN execution_instructions LIKE '%Business Logic:%' THEN 
      SUBSTRING(execution_instructions FROM POSITION('Business Logic:' IN execution_instructions))
    WHEN execution_instructions LIKE '%AI Insights:%' THEN 
      SUBSTRING(execution_instructions FROM POSITION('AI Insights:' IN execution_instructions))
    ELSE execution_instructions
  END, 
  ''
) || '

Systems Used: ' || COALESCE(
  ARRAY_TO_STRING(systems_required, ', '), 
  'Various systems based on workflow requirements'
);

-- Show the updated results
SELECT 
  id,
  name,
  category,
  CASE 
    WHEN execution_instructions LIKE 'Step-by-Step Instructions:%' THEN 'Updated'
    ELSE 'Needs Update'
  END as status,
  LENGTH(execution_instructions) as instruction_length,
  SUBSTRING(execution_instructions, 1, 100) || '...' as preview
FROM template
ORDER BY created_at DESC;
