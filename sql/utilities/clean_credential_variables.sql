-- Clean up credential variables from existing templates
-- This removes variables that contain sensitive credential information

-- First, let's see what credential variables exist
SELECT 
  tv.template_id,
  t.name as template_name,
  tv.name as variable_name,
  tv.description,
  tv.type
FROM template_variable tv
JOIN template t ON tv.template_id = t.id
WHERE 
  LOWER(tv.name) LIKE '%token%' OR
  LOWER(tv.name) LIKE '%key%' OR
  LOWER(tv.name) LIKE '%credential%' OR
  LOWER(tv.name) LIKE '%password%' OR
  LOWER(tv.name) LIKE '%secret%' OR
  LOWER(tv.name) LIKE '%auth%' OR
  LOWER(tv.name) LIKE '%api%' AND LOWER(tv.name) LIKE '%key%'
ORDER BY t.name, tv.name;

-- Delete credential variables
DELETE FROM template_variable 
WHERE 
  LOWER(name) LIKE '%token%' OR
  LOWER(name) LIKE '%key%' OR
  LOWER(name) LIKE '%credential%' OR
  LOWER(name) LIKE '%password%' OR
  LOWER(name) LIKE '%secret%' OR
  LOWER(name) LIKE '%auth%' OR
  (LOWER(name) LIKE '%api%' AND LOWER(name) LIKE '%key%');

-- Show remaining variables after cleanup
SELECT 
  tv.template_id,
  t.name as template_name,
  tv.name as variable_name,
  tv.description,
  tv.type
FROM template_variable tv
JOIN template t ON tv.template_id = t.id
ORDER BY t.name, tv.name;
