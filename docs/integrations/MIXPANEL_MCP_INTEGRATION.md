# Mixpanel MCP Integration Guide

## Overview

This document outlines the Mixpanel Model Context Protocol (MCP) integration for your GTM Hub application. The integration allows you to interact with Mixpanel analytics data using natural language queries through AI tools.

## ✅ Features

### **1. Event Tracking**
- Track custom events with properties
- User identification and segmentation
- Real-time event processing
- Event validation and sanitization

### **2. Analytics Queries**
- Natural language insights queries
- Funnel analysis and conversion tracking
- Retention analysis and cohort studies
- Custom date ranges and intervals

### **3. Data Export**
- Export event data
- User profile data
- Cohort definitions
- Custom analytics reports

### **4. Security & Compliance**
- Read-only mode for data protection
- Input validation and sanitization
- Rate limiting and timeout controls
- Secure credential management

## 🔧 Setup Instructions

### **1. Environment Configuration**

Add the following variables to your `.env` file:

```bash
# Mixpanel Credentials
MIXPANEL_PROJECT_ID=your_mixpanel_project_id
MIXPANEL_SERVICE_ACCOUNT_SECRET=your_mixpanel_service_account_secret
MIXPANEL_API_SECRET=your_mixpanel_api_secret

# Mixpanel MCP Configuration
MIXPANEL_MCP_SERVER_PATH=npx
MIXPANEL_MCP_SERVER_ARGS=-y mcp-remote https://mcp.mixpanel.com/sse --allow-http
MIXPANEL_MCP_ENABLED=true
MIXPANEL_MCP_READ_ONLY=true
MIXPANEL_MCP_MAX_RESULTS=1000
MIXPANEL_MCP_TIMEOUT=300
```

### **2. Enable MCP in Mixpanel**

1. Log in to your Mixpanel account
2. Navigate to **Settings** > **Organization** > **Overview**
3. Toggle the **Enable MCP** option
4. Note: Only organization administrators can enable MCP

### **3. Install Dependencies**

The integration uses the existing `@modelcontextprotocol/sdk` package. No additional dependencies are required.

### **4. Test the Integration**

Run the test script to verify the integration:

```bash
node test-mixpanel-mcp.js
```

## 🚀 Usage Examples

### **Basic Event Tracking**

```typescript
import { createMixpanelMCPClient } from './lib/integrations/mixpanel-mcp'

const mixpanel = createMixpanelMCPClient()

// Track a simple event
await mixpanel.trackEvent('user_signup', {
  plan: 'premium',
  source: 'website'
}, 'user_123')

// Track with timestamp
await mixpanel.trackEvent('page_view', {
  page: '/dashboard',
  referrer: 'google.com'
}, 'user_456')
```

### **Analytics Queries**

```typescript
// Get insights with natural language
const insights = await mixpanel.getInsights(
  'Show me daily active users for the last 30 days',
  {
    fromDate: '2024-01-01',
    toDate: '2024-01-31',
    interval: 'day'
  }
)

// Funnel analysis
const funnel = await mixpanel.getFunnels('signup_funnel', {
  fromDate: '2024-01-01',
  toDate: '2024-01-31',
  interval: 'week'
})

// Retention analysis
const retention = await mixpanel.getRetention('user_retention', {
  fromDate: '2024-01-01',
  toDate: '2024-01-31',
  interval: 'week'
})
```

### **Cohort Analysis**

```typescript
// Get all cohorts
const cohorts = await mixpanel.getCohorts({
  limit: 10,
  offset: 0
})

// Get specific cohort data
const cohortData = await mixpanel.getCohorts({
  limit: 5
})
```

## 🔒 Security Features

### **Input Validation**
- Event names are validated against allowed characters
- Properties are sanitized to prevent injection attacks
- Nested objects are automatically removed

### **Read-Only Mode**
- Configurable read-only mode prevents data modification
- Event tracking can be disabled in read-only mode
- Query limits prevent resource exhaustion

### **Rate Limiting**
- Configurable timeout settings
- Maximum result limits
- Connection pooling for efficiency

## 📊 Available Tools

The MCP server provides the following tools:

1. **track_event** - Track custom events
2. **get_insights** - Natural language analytics queries
3. **get_funnels** - Funnel analysis
4. **get_retention** - Retention analysis
5. **get_cohorts** - Cohort analysis
6. **get_events** - Event data export
7. **get_users** - User data export

## 🛠️ Development Mode

In development mode, the integration uses mock data:

```typescript
// Mock responses for development
const mockInsights = {
  series: [
    { name: 'Page Views', data: [100, 120, 150, 180, 200] },
    { name: 'Unique Users', data: [80, 95, 110, 130, 145] }
  ],
  labels: ['2024-01-01', '2024-01-02', '2024-01-03', '2024-01-04', '2024-01-05'],
  values: [100, 120, 150, 180, 200]
}
```

## 🔧 Configuration Options

### **Server Configuration**

```typescript
const config = {
  projectId: 'your_project_id',
  serviceAccountSecret: 'your_secret',
  readOnly: true,
  maxResults: 1000,
  timeout: 300
}
```

### **Client Options**

```typescript
const options = {
  fromDate: '2024-01-01',
  toDate: '2024-01-31',
  interval: 'day',
  limit: 100,
  offset: 0
}
```

## 🚨 Troubleshooting

### **Common Issues**

1. **Connection Failed**
   - Check Mixpanel credentials
   - Verify MCP is enabled in organization settings
   - Ensure network connectivity

2. **Authentication Errors**
   - Verify service account secret
   - Check project ID format
   - Ensure proper permissions

3. **Query Timeouts**
   - Increase timeout setting
   - Reduce query complexity
   - Check date range size

### **Debug Mode**

Enable debug logging:

```bash
DEBUG=mixpanel-mcp node your-app.js
```

## 📈 Performance Optimization

### **Best Practices**

1. **Use appropriate date ranges** - Avoid querying large date ranges
2. **Limit result sets** - Use pagination for large datasets
3. **Cache frequently accessed data** - Implement caching for repeated queries
4. **Monitor rate limits** - Respect Mixpanel API limits

### **Query Optimization**

```typescript
// Good: Specific date range
const insights = await mixpanel.getInsights('Daily active users', {
  fromDate: '2024-01-01',
  toDate: '2024-01-07',
  interval: 'day'
})

// Avoid: Very large date ranges
const insights = await mixpanel.getInsights('All time data', {
  fromDate: '2020-01-01',
  toDate: '2024-12-31'
})
```

## 🔄 Migration from Direct API

If you're migrating from direct Mixpanel API calls:

```typescript
// Old: Direct API
mixpanel.track('event_name', { property: 'value' })

// New: MCP Integration
await mixpanelClient.trackEvent('event_name', { property: 'value' })
```

## 📚 Additional Resources

- [Mixpanel MCP Documentation](https://docs.mixpanel.com/docs/features/mcp)
- [Model Context Protocol SDK](https://github.com/modelcontextprotocol/sdk)
- [Mixpanel API Reference](https://developer.mixpanel.com/reference)

## 🤝 Support

For issues and questions:
1. Check the troubleshooting section
2. Review Mixpanel documentation
3. Test with mock data first
4. Enable debug logging for detailed error information
