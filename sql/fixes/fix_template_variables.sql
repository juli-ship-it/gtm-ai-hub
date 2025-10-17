-- Fix existing template variables to use generic names and remove credentials

-- 1. First, let's see what we have
SELECT 
  tv.template_id,
  t.name as template_name,
  tv.name as variable_name,
  tv.description,
  tv.type
FROM template_variable tv
JOIN template t ON tv.template_id = t.id
ORDER BY t.name, tv.name;

-- 2. Delete credential variables
DELETE FROM template_variable 
WHERE 
  LOWER(name) LIKE '%token%' OR
  LOWER(name) LIKE '%key%' OR
  LOWER(name) LIKE '%credential%' OR
  LOWER(name) LIKE '%password%' OR
  LOWER(name) LIKE '%secret%' OR
  LOWER(name) LIKE '%auth%' OR
  (LOWER(name) LIKE '%api%' AND LOWER(name) LIKE '%key%');

-- 3. Update specific variable names to generic ones
UPDATE template_variable 
SET name = 'HubSpot List A'
WHERE name = 'listIdDemoRequest' OR name = 'listIdDemo';

UPDATE template_variable 
SET name = 'HubSpot List B'
WHERE name = 'listIdSignup' OR name = 'listIdSignups';

UPDATE template_variable 
SET name = 'Excel Workbook'
WHERE name = 'excelWorkbookId' OR name = 'excelWorkbook';

UPDATE template_variable 
SET name = 'Excel Sheet A'
WHERE name = 'excelWorksheetDemos' OR name = 'excelWorksheetDemo';

UPDATE template_variable 
SET name = 'Excel Sheet B'
WHERE name = 'excelWorksheetSignups' OR name = 'excelWorksheetSignup';

-- 4. Update descriptions to be generic
UPDATE template_variable 
SET description = 'The ID of the first HubSpot list to extract contacts from'
WHERE name = 'HubSpot List A';

UPDATE template_variable 
SET description = 'The ID of the second HubSpot list to extract contacts from'
WHERE name = 'HubSpot List B';

UPDATE template_variable 
SET description = 'The ID of the Excel workbook to append data to'
WHERE name = 'Excel Workbook';

UPDATE template_variable 
SET description = 'The name of the first worksheet in the Excel workbook'
WHERE name = 'Excel Sheet A';

UPDATE template_variable 
SET description = 'The name of the second worksheet in the Excel workbook'
WHERE name = 'Excel Sheet B';

-- 5. Show the updated variables
SELECT 
  tv.template_id,
  t.name as template_name,
  tv.name as variable_name,
  tv.description,
  tv.type
FROM template_variable tv
JOIN template t ON tv.template_id = t.id
ORDER BY t.name, tv.name;