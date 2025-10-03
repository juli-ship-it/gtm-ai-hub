-- Update RLS policies to allow all authenticated users to see all data
-- This ensures that all users can see intakes and templates from other users

-- Drop existing restrictive policies
drop policy if exists "Users can read own runs" on template_run;
drop policy if exists "Requesters can read own requests" on intake_request;
drop policy if exists "Users can read comments for accessible requests" on intake_comment;

-- Create new policies that allow all authenticated users to see all data

-- Template Run policies - allow all authenticated users to read all runs
create policy "All authenticated users can read all runs" on template_run
  for select using (auth.role() = 'authenticated');

-- Intake Request policies - allow all authenticated users to read all requests
create policy "All authenticated users can read all requests" on intake_request
  for select using (auth.role() = 'authenticated');

-- Intake Comment policies - allow all authenticated users to read all comments
create policy "All authenticated users can read all comments" on intake_comment
  for select using (auth.role() = 'authenticated');

-- Keep existing create/update policies as they are more restrictive for security
