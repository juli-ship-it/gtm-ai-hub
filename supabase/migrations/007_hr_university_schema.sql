-- HR University Schema
-- This migration creates tables for the AI in HR University feature

-- HR Modules table
create table hr_module (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  status text check (status in ('draft','published','archived')) default 'draft',
  ethics_required boolean default true,
  estimated_hours int default 0,
  difficulty text check (difficulty in ('beginner','intermediate','advanced')) default 'beginner',
  created_at timestamptz default now(),
  created_by uuid references app_user(id)
);

-- HR Lessons table
create table hr_lesson (
  id uuid primary key default gen_random_uuid(),
  module_id uuid references hr_module(id) on delete cascade,
  slug text unique not null,
  title text not null,
  content_md text,     -- markdown/mdx content
  video_url text,
  quiz jsonb,          -- [{question, options, correct_index}]
  order_num int,
  estimated_minutes int default 30,
  created_at timestamptz default now()
);

-- HR Progress tracking
create table hr_progress (
  user_id uuid references app_user(id) on delete cascade,
  lesson_id uuid references hr_lesson(id) on delete cascade,
  completed boolean default false,
  score int,
  completed_at timestamptz,
  primary key (user_id, lesson_id)
);

-- HR Feedback
create table hr_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references app_user(id) on delete cascade,
  module_id uuid references hr_module(id) on delete cascade,
  rating int check (rating between 1 and 5),
  comments text,
  created_at timestamptz default now()
);

-- HR Intake requests for new modules
create table hr_intake_request (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references app_user(id) on delete cascade,
  jtbd text not null,
  desired_module text,
  notes text,
  status text check (status in ('new','triaged','building','shipped','declined')) default 'new',
  slack_team_id text,
  slack_team_name text,
  slack_user_id text,
  slack_username text,
  created_at timestamptz default now()
);

-- HR Badges for completion
create table hr_badge (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references app_user(id) on delete cascade,
  module_id uuid references hr_module(id) on delete cascade,
  badge_type text check (badge_type in ('completion','excellence','ethics','pioneer')) default 'completion',
  earned_at timestamptz default now(),
  unique(user_id, module_id, badge_type)
);

-- Indexes for performance
create index idx_hr_module_status on hr_module(status);
create index idx_hr_module_created_by on hr_module(created_by);
create index idx_hr_lesson_module_id on hr_lesson(module_id);
create index idx_hr_lesson_order on hr_lesson(module_id, order_num);
create index idx_hr_progress_user_id on hr_progress(user_id);
create index idx_hr_progress_lesson_id on hr_progress(lesson_id);
create index idx_hr_feedback_module_id on hr_feedback(module_id);
create index idx_hr_feedback_user_id on hr_feedback(user_id);
create index idx_hr_intake_status on hr_intake_request(status);
create index idx_hr_intake_user_id on hr_intake_request(user_id);
create index idx_hr_badge_user_id on hr_badge(user_id);
create index idx_hr_badge_module_id on hr_badge(module_id);

-- Enable RLS
alter table hr_module enable row level security;
alter table hr_lesson enable row level security;
alter table hr_progress enable row level security;
alter table hr_feedback enable row level security;
alter table hr_intake_request enable row level security;
alter table hr_badge enable row level security;

-- RLS Policies for HR Module
create policy "All authenticated users can read published modules" on hr_module
  for select using (auth.role() = 'authenticated' and status = 'published');

create policy "Admins can read all modules" on hr_module
  for select using (
    exists (
      select 1 from app_user 
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Editors and admins can create modules" on hr_module
  for insert with check (
    exists (
      select 1 from app_user 
      where id = auth.uid() and role in ('editor', 'admin')
    )
  );

create policy "Editors and admins can update modules" on hr_module
  for update using (
    exists (
      select 1 from app_user 
      where id = auth.uid() and role in ('editor', 'admin')
    )
  );

-- RLS Policies for HR Lesson
create policy "All authenticated users can read lessons for published modules" on hr_lesson
  for select using (
    auth.role() = 'authenticated' and 
    exists (
      select 1 from hr_module 
      where id = module_id and status = 'published'
    )
  );

create policy "Admins can read all lessons" on hr_lesson
  for select using (
    exists (
      select 1 from app_user 
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Editors and admins can create lessons" on hr_lesson
  for insert with check (
    exists (
      select 1 from app_user 
      where id = auth.uid() and role in ('editor', 'admin')
    )
  );

create policy "Editors and admins can update lessons" on hr_lesson
  for update using (
    exists (
      select 1 from app_user 
      where id = auth.uid() and role in ('editor', 'admin')
    )
  );

-- RLS Policies for HR Progress
create policy "Users can read own progress" on hr_progress
  for select using (auth.uid() = user_id);

create policy "Users can create own progress" on hr_progress
  for insert with check (auth.uid() = user_id);

create policy "Users can update own progress" on hr_progress
  for update using (auth.uid() = user_id);

create policy "Admins can read all progress" on hr_progress
  for select using (
    exists (
      select 1 from app_user 
      where id = auth.uid() and role = 'admin'
    )
  );

-- RLS Policies for HR Feedback
create policy "Users can read feedback for accessible modules" on hr_feedback
  for select using (
    auth.uid() = user_id or
    exists (
      select 1 from hr_module 
      where id = module_id and status = 'published'
    )
  );

create policy "Users can create feedback" on hr_feedback
  for insert with check (auth.uid() = user_id);

create policy "Admins can read all feedback" on hr_feedback
  for select using (
    exists (
      select 1 from app_user 
      where id = auth.uid() and role = 'admin'
    )
  );

-- RLS Policies for HR Intake Request
create policy "Users can read own intake requests" on hr_intake_request
  for select using (auth.uid() = user_id);

create policy "Admins can read all intake requests" on hr_intake_request
  for select using (
    exists (
      select 1 from app_user 
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Users can create intake requests" on hr_intake_request
  for insert with check (auth.uid() = user_id);

create policy "Users can update own intake requests" on hr_intake_request
  for update using (auth.uid() = user_id);

create policy "Admins can update all intake requests" on hr_intake_request
  for update using (
    exists (
      select 1 from app_user 
      where id = auth.uid() and role = 'admin'
    )
  );

-- RLS Policies for HR Badge
create policy "Users can read own badges" on hr_badge
  for select using (auth.uid() = user_id);

create policy "System can create badges" on hr_badge
  for insert with check (true); -- This will be restricted by service role

create policy "Admins can read all badges" on hr_badge
  for select using (
    exists (
      select 1 from app_user 
      where id = auth.uid() and role = 'admin'
    )
  );
