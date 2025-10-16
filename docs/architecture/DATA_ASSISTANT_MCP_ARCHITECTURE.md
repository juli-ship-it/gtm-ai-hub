# Data Assistant MCP Integration Architecture

## Overview

This document explains how the 6 MCP (Model Context Protocol) data sources integrate into the Data Assistant to provide a unified natural language interface for querying GTM data across Intercom, HubSpot, Gong, Mixpanel, Crayon, and Snowflake.

## Architecture Flow

```
User Question (Natural Language)
    ↓
[Data Chatbot UI Component]
    ↓
POST /api/data-chatbot
    ↓
[AI Query Engine] → Analyzes question + Data Source Schemas
    ↓
Generates: { query: "SQL/API query", dataSource: "intercom", confidence: 0.95 }
    ↓
[Query Validator] → Security check
    ↓
[Switch Statement] → Routes to appropriate MCP executor
    ↓
┌──────────────────────────────────────────────────┐
│  case 'intercom': → executeIntercomQuery()      │
│  case 'hubspot':  → executeHubSpotQuery()       │
│  case 'gong':     → executeGongQuery()          │
│  case 'mixpanel': → executeMixpanelQuery()      │
│  case 'crayon':   → executeCrayonQuery()        │
│  case 'snowflake':→ executeSnowflakeQuery()     │
└──────────────────────────────────────────────────┘
    ↓
[MCP Client] → createIntercomMCPClient().query()
    ↓
[MCP Server] → Intercom/HubSpot/Gong/etc. API
    ↓
Raw Data Results
    ↓
[Response Formatter] → Formats into readable text
    ↓
[Data Chatbot UI] → Displays results with metadata
```

## Step-by-Step Integration Logic

### 1. User Input Processing

**Location:** `components/data-chatbot.tsx`

```typescript
// User types: "Show me customer conversations about pricing from last week"
const handleSendMessage = async () => {
  const response = await fetch('/api/data-chatbot', {
    method: 'POST',
    body: JSON.stringify({
      message: inputValue,
      dataSource: selectedDataSource, // 'auto' or specific source
      messageHistory: messages
    })
  })
}
```

### 2. AI Query Generation

**Location:** `app/api/data-chatbot/route.ts`

```typescript
// AI analyzes the question against DATA_SOURCE_SCHEMAS
const aiPrompt = createEnhancedAIPrompt(message, dataSource, messageHistory)
const aiResponse = await callAIForQueryGeneration(aiPrompt)

// AI returns:
{
  "success": true,
  "data": {
    "query": "SELECT * FROM conversations WHERE topic LIKE '%pricing%' AND created_at >= NOW() - INTERVAL '7 days'",
    "dataSource": "intercom",
    "explanation": "This query searches for conversations containing pricing topics from the last 7 days",
    "confidence": 0.92
  }
}
```

### 3. Data Source Schema Matching

**Location:** `lib/integrations/ai-query-engine.ts`

The AI uses these schemas to understand what data each source contains:

```typescript
export const DATA_SOURCE_SCHEMAS: Record<string, DataSourceSchema> = {
  intercom: {
    name: 'Intercom Customer Support',
    description: 'Customer conversations, support tickets, and contact data',
    tables: [
      {
        name: 'conversations',
        description: 'Customer support conversations',
        columns: [
          { name: 'id', type: 'STRING', description: 'Conversation ID' },
          { name: 'topic', type: 'STRING', description: 'Conversation topic' },
          { name: 'created_at', type: 'TIMESTAMP', description: 'When conversation started' },
          { name: 'contact_id', type: 'STRING', description: 'Customer contact ID' }
        ]
      }
    ]
  },
  hubspot: {
    name: 'HubSpot CRM',
    description: 'Sales pipeline, contacts, deals, and marketing data',
    tables: [
      {
        name: 'deals',
        description: 'Sales opportunities and deals',
        columns: [
          { name: 'deal_id', type: 'STRING', description: 'Unique deal identifier' },
          { name: 'deal_name', type: 'STRING', description: 'Deal name' },
          { name: 'amount', type: 'NUMBER', description: 'Deal value' },
          { name: 'stage', type: 'STRING', description: 'Deal stage' }
        ]
      }
    ]
  }
  // ... schemas for all 6 sources
}
```

### 4. Query Validation & Security

**Location:** `app/api/data-chatbot/route.ts`

```typescript
// Sanitize and validate the generated query
const sanitizedQuery = sanitizeQuery(query)

if (!validateQuery(sanitizedQuery, detectedSource)) {
  return NextResponse.json({
    response: "I'm sorry, I can't execute that type of query for security reasons.",
    error: "Query validation failed"
  })
}

// Check confidence level
if (confidence && confidence < 0.7) {
  return NextResponse.json({
    response: `I'm not entirely sure about this query (confidence: ${Math.round(confidence * 100)}%). Could you be more specific?`,
    confidence
  })
}
```

### 5. MCP Query Execution

**Location:** `app/api/data-chatbot/route.ts`

```typescript
// Route to appropriate MCP executor
switch (detectedSource) {
  case 'intercom':
    queryResult = await executeIntercomQuery(sanitizedQuery)
    break
  case 'hubspot':
    queryResult = await executeHubSpotQuery(sanitizedQuery)
    break
  case 'gong':
    queryResult = await executeGongQuery(sanitizedQuery)
    break
  case 'mixpanel':
    queryResult = await executeMixpanelQuery(sanitizedQuery)
    break
  case 'crayon':
    queryResult = await executeCrayonQuery(sanitizedQuery)
    break
  case 'snowflake':
    queryResult = await executeSnowflakeQuery(sanitizedQuery)
    break
}
```

### 6. MCP Client Implementation

**Location:** `lib/integrations/intercom-mcp.ts` (example)

```typescript
async function executeIntercomQuery(query: string): Promise<any> {
  const intercomClient = createIntercomMCPClient()
  return await intercomClient.executeQuery(query)
}

// MCP Client calls the actual MCP Server
class IntercomMCPClient {
  async executeQuery(query: string) {
    const result = await this.client.callTool({
      name: 'search_conversations',
      arguments: { query: parsedQuery }
    })
    return result.content
  }
}
```

### 7. Response Formatting

**Location:** `app/api/data-chatbot/route.ts`

```typescript
// Format the response for display
const response = formatQueryResponse(queryResult, explanation, executionTime)

return NextResponse.json({
  response,
  query: sanitizedQuery,
  dataSource: detectedSource,
  executionTime,
  rowCount: queryResult?.rowCount || 0,
  confidence
})
```

## Concrete Example Flow

### User Question: "Show me customer conversations about pricing from last week"

**Step 1: AI Analysis**
- Keywords detected: "customer conversations", "pricing", "last week"
- Schema matching: Intercom has `conversations` table with `topic` and `created_at` columns
- Confidence: 0.92 (high confidence)

**Step 2: Query Generation**
```sql
SELECT * FROM conversations 
WHERE topic LIKE '%pricing%' 
AND created_at >= NOW() - INTERVAL '7 days'
```

**Step 3: MCP Execution**
```typescript
// Routes to Intercom MCP
const result = await executeIntercomQuery(query)
// Calls Intercom MCP Server
// Returns conversation data
```

**Step 4: Response Display**
```
Assistant: "I found 12 conversations about pricing from last week:

1. John from Acme Corp - Asked about enterprise pricing
2. Sarah from Beta Inc - Inquired about volume discounts
3. Mike from Gamma LLC - Discussed pricing for new features
...

Query executed in 1.2 seconds | Data Source: Intercom | 12 results"
```

## Data Source Capabilities

### Intercom MCP
- **Conversations**: Customer support chats and tickets
- **Contacts**: Customer information and profiles
- **Companies**: Organization data
- **Messages**: Individual message content
- **Tickets**: Support ticket details

**Example Queries:**
- "Show me support tickets from VIP customers"
- "What are the most common customer complaints?"
- "How many conversations did we have yesterday?"

### HubSpot MCP
- **Contacts**: Customer and prospect information
- **Deals**: Sales opportunities and pipeline
- **Companies**: Organization records
- **Activities**: Sales activities and touchpoints
- **Pipelines**: Sales process stages

**Example Queries:**
- "What deals are in the negotiation stage?"
- "Show me our top customers by deal value"
- "How many new leads did we get this month?"

### Gong MCP
- **Calls**: Sales call recordings and metadata
- **Transcripts**: Call conversation text
- **Topics**: AI-identified conversation topics
- **Insights**: AI-generated call insights
- **Scorecards**: Call performance metrics

**Example Queries:**
- "What objections came up in sales calls this week?"
- "Show me calls with the highest engagement scores"
- "What topics are discussed most in discovery calls?"

### Mixpanel MCP
- **Events**: User behavior tracking
- **Funnels**: Conversion funnel analysis
- **Cohorts**: User segmentation
- **Retention**: User retention metrics
- **Insights**: Analytics insights

**Example Queries:**
- "What features are users engaging with most?"
- "Show me our signup conversion funnel"
- "What's our user retention rate by cohort?"

### Crayon MCP
- **Battlecards**: Competitive positioning
- **Win/Loss Stories**: Deal outcome analysis
- **Competitor Profiles**: Competitor information
- **Market Alerts**: Competitive intelligence
- **Objection Handling**: Sales response strategies

**Example Queries:**
- "What are our competitors doing?"
- "Show me our win/loss analysis against Competitor X"
- "What competitive threats should we watch?"

### Snowflake MCP
- **Customers**: Customer data warehouse
- **Orders**: Transaction and order data
- **Products**: Product catalog
- **Revenue**: Financial metrics
- **Analytics**: Business intelligence data

**Example Queries:**
- "Show me revenue trends by customer segment"
- "What are our top-selling products this quarter?"
- "How is our customer lifetime value trending?"

## UI Integration Points

### Data Source Status Indicators

**Location:** `components/data-chatbot.tsx`

```typescript
const dataSources: DataSource[] = [
  {
    id: 'intercom',
    name: 'Intercom',
    type: 'intercom',
    status: 'connected',
    description: 'Customer support conversations and tickets',
    icon: <MessageSquare className="h-4 w-4" />
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    type: 'hubspot',
    status: 'connected',
    description: 'CRM data with contacts, deals, and marketing',
    icon: <Users className="h-4 w-4" />
  },
  // ... all 6 sources
]
```

### Example Query Suggestions

```typescript
const exampleQueries = [
  {
    source: 'intercom',
    query: 'Show me recent customer conversations',
    description: 'Get latest support interactions'
  },
  {
    source: 'hubspot',
    query: 'What deals are closing this month?',
    description: 'View upcoming deal closures'
  },
  {
    source: 'gong',
    query: 'Show me top sales call topics',
    description: 'Analyze call conversation themes'
  },
  {
    source: 'mixpanel',
    query: 'What features are users engaging with most?',
    description: 'Track feature adoption'
  },
  {
    source: 'crayon',
    query: 'What are our competitors doing?',
    description: 'Get competitive intelligence'
  },
  {
    source: 'snowflake',
    query: 'Show me revenue trends',
    description: 'Analyze business performance'
  }
]
```

## Security & Validation

### Query Validation Rules

```typescript
function validateQuery(query: string, dataSource: string): boolean {
  // Only allow SELECT queries
  if (!query.trim().toLowerCase().startsWith('select')) {
    return false
  }
  
  // Block dangerous operations
  const dangerousPatterns = [
    /drop\s+table/i,
    /delete\s+from/i,
    /insert\s+into/i,
    /update\s+set/i,
    /truncate/i,
    /alter\s+table/i
  ]
  
  return !dangerousPatterns.some(pattern => pattern.test(query))
}
```

### MCP Security Features

- **Read-only access**: All MCPs configured for read-only operations
- **Rate limiting**: Prevents API abuse
- **Audit logging**: Tracks all queries and results
- **Input sanitization**: Cleans user input before processing
- **Confidence scoring**: Low-confidence queries require clarification

## Error Handling

### Common Error Scenarios

1. **Data Source Connection Error**
   ```typescript
   catch (error) {
     return NextResponse.json({
       response: "I'm having trouble connecting to [dataSource]. Please check the connection and try again.",
       error: error.message
     })
   }
   ```

2. **Query Validation Failure**
   ```typescript
   if (!validateQuery(sanitizedQuery, detectedSource)) {
     return NextResponse.json({
       response: "I can't execute that type of query for security reasons. Please try asking for data analysis instead.",
       error: "Query validation failed"
     })
   }
   ```

3. **Low Confidence Query**
   ```typescript
   if (confidence && confidence < 0.7) {
     return NextResponse.json({
       response: `I'm not entirely sure about this query (confidence: ${Math.round(confidence * 100)}%). Could you be more specific about what data you're looking for?`,
       confidence
     })
   }
   ```

## Performance Considerations

### Query Execution Times
- **Intercom**: 0.5-2 seconds (API calls)
- **HubSpot**: 0.3-1.5 seconds (API calls)
- **Gong**: 1-3 seconds (complex AI processing)
- **Mixpanel**: 0.4-1.5 seconds (analytics queries)
- **Crayon**: 0.5-2 seconds (competitive intelligence)
- **Snowflake**: 1-5 seconds (data warehouse queries)

### Caching Strategy
- Cache frequently accessed schema information
- Cache common query results for 5-10 minutes
- Implement query result pagination for large datasets

## Troubleshooting Guide

### Common Issues

1. **"I couldn't understand your request"**
   - **Cause**: AI couldn't match question to any data source schema
   - **Solution**: Use more specific business terms, mention data source names

2. **"Data source connection error"**
   - **Cause**: MCP server not running or credentials invalid
   - **Solution**: Check environment variables, verify MCP server status

3. **"Query validation failed"**
   - **Cause**: AI generated unsafe query
   - **Solution**: Rephrase to ask for data analysis, not data modification

4. **"Low confidence query"**
   - **Cause**: AI uncertain about user intent
   - **Solution**: Be more specific about what data you want

### Debug Mode

Enable detailed logging:
```bash
NODE_ENV=development
DEBUG=data-assistant:*
```

## Future Enhancements

### Planned Features
- **Cross-source queries**: "Compare HubSpot deals with Gong call outcomes"
- **Scheduled reports**: Automated data reports via chat
- **Data visualization**: Charts and graphs for query results
- **Voice interface**: Speak questions instead of typing
- **Query templates**: Pre-built queries for common questions

### Advanced Analytics
- **Predictive queries**: "What will our revenue be next quarter?"
- **Anomaly detection**: "Show me unusual patterns in our data"
- **Comparative analysis**: "Compare this quarter to last quarter"

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Next Review**: February 2025
