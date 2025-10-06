# GPT Agents Integration Guide

This document explains how to integrate custom GPT Agents into your GTM Hub application using card-based navigation - no API keys required!

## Overview

The GPT Agents integration allows you to manage and provide easy access to custom OpenAI GPT Agents within your GTM Hub application. Users click to open agents in new tabs where they can use their own ChatGPT accounts, providing a centralized way to access AI-powered tools and workflows without any authentication complexity.

## Integration Approaches

### Card-Based Navigation (Recommended & Only Approach)

**Best for:** All use cases - users access GPT Agents through their own ChatGPT accounts

**Advantages:**
- ✅ **No API keys required** - users use their own ChatGPT accounts
- ✅ **Zero authentication complexity** - works immediately
- ✅ **Full ChatGPT functionality** - users get complete ChatGPT experience
- ✅ **Easy to manage multiple agents** - simple URL management
- ✅ **No cost to you** - users pay for their own ChatGPT usage
- ✅ **Always up-to-date** - automatically gets latest GPT features
- ✅ **No iframe restrictions** - ChatGPT blocks iframe embedding for security

**How it works:**
1. Users see GPT Agent cards in your application
2. Users click "Open GPT Agent" to open in new tab
3. Users sign into their own ChatGPT accounts in the new tab
4. Users interact with agents using full ChatGPT interface
5. No authentication or API management needed on your end

**Implementation:**
```tsx
import { GPTAgentCard } from '@/components/gpt-agent-iframe'

<GPTAgentCard
  agent={{
    id: '1',
    name: 'Workleap Content Assistant',
    description: 'Specialized content creation for Workleap products',
    iframeUrl: 'https://chatgpt.com/g/g-3TfXg9het-workleap-content-assistant',
    category: 'content',
    status: 'active'
  }}
  onAgentUsed={(agentId) => console.log(`Agent ${agentId} was used`)}
/>
```

## Features

### Agent Management
- **Create/Update/Delete** agents
- **Category-based organization** (content, analysis, automation, support)
- **Status management** (active, inactive, maintenance)
- **Usage tracking** and analytics

### User Interface
- **Card-based layout** with beautiful agent cards
- **Grid and List views** for agent browsing
- **Search and filtering** by category and status
- **One-click access** to open agents in new tabs
- **Usage statistics** and last used tracking

### Security & Permissions
- **Row Level Security (RLS)** for data protection
- **Role-based access** (admin, editor, runner)
- **Usage tracking** per user
- **Configuration management**

## Database Schema

### Tables
- `gpt_agent` - Main agent definitions
- `gpt_agent_usage` - Usage tracking and analytics
- `gpt_agent_config` - Agent-specific configurations

### Key Fields
```sql
gpt_agent:
  - id (uuid, primary key)
  - name (text)
  - description (text)
  - iframe_url (text, optional)
  - api_endpoint (text, optional)
  - category (enum: content, analysis, automation, support)
  - status (enum: active, inactive, maintenance)
  - configuration (jsonb)
  - permissions (jsonb)
  - usage_count (integer)
  - last_used (timestamptz)
```

## Setup Instructions

### 1. Database Migration
```bash
# Run the GPT Agents migration
supabase migration up
```

### 2. No Environment Variables Needed! 🎉
Since users access GPT Agents through their own ChatGPT accounts, you don't need any API keys or environment variables.

### 3. Add to Navigation
The GPT Agents page is automatically added to the sidebar navigation.

### 4. Add Your GPT Agents
Simply update the agent URLs in the database or component to point to your custom GPT Agents:
```sql
UPDATE gpt_agent 
SET iframe_url = 'https://chatgpt.com/g/g-your-agent-id'
WHERE name = 'Your Agent Name';
```

## Usage Examples

### Basic Card Integration
```tsx
// In any page component
import { GPTAgentCard, mockGPTAgents } from '@/components/gpt-agent-iframe'

export default function MyPage() {
  return (
    <div>
      <h1>My AI Agents</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockGPTAgents.map(agent => (
          <GPTAgentCard
            key={agent.id}
            agent={agent}
            onAgentUsed={(id) => trackUsage(id)}
          />
        ))}
      </div>
    </div>
  )
}
```

### Adding New GPT Agents
```typescript
// Simply add new agents to the mockGPTAgents array or database
const newAgent = {
  id: '7',
  name: 'My Custom Agent',
  description: 'Does amazing things',
  iframeUrl: 'https://chatgpt.com/g/g-your-agent-id',
  category: 'content',
  status: 'active'
}
```

### Database Management
```sql
-- Add a new GPT Agent
INSERT INTO gpt_agent (name, description, iframe_url, category, status, created_by)
VALUES (
  'My Custom Agent',
  'Does amazing things',
  'https://chatgpt.com/g/g-your-agent-id',
  'content',
  'active',
  (SELECT id FROM app_user LIMIT 1)
);
```

## Configuration Options

### Agent Configuration
```json
{
  "model": "gpt-4",
  "temperature": 0.7,
  "maxTokens": 2000,
  "systemPrompt": "You are a helpful assistant..."
}
```

### Permissions
```json
{
  "canRead": true,
  "canWrite": false,
  "canExecute": true
}
```

## Analytics & Monitoring

### Usage Tracking
- **Request count** per agent
- **Token usage** and costs
- **Response times**
- **Success rates**
- **User activity** patterns

### Available Metrics
```typescript
const usage = await client.getAgentUsage('agent-id', '30d')
// Returns: totalRequests, totalTokens, averageResponseTime, successRate, dailyUsage
```

## Security Considerations

### Data Protection
- All agent data is protected by RLS policies
- User-specific usage tracking
- Admin-only agent management
- Secure API key handling

### Access Control
- **Public agents**: Visible to all users
- **Private agents**: Admin-only access
- **Usage tracking**: User-specific analytics

## Troubleshooting

### Common Issues

1. **Agent not loading in iframe**
   - Check iframe URL is correct
   - Verify CORS settings
   - Ensure agent is publicly accessible

2. **API integration not working**
   - Verify OpenAI API key
   - Check environment variables
   - Review error logs

3. **Permission denied errors**
   - Check user role and permissions
   - Verify RLS policies
   - Ensure proper authentication

### Debug Mode
Set `NODE_ENV=development` to enable mock mode for testing without API keys.

## Future Enhancements

### Planned Features
- **Agent templates** for quick setup
- **Workflow integration** with n8n
- **Advanced analytics** dashboard
- **Custom agent creation** UI
- **Team collaboration** features
- **API rate limiting** and quotas

### Integration Opportunities
- **HubSpot** for CRM data
- **Slack** for notifications
- **Snowflake** for analytics
- **Custom APIs** for business data

## Support

For questions or issues:
1. Check this documentation
2. Review error logs
3. Test in development mode
4. Contact the development team

---

Built with ❤️ for the GTM Hub team
