-- GPT Agents schema
-- This migration adds support for managing custom GPT Agents

-- GPT Agents table
create table gpt_agent (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  iframe_url text,
  api_endpoint text,
  category text check (category in ('content', 'analysis', 'automation', 'support')) not null,
  status text check (status in ('active', 'inactive', 'maintenance')) default 'active',
  configuration jsonb default '{}',
  permissions jsonb default '{"canRead": true, "canWrite": false, "canExecute": true}',
  usage_count integer default 0,
  last_used timestamptz,
  created_by uuid references app_user(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- GPT Agent usage tracking
create table gpt_agent_usage (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid references gpt_agent(id) on delete cascade,
  user_id uuid references app_user(id),
  input_data jsonb,
  response_data jsonb,
  tokens_used integer,
  response_time_ms integer,
  success boolean default true,
  error_message text,
  created_at timestamptz default now()
);

-- GPT Agent configurations
create table gpt_agent_config (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid references gpt_agent(id) on delete cascade,
  config_key text not null,
  config_value jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(agent_id, config_key)
);

-- Indexes for performance
create index idx_gpt_agent_category on gpt_agent(category);
create index idx_gpt_agent_status on gpt_agent(status);
create index idx_gpt_agent_created_by on gpt_agent(created_by);
create index idx_gpt_agent_usage_agent_id on gpt_agent_usage(agent_id);
create index idx_gpt_agent_usage_user_id on gpt_agent_usage(user_id);
create index idx_gpt_agent_usage_created_at on gpt_agent_usage(created_at);
create index idx_gpt_agent_config_agent_id on gpt_agent_config(agent_id);

-- RLS policies for GPT Agents
alter table gpt_agent enable row level security;
alter table gpt_agent_usage enable row level security;
alter table gpt_agent_config enable row level security;

-- Allow all users to read active agents
create policy "Allow all users to read active gpt_agents" on gpt_agent
  for select using (status = 'active');

-- Allow users to read their own agent usage
create policy "Allow users to read their own gpt_agent_usage" on gpt_agent_usage
  for select using (auth.uid() = user_id);

-- Allow users to insert their own agent usage
create policy "Allow users to insert their own gpt_agent_usage" on gpt_agent_usage
  for insert with check (auth.uid() = user_id);

-- Allow admins to manage all agents
create policy "Allow admins to manage all gpt_agents" on gpt_agent
  for all using (
    exists (
      select 1 from app_user 
      where app_user.id = auth.uid() 
      and app_user.role = 'admin'
    )
  );

-- Allow admins to manage all agent configs
create policy "Allow admins to manage all gpt_agent_config" on gpt_agent_config
  for all using (
    exists (
      select 1 from app_user 
      where app_user.id = auth.uid() 
      and app_user.role = 'admin'
    )
  );

-- Allow admins to read all agent usage
create policy "Allow admins to read all gpt_agent_usage" on gpt_agent_usage
  for select using (
    exists (
      select 1 from app_user 
      where app_user.id = auth.uid() 
      and app_user.role = 'admin'
    )
  );

-- Function to update agent usage count
create or replace function update_agent_usage_count()
returns trigger as $$
begin
  update gpt_agent 
  set 
    usage_count = usage_count + 1,
    last_used = now()
  where id = new.agent_id;
  
  return new;
end;
$$ language plpgsql;

-- Trigger to update usage count
create trigger update_agent_usage_count_trigger
  after insert on gpt_agent_usage
  for each row
  execute function update_agent_usage_count();

-- Function to update updated_at timestamp
create or replace function update_gpt_agent_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger to update updated_at
create trigger update_gpt_agent_updated_at_trigger
  before update on gpt_agent
  for each row
  execute function update_gpt_agent_updated_at();

-- Insert sample GPT agents (users access these through their own ChatGPT accounts)
insert into gpt_agent (name, description, iframe_url, category, status, created_by) values
  (
    'Workleap Content Assistant',
    'Specialized content creation and strategy for Workleap products and GTM campaigns',
    'https://chatgpt.com/g/g-3TfXg9het-workleap-content-assistant',
    'content',
    'active',
    (select id from app_user limit 1)
  ),
  (
    'GTM Strategy Analyst',
    'Analyzes market trends, competitor data, and provides strategic GTM insights',
    'https://chatgpt.com/g/g-gtm-strategy-analyst',
    'analysis',
    'active',
    (select id from app_user limit 1)
  ),
  (
    'Campaign Automation Expert',
    'Helps automate marketing campaign setup, optimization, and workflow management',
    'https://chatgpt.com/g/g-campaign-automation-expert',
    'automation',
    'active',
    (select id from app_user limit 1)
  ),
  (
    'Customer Success Helper',
    'Provides intelligent customer support, FAQ assistance, and success guidance',
    'https://chatgpt.com/g/g-customer-success-helper',
    'support',
    'active',
    (select id from app_user limit 1)
  ),
  (
    'HR Process Optimizer',
    'Specializes in HR process improvement, compliance, and workflow optimization',
    'https://chatgpt.com/g/g-hr-process-optimizer',
    'automation',
    'active',
    (select id from app_user limit 1)
  ),
  (
    'Data Analysis Assistant',
    'Helps analyze business metrics, create reports, and derive actionable insights',
    'https://chatgpt.com/g/g-data-analysis-assistant',
    'analysis',
    'active',
    (select id from app_user limit 1)
  );

-- Insert sample configurations
insert into gpt_agent_config (agent_id, config_key, config_value) 
select 
  id,
  'model',
  '"gpt-4"'::jsonb
from gpt_agent 
where name = 'Content Strategy Assistant';

insert into gpt_agent_config (agent_id, config_key, config_value) 
select 
  id,
  'temperature',
  '0.7'::jsonb
from gpt_agent 
where name = 'Content Strategy Assistant';

insert into gpt_agent_config (agent_id, config_key, config_value) 
select 
  id,
  'max_tokens',
  '2000'::jsonb
from gpt_agent 
where name = 'Content Strategy Assistant';
