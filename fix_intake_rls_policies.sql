-- Fix RLS policies for intake requests to allow all users to see all requests
-- Run this in the Supabase SQL Editor

-- First, re-enable RLS
ALTER TABLE intake_request ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Requesters can read own requests" ON intake_request;
DROP POLICY IF EXISTS "Admins can read all requests" ON intake_request;
DROP POLICY IF EXISTS "Users can create requests" ON intake_request;
DROP POLICY IF EXISTS "Requesters can update own requests" ON intake_request;
DROP POLICY IF EXISTS "Admins can update all requests" ON intake_request;
DROP POLICY IF EXISTS "All authenticated users can read all intake requests" ON intake_request;
DROP POLICY IF EXISTS "All authenticated users can create intake requests" ON intake_request;
DROP POLICY IF EXISTS "All authenticated users can update intake requests" ON intake_request;
DROP POLICY IF EXISTS "All authenticated users can delete intake requests" ON intake_request;

-- Create new policies that allow all authenticated users to access all intake requests
CREATE POLICY "Allow all authenticated users to read all intake requests" ON intake_request
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all authenticated users to create intake requests" ON intake_request
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow all authenticated users to update intake requests" ON intake_request
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all authenticated users to delete intake requests" ON intake_request
  FOR DELETE USING (auth.role() = 'authenticated');

-- Also fix intake_comment policies
ALTER TABLE intake_comment ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read comments for accessible requests" ON intake_comment;
DROP POLICY IF EXISTS "Users can create comments" ON intake_comment;
DROP POLICY IF EXISTS "Comment authors can update own comments" ON intake_comment;
DROP POLICY IF EXISTS "Comment authors can delete own comments" ON intake_comment;
DROP POLICY IF EXISTS "All authenticated users can read all intake comments" ON intake_comment;
DROP POLICY IF EXISTS "All authenticated users can create intake comments" ON intake_comment;
DROP POLICY IF EXISTS "All authenticated users can update intake comments" ON intake_comment;
DROP POLICY IF EXISTS "All authenticated users can delete intake comments" ON intake_comment;

CREATE POLICY "Allow all authenticated users to read all intake comments" ON intake_comment
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all authenticated users to create intake comments" ON intake_comment
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow all authenticated users to update intake comments" ON intake_comment
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all authenticated users to delete intake comments" ON intake_comment
  FOR DELETE USING (auth.role() = 'authenticated');

-- Test the policies work
SELECT 'RLS policies updated successfully' as status;
