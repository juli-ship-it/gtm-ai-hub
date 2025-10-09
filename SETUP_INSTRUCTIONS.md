# Supabase Edge Function Setup Instructions

## Current Issue
Your Supabase CLI is not connected to a remote project. You need to:

## Step 1: Create .env.local file
Create a `.env.local` file in your project root with your Supabase credentials:

```bash
# Copy the example file
cp env.example .env.local
```

Then edit `.env.local` and add your actual values:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=sk-your-openai-api-key-here
```

## Step 2: Link to your Supabase project
```bash
# Link to your existing Supabase project
npx supabase link --project-ref your-project-ref
```

## Step 3: Set the OpenAI API key as a secret
```bash
# Set the OpenAI API key for Edge Functions
npx supabase secrets set OPENAI_API_KEY=sk-your-actual-openai-api-key-here
```

## Step 4: Deploy the Edge Function
```bash
# Deploy the analyze-workflow function
npx supabase functions deploy analyze-workflow
```

## Step 5: Test the deployment
```bash
# Test the function
npx supabase functions invoke analyze-workflow --data '{"prompt": "test", "workflow": {"name": "test"}}'
```

## Alternative: Manual Setup via Supabase Dashboard

If the CLI continues to have issues:

1. **Go to your Supabase Dashboard**
2. **Navigate to Edge Functions**
3. **Create a new function** called `analyze-workflow`
4. **Copy the code** from `supabase/functions/analyze-workflow/index.ts`
5. **Set environment variable** `OPENAI_API_KEY` in the dashboard
6. **Deploy the function**

## Check if it's working

Once deployed, you should see logs like:
```
[abc123] 🚀 Edge Function: AI Workflow Analysis Started
[abc123] ✅ OpenAI API key found in Edge Function
[abc123] 🤖 Calling OpenAI API from Edge Function...
```

## Current Status
- ❌ Supabase CLI not linked to remote project
- ❌ No .env.local file with credentials
- ❌ Edge Function not deployed
- ❌ OpenAI API key not set as secret

## Next Steps
1. Create `.env.local` with your Supabase credentials
2. Link to your Supabase project
3. Set OpenAI API key as secret
4. Deploy Edge Function
5. Test the AI analysis
