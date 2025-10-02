-- Create function to handle new user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.app_user (id, email, role)
  values (new.id, new.email, 'runner');
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger to automatically create app_user when auth.users is created
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Update RLS policies to allow the trigger to insert app_user records
create policy "Allow system to create app_user records" on app_user
  for insert with check (true);

-- Add company domain field to app_user table
alter table app_user add column company_domain text;

-- Create index for company domain queries
create index idx_app_user_company_domain on app_user(company_domain);

-- Update the handle_new_user function to include company domain
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.app_user (id, email, role, company_domain)
  values (
    new.id, 
    new.email, 
    'runner',
    coalesce(new.raw_user_meta_data->>'company_domain', split_part(new.email, '@', 2))
  );
  return new;
end;
$$ language plpgsql security definer;

-- Add policy to allow users to read their own company domain
create policy "Users can read own company domain" on app_user
  for select using (auth.uid() = id);

-- Add policy to allow admins to read all company domains
create policy "Admins can read all company domains" on app_user
  for select using (
    exists (
      select 1 from app_user 
      where id = auth.uid() and role = 'admin'
    )
  );
