-- Update execution instructions for all templates to use step-by-step format
-- This script updates existing templates to use the new step-by-step format

UPDATE template 
SET execution_instructions = CASE 
  WHEN execution_instructions LIKE '%Business Logic:%' AND execution_instructions LIKE '%AI Insights:%' THEN
    'Step-by-Step Instructions:

1. Schedule Configuration
• Set your preferred schedule (daily, weekly, etc.)
• Configure the time when the workflow should run

2. Data Source Setup
• Configure your HubSpot list ID
• Ensure you have proper HubSpot API access

3. Data Destination
• Set the Excel file path where data will be exported
• Specify the Excel sheet name
• Select which columns to include in the export

4. Notification Setup
• Configure email notifications (optional)
• Set up alerts for workflow completion

' || execution_instructions
  WHEN execution_instructions IS NOT NULL AND execution_instructions != '' THEN
    'Step-by-Step Instructions:

1. Schedule Configuration
• Set your preferred schedule (daily, weekly, etc.)
• Configure the time when the workflow should run

2. Data Source Setup
• Configure your HubSpot list ID
• Ensure you have proper HubSpot API access

3. Data Destination
• Set the Excel file path where data will be exported
• Specify the Excel sheet name
• Select which columns to include in the export

4. Notification Setup
• Configure email notifications (optional)
• Set up alerts for workflow completion

' || execution_instructions
  ELSE
    'Step-by-Step Instructions:

1. Schedule Configuration
• Set your preferred schedule (daily, weekly, etc.)
• Configure the time when the workflow should run

2. Data Source Setup
• Configure your HubSpot list ID
• Ensure you have proper HubSpot API access

3. Data Destination
• Set the Excel file path where data will be exported
• Specify the Excel sheet name
• Select which columns to include in the export

4. Notification Setup
• Configure email notifications (optional)
• Set up alerts for workflow completion

Business Logic:
• This workflow automates data processing tasks
• Follow the configuration steps above to set up your specific use case

AI Insights:
• This template provides a structured approach to workflow automation
• Each step is designed to be clear and actionable'
END
WHERE execution_instructions IS NOT NULL;

-- Also update templates that don't have execution instructions yet
UPDATE template 
SET execution_instructions = 'Step-by-Step Instructions:

1. Schedule Configuration
• Set your preferred schedule (daily, weekly, etc.)
• Configure the time when the workflow should run

2. Data Source Setup
• Configure your HubSpot list ID
• Ensure you have proper HubSpot API access

3. Data Destination
• Set the Excel file path where data will be exported
• Specify the Excel sheet name
• Select which columns to include in the export

4. Notification Setup
• Configure email notifications (optional)
• Set up alerts for workflow completion

Business Logic:
• This workflow automates data processing tasks
• Follow the configuration steps above to set up your specific use case

AI Insights:
• This template provides a structured approach to workflow automation
• Each step is designed to be clear and actionable'
WHERE execution_instructions IS NULL OR execution_instructions = '';

-- Show the results
SELECT 
  id,
  name,
  CASE 
    WHEN execution_instructions LIKE 'Step-by-Step Instructions:%' THEN 'Updated'
    ELSE 'Needs Update'
  END as status,
  LENGTH(execution_instructions) as instruction_length
FROM template
ORDER BY created_at DESC;
