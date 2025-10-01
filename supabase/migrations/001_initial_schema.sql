-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Users table
create table app_user (
  id uuid primary key references auth.users on delete cascade,
  email text unique not null,
  role text check (role in ('admin','editor','runner')) default 'runner',
  created_at timestamptz default now()
);

-- Templates catalog (automation units)
create table template (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  category text check (category in ('content', 'reporting', 'intake', 'governance')),
  version text default 'v1',
  description text,
  inputs jsonb,          -- form schema
  outputs jsonb,         -- artifact schema
  n8n_webhook_url text not null,
  enabled boolean default true,
  requires_approval boolean default false,
  created_by uuid references app_user(id),
  created_at timestamptz default now()
);

-- Template run (observability)
create table template_run (
  id uuid primary key default gen_random_uuid(),
  template_id uuid references template(id),
  triggered_by uuid references app_user(id),
  input_payload jsonb,
  status text check (status in ('queued','running','succeeded','failed')) default 'queued',
  started_at timestamptz default now(),
  finished_at timestamptz,
  logs text,
  artifacts jsonb,         -- e.g., hubspot ids, links, files
  error_message text,
  created_at timestamptz default now()
);

-- Intake requests (Slack/Jira)
create table intake_request (
  id uuid primary key default gen_random_uuid(),
  jira_issue_key text,
  requester uuid references app_user(id),
  problem_statement text,
  automation_idea text,
  ethics_considerations text,   -- governance add
  status text check (status in ('new','triaged','building','shipped','declined')) default 'new',
  priority text check (priority in ('low','medium','high','urgent')) default 'medium',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Prompts & governance
create table prompt (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  role text check (role in ('writer', 'editor', 'classifier', 'seo_researcher', 'compliance')),
  body text not null,
  version text default 'v1',
  tags text[],
  created_by uuid references app_user(id),
  created_at timestamptz default now()
);

-- Playbooks (bundle templates + human checkpoints)
create table playbook (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  templates_included uuid[],   -- references template(id) (soft)
  human_steps jsonb,            -- [{title, role, instructions}]
  kpis jsonb,                   -- {target_send_time_hours:24, ...}
  owner uuid references app_user(id),
  created_at timestamptz default now()
);

-- Comments for intake requests
create table intake_comment (
  id uuid primary key default gen_random_uuid(),
  intake_request_id uuid references intake_request(id) on delete cascade,
  author_id uuid references app_user(id),
  content text not null,
  created_at timestamptz default now()
);

-- Indexes for performance
create index idx_template_category on template(category);
create index idx_template_enabled on template(enabled);
create index idx_template_run_status on template_run(status);
create index idx_template_run_triggered_by on template_run(triggered_by);
create index idx_template_run_template_id on template_run(template_id);
create index idx_intake_request_status on intake_request(status);
create index idx_intake_request_requester on intake_request(requester);
create index idx_prompt_role on prompt(role);
create index idx_playbook_owner on playbook(owner);
