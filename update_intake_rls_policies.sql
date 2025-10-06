-- Update RLS policies for intake requests to allow all users to see all requests
-- Run this in the Supabase SQL Editor

-- Drop existing restrictive policies
drop policy if exists "Requesters can read own requests" on intake_request;
drop policy if exists "Admins can read all requests" on intake_request;
drop policy if exists "Users can create requests" on intake_request;
drop policy if exists "Requesters can update own requests" on intake_request;
drop policy if exists "Admins can update all requests" on intake_request;

-- Create new policies that allow all authenticated users to read all intake requests
create policy "All authenticated users can read all intake requests" on intake_request
  for select using (auth.role() = 'authenticated');

-- Allow all authenticated users to create intake requests
create policy "All authenticated users can create intake requests" on intake_request
  for insert with check (auth.role() = 'authenticated');

-- Allow all authenticated users to update intake requests
create policy "All authenticated users can update intake requests" on intake_request
  for update using (auth.role() = 'authenticated');

-- Allow all authenticated users to delete intake requests (if needed)
create policy "All authenticated users can delete intake requests" on intake_request
  for delete using (auth.role() = 'authenticated');

-- Also update intake comment policies to be more permissive
drop policy if exists "Users can read comments for accessible requests" on intake_comment;
drop policy if exists "Users can create comments" on intake_comment;
drop policy if exists "Comment authors can update own comments" on intake_comment;
drop policy if exists "Comment authors can delete own comments" on intake_comment;

-- Create new policies for intake comments
create policy "All authenticated users can read all intake comments" on intake_comment
  for select using (auth.role() = 'authenticated');

create policy "All authenticated users can create intake comments" on intake_comment
  for insert with check (auth.role() = 'authenticated');

create policy "All authenticated users can update intake comments" on intake_comment
  for update using (auth.role() = 'authenticated');

create policy "All authenticated users can delete intake comments" on intake_comment
  for delete using (auth.role() = 'authenticated');
