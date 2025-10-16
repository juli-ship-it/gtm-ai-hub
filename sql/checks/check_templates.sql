-- Check if templates exist and their status
-- Run this in your Supabase SQL editor

-- 1. Check total templates
SELECT 
  COUNT(*) as total_templates,
  COUNT(CASE WHEN enabled = true THEN 1 END) as enabled_templates,
  COUNT(CASE WHEN enabled = false THEN 1 END) as disabled_templates
FROM template;

-- 2. Show all templates with their status
SELECT 
  id,
  name,
  enabled,
  created_at,
  created_by
FROM template
ORDER BY created_at DESC;

-- 3. Check if any templates have template_variables
SELECT 
  t.id,
  t.name,
  t.enabled,
  COUNT(tv.id) as variable_count
FROM template t
LEFT JOIN template_variable tv ON t.id = tv.template_id
GROUP BY t.id, t.name, t.enabled
ORDER BY t.created_at DESC;

-- 4. Check template_variable table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'template_variable' 
AND table_schema = 'public'
ORDER BY column_name;
