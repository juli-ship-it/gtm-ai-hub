-- Enable RLS on all tables
alter table app_user enable row level security;
alter table template enable row level security;
alter table template_run enable row level security;
alter table intake_request enable row level security;
alter table prompt enable row level security;
alter table playbook enable row level security;
alter table intake_comment enable row level security;

-- App User policies
create policy "Users can read own profile" on app_user
  for select using (auth.uid() = id);

create policy "Users can update own profile" on app_user
  for update using (auth.uid() = id);

create policy "Admins can read all users" on app_user
  for select using (
    exists (
      select 1 from app_user 
      where id = auth.uid() and role = 'admin'
    )
  );

-- Template policies
create policy "All authenticated users can read enabled templates" on template
  for select using (auth.role() = 'authenticated' and enabled = true);

create policy "Editors and admins can create templates" on template
  for insert with check (
    exists (
      select 1 from app_user 
      where id = auth.uid() and role in ('editor', 'admin')
    )
  );

create policy "Editors and admins can update templates" on template
  for update using (
    exists (
      select 1 from app_user 
      where id = auth.uid() and role in ('editor', 'admin')
    )
  );

create policy "Admins can delete templates" on template
  for delete using (
    exists (
      select 1 from app_user 
      where id = auth.uid() and role = 'admin'
    )
  );

-- Template Run policies
create policy "Users can read own runs" on template_run
  for select using (auth.uid() = triggered_by);

create policy "Admins can read all runs" on template_run
  for select using (
    exists (
      select 1 from app_user 
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Users can create runs" on template_run
  for insert with check (auth.uid() = triggered_by);

create policy "System can update runs" on template_run
  for update using (true); -- This will be restricted by service role

-- Intake Request policies
create policy "Requesters can read own requests" on intake_request
  for select using (auth.uid() = requester);

create policy "Admins can read all requests" on intake_request
  for select using (
    exists (
      select 1 from app_user 
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Users can create requests" on intake_request
  for insert with check (auth.uid() = requester);

create policy "Requesters can update own requests" on intake_request
  for update using (auth.uid() = requester);

create policy "Admins can update all requests" on intake_request
  for update using (
    exists (
      select 1 from app_user 
      where id = auth.uid() and role = 'admin'
    )
  );

-- Prompt policies
create policy "All authenticated users can read prompts" on prompt
  for select using (auth.role() = 'authenticated');

create policy "Editors and admins can create prompts" on prompt
  for insert with check (
    exists (
      select 1 from app_user 
      where id = auth.uid() and role in ('editor', 'admin')
    )
  );

create policy "Editors and admins can update prompts" on prompt
  for update using (
    exists (
      select 1 from app_user 
      where id = auth.uid() and role in ('editor', 'admin')
    )
  );

-- Playbook policies
create policy "All authenticated users can read playbooks" on playbook
  for select using (auth.role() = 'authenticated');

create policy "Editors and admins can create playbooks" on playbook
  for insert with check (
    exists (
      select 1 from app_user 
      where id = auth.uid() and role in ('editor', 'admin')
    )
  );

create policy "Playbook owners can update playbooks" on playbook
  for update using (auth.uid() = owner);

create policy "Admins can update all playbooks" on playbook
  for update using (
    exists (
      select 1 from app_user 
      where id = auth.uid() and role = 'admin'
    )
  );

-- Intake Comment policies
create policy "Users can read comments for accessible requests" on intake_comment
  for select using (
    auth.uid() = author_id or
    exists (
      select 1 from intake_request ir
      where ir.id = intake_request_id and ir.requester = auth.uid()
    ) or
    exists (
      select 1 from app_user 
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Users can create comments" on intake_comment
  for insert with check (auth.uid() = author_id);

create policy "Comment authors can update own comments" on intake_comment
  for update using (auth.uid() = author_id);

create policy "Comment authors can delete own comments" on intake_comment
  for delete using (auth.uid() = author_id);
