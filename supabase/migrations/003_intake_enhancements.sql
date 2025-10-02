-- Migration: Enhance intake_request table for Slack integration
-- This migration adds fields to support Slack modal submissions

-- Add new columns to intake_request table
ALTER TABLE intake_request 
ADD COLUMN title text,
ADD COLUMN category text check (category in ('campaign_execution', 'content_creation', 'lead_management', 'reporting', 'other')),
ADD COLUMN current_process text,
ADD COLUMN pain_points text,
ADD COLUMN frequency text check (frequency in ('daily', 'weekly', 'monthly', 'quarterly', 'ad_hoc')),
ADD COLUMN time_friendly text,
ADD COLUMN systems text[], -- array of systems like ['hubspot', 'salesforce']
ADD COLUMN sensitivity text check (sensitivity in ('low', 'medium', 'high', 'confidential')),
ADD COLUMN links text,
ADD COLUMN slack_team_id text,
ADD COLUMN slack_team_name text,
ADD COLUMN slack_user_id text,
ADD COLUMN slack_username text;

-- Add indexes for better performance
CREATE INDEX idx_intake_request_category ON intake_request(category);
CREATE INDEX idx_intake_request_frequency ON intake_request(frequency);
CREATE INDEX idx_intake_request_sensitivity ON intake_request(sensitivity);
CREATE INDEX idx_intake_request_slack_team ON intake_request(slack_team_id);
CREATE INDEX idx_intake_request_slack_user ON intake_request(slack_user_id);

-- Update RLS policies to include new fields
-- The existing policies should work fine, but let's add a comment for clarity
COMMENT ON TABLE intake_request IS 'Intake requests from Slack and other sources with enhanced fields for better categorization and tracking';

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_intake_request_updated_at 
    BEFORE UPDATE ON intake_request 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add some helpful comments
COMMENT ON COLUMN intake_request.title IS 'Short title/summary of the request';
COMMENT ON COLUMN intake_request.category IS 'Type of automation request';
COMMENT ON COLUMN intake_request.current_process IS 'Description of current manual process';
COMMENT ON COLUMN intake_request.pain_points IS 'Specific pain points with current process';
COMMENT ON COLUMN intake_request.frequency IS 'How often this process is performed';
COMMENT ON COLUMN intake_request.time_friendly IS 'Time estimate for current process';
COMMENT ON COLUMN intake_request.systems IS 'Array of systems currently used';
COMMENT ON COLUMN intake_request.sensitivity IS 'Data sensitivity level';
COMMENT ON COLUMN intake_request.links IS 'Relevant links or documentation';
COMMENT ON COLUMN intake_request.slack_team_id IS 'Slack team ID for tracking';
COMMENT ON COLUMN intake_request.slack_team_name IS 'Slack team name';
COMMENT ON COLUMN intake_request.slack_user_id IS 'Slack user ID of submitter';
COMMENT ON COLUMN intake_request.slack_username IS 'Slack username of submitter';
