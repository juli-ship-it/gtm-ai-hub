# Environment Setup Instructions

## The Issue
The AI analysis is failing with a 500 Internal Server Error because the environment variables are not set for the Next.js application.

## Solution
You need to create a `.env.local` file in the project root with the following variables:

```bash
# Create the environment file
touch .env.local
```

Then add the following content to `.env.local`:

```env
# Supabase Configuration
# Get these from: https://supabase.com/dashboard/project/qvfvylflnfxrhyzwlhpm/settings/api

NEXT_PUBLIC_SUPABASE_URL=https://qvfvylflnfxrhyzwlhpm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# OpenAI API Key for Edge Functions
OPENAI_API_KEY=your_openai_api_key_here

# Development mode
NODE_ENV=development
```

## How to Get the Credentials

1. **Supabase Credentials:**
   - Go to: https://supabase.com/dashboard/project/qvfvylflnfxrhyzwlhpm/settings/api
   - Copy the "Project URL" → `NEXT_PUBLIC_SUPABASE_URL`
   - Copy the "anon public" key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Copy the "service_role" key → `SUPABASE_SERVICE_ROLE_KEY`

2. **OpenAI API Key:**
   - Get from: https://platform.openai.com/api-keys
   - This is needed for the Edge Function to work

## After Setting Up

1. Restart your Next.js development server
2. Try uploading the n8n workflow again
3. The AI analysis should now work properly

## Verification

You can test the Edge Function directly by running:
```bash
node test-edge-function.js
```

This will verify that the Supabase connection is working.
