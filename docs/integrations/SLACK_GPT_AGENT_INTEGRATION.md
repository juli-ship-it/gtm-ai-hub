# Slack GPT Agent Integration

This document explains how the Slack intake system automatically creates GPT Agents when URLs are provided.

## Overview

When users submit intake requests through Slack and include GPT Agent URLs, the system automatically:
1. **Detects GPT Agent URLs** in the intake form
2. **Extracts agent information** from the URL
3. **Creates GPT Agent entries** in the database
4. **Links them to the intake request** for tracking

## How It Works

### 1. URL Detection

The system looks for GPT Agent URLs in two ways:
- **Dedicated field**: `gpt_agent_url` field in the Slack form
- **Links field**: Automatically scans the `links` field for ChatGPT URLs

**Supported URL formats:**
```
https://chatgpt.com/g/g-3TfXg9het-workleap-content-assistant
https://chatgpt.com/g/g-your-agent-id
```

### 2. Automatic Agent Creation

When a GPT Agent URL is detected, the system:

#### **For Regular Intake Requests:**
- **Agent Name**: `{Intake Title} - GPT Agent`
- **Description**: Includes the job-to-be-done, intake request ID, and submitter
- **Category**: Mapped from intake category:
  - `content` → `content`
  - `reporting` → `analysis`
  - `intake` → `support`
  - `governance` → `support`
  - `automation` → `automation`
  - `other` → `support`

#### **For HR University Intake:**
- **Agent Name**: `HR University - {Module Name} GPT Agent`
- **Description**: Includes learning objectives, desired module, and notes
- **Category**: Always `support` (learning/HR focused)

### 3. Database Integration

The created GPT Agent includes:
- **Basic info**: Name, description, iframe URL, category, status
- **User association**: Created by the submitter
- **Configuration metadata**:
  - Source: `slack_intake` or `hr_intake`
  - Original intake request ID
  - Agent ID extracted from URL
  - Additional context (module, notes, etc.)

## Implementation Details

### Slack Intake Function (`slack-intake/index.ts`)

```typescript
// Detects GPT agent URLs in links field
const gptAgentUrl = slackData.gpt_agent_url || extractGPTAgentUrl(slackData.links)

// Creates GPT agent if URL found
if (gptAgentUrl) {
  gptAgentId = await createGPTAgentFromUrl(gptAgentUrl, slackData, data.id)
}
```

### HR Intake Function (`slack-hr-intake/index.ts`)

```typescript
// Creates GPT agent from dedicated field
if (slackData.gpt_agent_url) {
  gptAgentId = await createGPTAgentFromHRIntake(slackData, data.id)
}
```

### Helper Functions

#### `extractGPTAgentUrl(links: string)`
- Uses regex to find ChatGPT GPT agent URLs
- Returns first valid URL found
- Pattern: `/https:\/\/chatgpt\.com\/g\/g-[a-zA-Z0-9-]+/g`

#### `createGPTAgentFromUrl(gptAgentUrl, slackData, intakeRequestId)`
- Extracts agent ID from URL
- Maps intake category to GPT agent category
- Creates user if needed
- Inserts GPT agent record with metadata

## Usage Examples

### Regular Intake Request

**Slack Form Data:**
```json
{
  "title": "Content Strategy Automation",
  "jtbd": "Need help creating content strategies for our campaigns",
  "category": "content",
  "gpt_agent_url": "https://chatgpt.com/g/g-3TfXg9het-workleap-content-assistant"
}
```

**Created GPT Agent:**
```json
{
  "name": "Content Strategy Automation - GPT Agent",
  "description": "GPT Agent for: Need help creating content strategies for our campaigns\n\nCreated from intake request: abc-123\nSubmitted by: john.doe",
  "iframe_url": "https://chatgpt.com/g/g-3TfXg9het-workleap-content-assistant",
  "category": "content",
  "status": "active",
  "configuration": {
    "source": "slack_intake",
    "intake_request_id": "abc-123",
    "original_url": "https://chatgpt.com/g/g-3TfXg9het-workleap-content-assistant",
    "agent_id": "g-3TfXg9het-workleap-content-assistant"
  }
}
```

### HR University Intake

**Slack Form Data:**
```json
{
  "jtbd": "Need help understanding AI ethics in HR",
  "desired_module": "AI Ethics",
  "gpt_agent_url": "https://chatgpt.com/g/g-hr-ethics-helper"
}
```

**Created GPT Agent:**
```json
{
  "name": "HR University - AI Ethics GPT Agent",
  "description": "GPT Agent for HR University: Need help understanding AI ethics in HR\n\nDesired module: AI Ethics\nNotes: None\n\nCreated from HR intake request: def-456\nSubmitted by: jane.smith",
  "iframe_url": "https://chatgpt.com/g/g-hr-ethics-helper",
  "category": "support",
  "status": "active"
}
```

## Benefits

### **For Users:**
- **Seamless integration** - GPT agents automatically available in the app
- **No manual setup** - just paste the URL in Slack
- **Context preservation** - intake details included in agent description

### **For Administrators:**
- **Automatic tracking** - all GPT agents linked to their source requests
- **Usage analytics** - can track which intake requests led to GPT agent usage
- **Centralized management** - all agents in one place regardless of source

### **For the System:**
- **Reduced manual work** - no need to manually add GPT agents
- **Better data quality** - consistent naming and categorization
- **Audit trail** - clear connection between intake requests and GPT agents

## Error Handling

The system is designed to be resilient:
- **Non-blocking**: GPT agent creation failure doesn't break intake processing
- **Detailed logging**: All errors logged for debugging
- **Graceful degradation**: Intake request still succeeds even if GPT agent creation fails

## Future Enhancements

### **Planned Features:**
- **Bulk import** - Import multiple GPT agents from a single intake
- **Agent validation** - Verify GPT agent URLs are accessible
- **Auto-categorization** - Use AI to suggest better categories
- **Usage tracking** - Track how often intake-created agents are used

### **Integration Opportunities:**
- **Slack notifications** - Notify when GPT agents are created
- **Email alerts** - Send confirmation to submitters
- **Dashboard updates** - Real-time updates in admin panel

## Troubleshooting

### **Common Issues:**

1. **Invalid URL format**
   - Check URL matches ChatGPT GPT agent pattern
   - Ensure URL is complete and accessible

2. **User creation fails**
   - Verify Slack username format
   - Check database permissions

3. **GPT agent creation fails**
   - Check database schema is up to date
   - Verify RLS policies allow inserts

### **Debug Steps:**
1. Check function logs for error messages
2. Verify URL format and accessibility
3. Test database permissions
4. Check user creation process

---

This integration makes it incredibly easy for teams to share and discover GPT agents through the natural intake process!

