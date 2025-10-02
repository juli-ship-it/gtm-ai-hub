# Supabase Setup Guide

## Quick Setup Steps

### 1. Create a Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: GTM AI Hub
   - **Database Password**: Create a strong password
   - **Region**: Choose closest to your users

### 2. Get Your API Keys

1. In your project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (starts with `https://`)
   - **anon public** key (starts with `eyJ`)
   - **service_role** key (starts with `eyJ`)

### 3. Update Environment Variables

Open `.env.local` and replace the placeholder values:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Run Database Migrations

```bash
# Install Supabase CLI if you haven't already
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Push the database schema
supabase db push
```

### 5. Configure Authentication

1. In Supabase Dashboard, go to **Authentication** → **Settings**
2. Configure the following:
   - **Site URL**: `http://localhost:3000` (for development)
   - **Redirect URLs**: `http://localhost:3000/auth/callback`
   - **Enable email confirmations**: ✅ (recommended)

### 6. Test the Setup

```bash
npm run dev
```

Visit `http://localhost:3000` and you should see the login page.

## Authentication Options

### Option 1: Company Domain Restriction

To restrict signups to specific company domains:

```bash
NEXT_PUBLIC_RESTRICT_TO_DOMAINS=true
NEXT_PUBLIC_ALLOWED_DOMAINS=yourcompany.com,partner.com
```

### Option 2: Admin-Created Users Only

1. In Supabase Dashboard → **Authentication** → **Settings**
2. Disable **Enable signup**
3. Create users manually in **Authentication** → **Users**

## Database Schema

The authentication system will automatically create these tables:

- `app_user` - User profiles with roles
- `template` - Automation templates
- `template_run` - Execution history
- `intake_request` - User requests
- `prompt` - AI prompts
- `playbook` - Template bundles
- `intake_comment` - Request comments

## Troubleshooting

### Common Issues

1. **"Your project's URL and Key are required"**
   - Check that `.env.local` exists and has correct values
   - Restart the development server

2. **Database connection errors**
   - Verify your Supabase project is active
   - Check that migrations have been applied

3. **Authentication not working**
   - Verify email confirmation is set up
   - Check redirect URLs in Supabase settings

### Getting Help

- Check the [AUTHENTICATION.md](./AUTHENTICATION.md) for detailed setup
- Review Supabase documentation: https://supabase.com/docs
- Check the console for error messages

## Security Notes

- Never commit `.env.local` to version control
- Use strong database passwords
- Regularly rotate your API keys
- Enable RLS policies (already configured in migrations)
