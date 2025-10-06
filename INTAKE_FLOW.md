# Slack Intake Flow Documentation

## Overview
This document describes the Slack → n8n → Supabase intake flow for collecting automation requests from team members.

## Flow Architecture

```
Slack Modal Submission → n8n Workflow → Supabase Edge Function → Database
```

## Components

### 1. Database Schema
- **Table**: `intake_request` (enhanced with new fields)
- **Migration**: `003_intake_enhancements.sql`
- **New Fields**:
  - `title`: Short title/summary
  - `category`: Type of automation (campaign_execution, content_creation, etc.)
  - `current_process`: Description of current manual process
  - `pain_points`: Specific pain points
  - `frequency`: How often performed (daily, weekly, etc.)
  - `time_friendly`: Time estimate
  - `systems`: Array of systems used
  - `sensitivity`: Data sensitivity level
  - `links`: Relevant links
  - `slack_team_id`, `slack_team_name`: Slack team info
  - `slack_user_id`, `slack_username`: Slack user info

### 2. Edge Function
- **Path**: `supabase/functions/slack-intake/index.ts`
- **Endpoint**: `POST /functions/v1/slack-intake`
- **Purpose**: Process Slack modal submissions and create intake requests

### 3. Slack Modal Data Mapping

| Slack Field | Database Field | Notes |
|-------------|----------------|-------|
| `title` | `title` | Direct mapping |
| `jtbd` | `problem_statement` | Job to be done |
| `category` | `category` | Direct mapping |
| `current_process` | `current_process` | Direct mapping |
| `pain_points` | `pain_points` | Direct mapping |
| `frequency` | `frequency` | Direct mapping |
| `time_friendly` | `time_friendly` | Direct mapping |
| `systems` | `systems` | Array of systems |
| `sensitivity` | `sensitivity` | Direct mapping |
| `urgency` | `priority` | Mapped (p0→urgent, p1→high, etc.) |
| `links` | `links` | Direct mapping |
| `submitter_username` | `slack_username` | Direct mapping |
| `team_id` | `slack_team_id` | Direct mapping |
| `team` | `slack_team_name` | Direct mapping |
| `request_type` | `request_type` | Maps 'request' → 'real', 'showcase' → 'showcase' |

## Setup Instructions

### 1. Run Migration
```bash
supabase db push
```

### 2. Deploy Edge Function
```bash
supabase functions deploy slack-intake
```

### 3. Configure n8n Workflow
Your n8n workflow should:
1. Receive Slack modal submission
2. Call the Supabase edge function:
   ```
   POST https://your-project.supabase.co/functions/v1/slack-intake
   Headers:
     - Content-Type: application/json
     - Authorization: Bearer YOUR_SERVICE_ROLE_KEY
   Body: Slack modal data
   ```

### 4. Test the Flow
```bash
node test-slack-intake.js
```

## Error Handling

The edge function handles:
- Missing required fields
- User creation/retrieval
- Database errors
- CORS for web requests

## Security

- Uses service role key for database access
- Validates input data
- Creates users automatically if they don't exist
- CORS enabled for web requests

## Monitoring

- Check Supabase logs for function execution
- Monitor `intake_request` table for new entries
- Set up alerts for failed requests

## Next Steps

1. Set up n8n workflow to call the edge function
2. Configure Slack app with the modal
3. Test end-to-end flow
4. Add notification system for status updates
5. Create dashboard to view intake requests
