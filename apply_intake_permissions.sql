-- Apply intake request permission changes
-- Run this script in the Supabase SQL Editor

-- First, let's drop the existing intake request policies
DROP POLICY IF EXISTS "All authenticated users can read all requests" ON intake_request;
DROP POLICY IF EXISTS "Requesters can read own requests" ON intake_request;
DROP POLICY IF EXISTS "Admins can read all requests" ON intake_request;
DROP POLICY IF EXISTS "Users can create requests" ON intake_request;
DROP POLICY IF EXISTS "Requesters can update own requests" ON intake_request;
DROP POLICY IF EXISTS "Admins can update all requests" ON intake_request;

-- Create new policies for intake requests

-- 1. Reading policies - all authenticated users can read all requests
CREATE POLICY "All authenticated users can read all requests" ON intake_request
  FOR SELECT USING (auth.role() = 'authenticated');

-- 2. Creation policy - users can create their own requests
CREATE POLICY "Users can create requests" ON intake_request
  FOR INSERT WITH CHECK (auth.uid() = requester);

-- 3. Update policy - allow updates but restrict via trigger
CREATE POLICY "Allow intake request updates with restrictions" ON intake_request
  FOR UPDATE USING (
    -- Allow juliana.reyes@workleap.com to update any field for any request
    EXISTS (
      SELECT 1 FROM app_user 
      WHERE id = auth.uid() 
      AND email = 'juliana.reyes@workleap.com'
    ) OR
    -- Allow requesters to update their own requests (restrictions enforced by trigger)
    auth.uid() = requester
  );

-- Update comment policies to ensure anyone can add comments
DROP POLICY IF EXISTS "Users can read comments for accessible requests" ON intake_comment;
DROP POLICY IF EXISTS "All authenticated users can read all comments" ON intake_comment;
DROP POLICY IF EXISTS "Users can create comments" ON intake_comment;

-- Create new comment policies
CREATE POLICY "All authenticated users can read all comments" ON intake_comment
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "All authenticated users can create comments" ON intake_comment
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = author_id);

-- Create a function to help identify content vs administrative fields
CREATE OR REPLACE FUNCTION is_content_field_update()
RETURNS TRIGGER AS $$
BEGIN
  -- If juliana.reyes@workleap.com is updating, allow all changes
  IF EXISTS (
    SELECT 1 FROM app_user 
    WHERE id = auth.uid() 
    AND email = 'juliana.reyes@workleap.com'
  ) THEN
    RETURN NEW;
  END IF;
  
  -- For other users, only allow updates to content fields
  -- Content fields: title, problem_statement, automation_idea, current_process, 
  -- pain_points, time_friendly, systems, links, ethics_considerations
  -- Administrative fields: status, priority, category, frequency, sensitivity
  
  -- Check if any administrative fields are being changed
  IF (
    OLD.status IS DISTINCT FROM NEW.status OR
    OLD.priority IS DISTINCT FROM NEW.priority OR
    OLD.category IS DISTINCT FROM NEW.category OR
    OLD.frequency IS DISTINCT FROM NEW.frequency OR
    OLD.sensitivity IS DISTINCT FROM NEW.sensitivity
  ) THEN
    RAISE EXCEPTION 'Only juliana.reyes@workleap.com can modify administrative fields (status, priority, category, frequency, sensitivity)';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce content field restrictions
DROP TRIGGER IF EXISTS intake_request_content_field_check ON intake_request;
CREATE TRIGGER intake_request_content_field_check
  BEFORE UPDATE ON intake_request
  FOR EACH ROW
  EXECUTE FUNCTION is_content_field_update();

-- Add helpful comments
COMMENT ON TABLE intake_request IS 'Intake requests with restricted update permissions: only juliana.reyes@workleap.com can modify administrative fields, requesters can only edit content fields of their own requests';
COMMENT ON FUNCTION is_content_field_update() IS 'Enforces that only juliana.reyes@workleap.com can modify administrative fields of intake requests';

-- Verify the setup
SELECT 'Migration completed successfully!' as status;

-- Check if juliana.reyes@workleap.com exists
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM app_user WHERE email = 'juliana.reyes@workleap.com') 
    THEN 'juliana.reyes@workleap.com user exists'
    ELSE 'juliana.reyes@workleap.com user NOT found - you may need to create this user'
  END as user_status;

-- Show current policies
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  cmd as operation
FROM pg_policies 
WHERE tablename IN ('intake_request', 'intake_comment')
ORDER BY tablename, policyname;
