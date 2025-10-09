-- Fix missing video columns in template table
-- Run this in your Supabase Dashboard SQL Editor

ALTER TABLE template 
ADD COLUMN IF NOT EXISTS how_to_use_video_url text,
ADD COLUMN IF NOT EXISTS how_it_was_built_video_url text;

-- Add comments for clarity
COMMENT ON COLUMN template.how_to_use_video_url IS 'Loom video URL showing how to use this template';
COMMENT ON COLUMN template.how_it_was_built_video_url IS 'Loom video URL showing how this template was built';

-- Verify the columns were added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'template' 
AND column_name IN ('how_to_use_video_url', 'how_it_was_built_video_url');
