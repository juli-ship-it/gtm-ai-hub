-- Migration: Add request_type column to intake_request table (fix)
-- This migration adds the request_type column to support real vs showcase requests

-- Add request_type column to intake_request table
ALTER TABLE intake_request 
ADD COLUMN IF NOT EXISTS request_type text check (request_type in ('real', 'showcase')) default 'real';

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_intake_request_type ON intake_request(request_type);

-- Add comment for clarity
COMMENT ON COLUMN intake_request.request_type IS 'Type of request: real (actual automation request) or showcase (example/demo)';
