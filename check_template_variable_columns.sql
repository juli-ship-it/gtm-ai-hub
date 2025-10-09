-- Check if the new columns exist in template_variable table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'template_variable' 
AND table_schema = 'public'
ORDER BY column_name;
