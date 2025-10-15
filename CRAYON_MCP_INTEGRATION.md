# Crayon MCP Integration Guide

## Overview

This document outlines the Crayon Model Context Protocol (MCP) integration for your GTM AI Hub application. The integration allows you to access competitive intelligence data using natural language queries through AI tools, enhancing your go-to-market operations with real-time competitive insights.

## ✅ Features

### **1. Competitive Intelligence**
- **Battlecards**: AI-powered competitive positioning and messaging
- **Win/Loss Stories**: Insights from deal outcomes and competitive analysis
- **Competitor Profiles**: Real-time competitor tracking and monitoring
- **Objection Handling**: AI-assisted sales responses and competitive strategies
- **Market Alerts**: Real-time notifications on competitor activities

### **2. Sales Enablement**
- **CRM Integration**: Seamless integration with Salesforce and other CRM systems
- **Communication Platforms**: Works with Slack and Microsoft Teams
- **Deal Intelligence**: Competitive context for active deals and opportunities
- **Sales Coaching**: AI-powered competitive positioning guidance

### **3. Market Intelligence**
- **Product Launches**: Track competitor product releases and updates
- **Pricing Changes**: Monitor competitor pricing strategies
- **Marketing Campaigns**: Analyze competitor marketing activities
- **Market Trends**: Identify emerging competitive threats and opportunities

### **4. Security & Compliance**
- **Read-only Access**: Secure, read-only access to competitive data
- **Input Validation**: Validates and sanitizes all queries
- **Rate Limiting**: Prevents API abuse and ensures fair usage
- **Audit Logging**: Tracks all competitive intelligence access

## 🔧 Setup Instructions

### **1. Environment Configuration**

Add the following variables to your `.env` file:

```bash
# Crayon MCP Configuration
CRAYON_MCP_ENABLED=true
CRAYON_MCP_READ_ONLY=true
CRAYON_MCP_MAX_RESULTS=100
CRAYON_MCP_TIMEOUT=300
CRAYON_MCP_AUDIT_LOGGING=true

# Crayon API Credentials
CRAYON_API_KEY=your_crayon_api_key
CRAYON_ACCOUNT_ID=your_crayon_account_id
CRAYON_WORKSPACE_ID=your_crayon_workspace_id

# Crayon MCP Server Configuration
CRAYON_MCP_SERVER_PATH=npx
CRAYON_MCP_SERVER_ARGS=-y @crayon/mcp-server --api-key $CRAYON_API_KEY
CRAYON_MCP_BASE_URL=https://api.crayon.co
```

### **2. Install Dependencies**

Install the Crayon MCP server package:

```bash
npm install @crayon/mcp-server
```

### **3. Enable Crayon MCP**

1. Log in to your Crayon account
2. Navigate to **Settings** > **Integrations** > **MCP**
3. Enable the **MCP Server** option
4. Generate API credentials for MCP access
5. Note: Only workspace administrators can enable MCP

### **4. Test the Integration**

Run the test script to verify the integration:

```bash
node test-crayon-mcp.js
```

## 🚀 Usage Examples

### **Basic Competitive Intelligence**

```typescript
import { createCrayonMCPClient } from './lib/integrations/crayon-mcp'

const crayon = createCrayonMCPClient()

// Get competitor battlecard
const battlecard = await crayon.getBattlecard('competitor_name', {
  product: 'your_product',
  useCase: 'enterprise_sales'
})

// Get win/loss insights
const winLoss = await crayon.getWinLossStories({
  competitor: 'competitor_name',
  timeRange: 'last_quarter',
  outcome: 'won'
})

// Get competitor profile
const profile = await crayon.getCompetitorProfile('competitor_name', {
  include: ['products', 'pricing', 'recent_news']
})
```

### **Sales Enablement Queries**

```typescript
// Get objection handling strategies
const objections = await crayon.getObjectionHandling({
  competitor: 'competitor_name',
  objection: 'pricing_concern',
  context: 'enterprise_deal'
})

// Get competitive positioning
const positioning = await crayon.getCompetitivePositioning({
  yourProduct: 'your_product',
  competitor: 'competitor_name',
  market: 'enterprise_software'
})

// Get deal intelligence
const dealIntel = await crayon.getDealIntelligence({
  prospect: 'company_name',
  competitors: ['competitor_a', 'competitor_b'],
  dealStage: 'proposal'
})
```

### **Market Intelligence**

```typescript
// Get market alerts
const alerts = await crayon.getMarketAlerts({
  competitors: ['competitor_a', 'competitor_b'],
  alertTypes: ['product_launch', 'pricing_change'],
  timeRange: 'last_30_days'
})

// Get competitor news
const news = await crayon.getCompetitorNews({
  competitor: 'competitor_name',
  timeRange: 'last_week',
  categories: ['product', 'funding', 'partnership']
})

// Get market trends
const trends = await crayon.getMarketTrends({
  market: 'enterprise_software',
  timeRange: 'last_quarter',
  include: ['competitor_analysis', 'pricing_trends']
})
```

## 🔒 Security Features

### **Input Validation**
- Competitor names are validated against known competitors
- Query parameters are sanitized to prevent injection attacks
- Time ranges are validated to prevent excessive data requests

### **Read-Only Mode**
- Configurable read-only mode prevents data modification
- All operations are read-only by default
- Query limits prevent resource exhaustion

### **Rate Limiting**
- Configurable timeout settings
- Maximum result limits per query
- Connection pooling for efficiency

## 📊 Available Tools

The Crayon MCP server provides the following tools:

1. **get_battlecard** - Get competitive battlecards and positioning
2. **get_win_loss_stories** - Retrieve win/loss analysis and insights
3. **get_competitor_profile** - Get detailed competitor information
4. **get_objection_handling** - Get competitive objection handling strategies
5. **get_competitive_positioning** - Get positioning recommendations
6. **get_deal_intelligence** - Get competitive context for specific deals
7. **get_market_alerts** - Get real-time competitive alerts
8. **get_competitor_news** - Get recent competitor news and updates
9. **get_market_trends** - Get market trend analysis

## 🛠️ Development Mode

In development mode, the integration uses mock data:

```typescript
// Mock responses for development
const mockBattlecard = {
  competitor: 'Competitor A',
  strengths: ['Strong brand recognition', 'Enterprise focus'],
  weaknesses: ['High pricing', 'Complex implementation'],
  positioning: 'Focus on ease of use and competitive pricing',
  objections: ['Pricing concerns', 'Implementation complexity'],
  responses: ['Emphasize ROI', 'Highlight implementation support']
}
```

## 🔧 Configuration Options

### **Server Configuration**

```typescript
const config = {
  apiKey: 'your_api_key',
  accountId: 'your_account_id',
  workspaceId: 'your_workspace_id',
  readOnly: true,
  maxResults: 100,
  timeout: 300,
  auditLogging: true
}
```

### **Query Options**

```typescript
const options = {
  timeRange: 'last_quarter',
  include: ['products', 'pricing', 'news'],
  limit: 50,
  offset: 0
}
```

## 🚨 Troubleshooting

### **Common Issues**

1. **Connection Failed**
   - Check Crayon API credentials
   - Verify MCP is enabled in workspace settings
   - Ensure network connectivity

2. **Authentication Errors**
   - Verify API key format and permissions
   - Check account and workspace IDs
   - Ensure proper MCP access permissions

3. **Query Timeouts**
   - Increase timeout setting
   - Reduce query complexity
   - Check date range size

### **Debug Mode**

Enable debug logging:

```bash
DEBUG=crayon-mcp node your-app.js
```

## 📈 Performance Optimization

### **Best Practices**

1. **Use specific queries** - Avoid overly broad competitor searches
2. **Limit time ranges** - Use appropriate date ranges for queries
3. **Cache frequently accessed data** - Implement caching for repeated queries
4. **Monitor rate limits** - Respect Crayon API limits

### **Query Optimization**

```typescript
// Good: Specific competitor and time range
const battlecard = await crayon.getBattlecard('competitor_name', {
  product: 'specific_product',
  useCase: 'enterprise_sales'
})

// Avoid: Very broad queries
const battlecard = await crayon.getBattlecard('all_competitors', {
  product: 'all_products',
  useCase: 'all_use_cases'
})
```

## 🔄 Integration with GTM AI Hub

### **GPT Agent Integration**

The Crayon MCP integration works seamlessly with your existing GPT agents:

```typescript
// Competitive intelligence GPT agent
const competitiveAgent = {
  name: 'Competitive Intelligence Assistant',
  description: 'Provides competitive insights and battlecards',
  tools: ['get_battlecard', 'get_win_loss_stories', 'get_competitor_profile'],
  category: 'Analysis'
}
```

### **Intake System Integration**

Enhance your intake system with competitive context:

```typescript
// Add competitive intelligence to intake requests
const enhancedIntake = {
  ...intakeRequest,
  competitiveContext: await crayon.getDealIntelligence({
    prospect: intakeRequest.company,
    competitors: intakeRequest.mentionedCompetitors
  })
}
```

### **Template System Integration**

Create competitive intelligence templates:

```typescript
// Competitive analysis template
const competitiveTemplate = {
  name: 'Competitive Analysis Workflow',
  category: 'Analysis',
  variables: ['competitor_name', 'product_focus', 'market_segment'],
  description: 'Automated competitive analysis and battlecard generation'
}
```

## 📚 Additional Resources

- [Crayon MCP Documentation](https://docs.crayon.co/mcp)
- [Crayon API Reference](https://api.crayon.co/docs)
- [Model Context Protocol SDK](https://github.com/modelcontextprotocol/sdk)
- [Crayon User Guides](https://enablement.crayon.com)

## 🤝 Support

For issues and questions:
1. Check the troubleshooting section
2. Review Crayon documentation
3. Test with mock data first
4. Enable debug logging for detailed error information
5. Contact Crayon support for API-specific issues

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Next Review**: February 2025
