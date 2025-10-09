-- Add video fields to template table
ALTER TABLE template ADD COLUMN IF NOT EXISTS how_to_use_video_url text;
ALTER TABLE template ADD COLUMN IF NOT EXISTS how_it_was_built_video_url text;

-- Add comments for clarity
COMMENT ON COLUMN template.how_to_use_video_url IS 'Loom video URL showing how to use this template';
COMMENT ON COLUMN template.how_it_was_built_video_url IS 'Loom video URL showing how this template was built';
