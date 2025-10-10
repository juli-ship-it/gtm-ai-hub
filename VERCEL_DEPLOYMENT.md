# Vercel Deployment Guide

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Push your code to GitHub
3. **Supabase Project**: Ensure your Supabase project is set up and running

## Step 1: Prepare Your Repository

1. **Commit all changes**:
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin gtm-intake
   ```

2. **Update redirect URIs** in your integrations:
   - HubSpot: Update redirect URI to your Vercel domain
   - Snowflake: Update OAuth redirect URI to your Vercel domain
   - Supabase: Add your Vercel domain to allowed redirect URLs

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from your project directory
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? (your account)
# - Link to existing project? No
# - Project name: gtm-ai-hub (or your preferred name)
# - Directory: ./
# - Override settings? No
```

### Option B: Deploy via Vercel Dashboard
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure build settings:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: `.next`

## Step 3: Configure Environment Variables

In your Vercel dashboard, go to Project Settings > Environment Variables and add:

### Required Variables
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### Authentication Settings
```
NEXT_PUBLIC_RESTRICT_TO_DOMAINS=true
NEXT_PUBLIC_ALLOWED_DOMAINS=yourcompany.com,partner.com
```

### Integration Variables (add as needed)
```
# n8n Integration
N8N_BASIC_USER=your_n8n_username
N8N_BASIC_PASS=your_n8n_password
N8N_WEBHOOK_SECRET=your_n8n_webhook_secret

# HubSpot
HUBSPOT_CLIENT_ID=your_hubspot_client_id
HUBSPOT_CLIENT_SECRET=your_hubspot_client_secret
HUBSPOT_REDIRECT_URI=https://your-app.vercel.app/auth/hubspot/callback

# Snowflake
SNOWFLAKE_ACCOUNT=your_snowflake_account
SNOWFLAKE_USER=your_snowflake_user
SNOWFLAKE_ROLE=your_snowflake_role
SNOWFLAKE_WAREHOUSE=your_snowflake_warehouse
SNOWFLAKE_DB=your_snowflake_database
SNOWFLAKE_PRIVATE_KEY=your_snowflake_private_key
SNOWFLAKE_MCP_OAUTH_REDIRECT_URI=https://your-app.vercel.app/auth/snowflake/callback

# Mixpanel
MIXPANEL_PROJECT_ID=your_mixpanel_project_id
MIXPANEL_SERVICE_ACCOUNT_SECRET=your_mixpanel_service_account_secret
MIXPANEL_API_SECRET=your_mixpanel_api_secret

# Slack
SLACK_BOT_TOKEN=xoxb-your-slack-bot-token
SLACK_SIGNING_SECRET=your_slack_signing_secret

# Other integrations as needed...
```

## Step 4: Update Supabase Configuration

1. Go to your Supabase dashboard
2. Navigate to Authentication > URL Configuration
3. Update the following:
   - **Site URL**: `https://your-app.vercel.app`
   - **Redirect URLs**: Add `https://your-app.vercel.app/auth/callback`

## Step 5: Update Integration Redirect URIs

### HubSpot
1. Go to HubSpot Developer Settings
2. Update redirect URI to: `https://your-app.vercel.app/auth/hubspot/callback`

### Snowflake
1. Update OAuth redirect URI to: `https://your-app.vercel.app/auth/snowflake/callback`

## Step 6: Test Your Deployment

1. Visit your Vercel URL
2. Test authentication flow
3. Test all integrations
4. Check console for any errors

## Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check that all dependencies are in `package.json`
   - Ensure TypeScript compilation passes
   - Check build logs in Vercel dashboard

2. **Environment Variables**:
   - Ensure all required variables are set
   - Check variable names match exactly
   - Verify no typos in values

3. **Authentication Issues**:
   - Verify redirect URIs are updated
   - Check Supabase configuration
   - Ensure CORS settings allow your domain

4. **API Routes**:
   - Check that API routes are in `app/api/` directory
   - Verify route handlers export correct functions
   - Check server logs for errors

### Getting Help

- Check Vercel deployment logs
- Review Supabase logs
- Test locally with production environment variables
- Check browser console for client-side errors

## Next Steps

After successful deployment:
1. Set up custom domain (optional)
2. Configure monitoring and analytics
3. Set up CI/CD for automatic deployments
4. Configure backup strategies for your database
