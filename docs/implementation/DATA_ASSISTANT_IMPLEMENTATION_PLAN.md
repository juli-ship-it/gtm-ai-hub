# Data Assistant 7-Source Implementation Plan

## Overview

This plan details the implementation of a 7-source Data Assistant that integrates Intercom, HubSpot, Gong, Mixpanel, Crayon, Snowflake, and Clay MCPs into a unified natural language interface for GTM data analysis.

## UI Placement & Navigation

### **Primary Location: `/data-assistant`**
- **Main Entry Point**: Sidebar navigation item "Data Assistant"
- **URL**: `https://your-domain.com/data-assistant`
- **Icon**: `BarChart3` or `Database` icon in sidebar
- **Position**: After "Templates" and before "Settings" in sidebar

### **Secondary Access Points:**
- **Dashboard Widget**: Quick access card on main dashboard
- **Slack Integration**: `/data-assistant` slash command
- **GPT Agent**: "Data Assistant" GPT agent for external access

## UI Architecture & Components

### **Main Layout Structure:**
```
┌─────────────────────────────────────────────────────────────┐
│ Header: "Data Assistant - AI-Powered Data Query"           │
├─────────────────────────────────────────────────────────────┤
│ Data Source Status Bar (7 sources with connection status)  │
├─────────────────────────────────────────────────────────────┤
│ Chat Interface (70% width) │ Data Source Panel (30% width) │
│                            │                               │
│ ┌─────────────────────────┐ │ ┌─────────────────────────┐   │
│ │ Message History         │ │ │ Data Sources            │   │
│ │ - User messages         │ │ │ ✓ Intercom              │   │
│ │ - Assistant responses   │ │ │ ✓ HubSpot               │   │
│ │ - Query metadata        │ │ │ ✓ Gong                  │   │
│ │                         │ │ │ ✓ Mixpanel              │   │
│ │ ┌─────────────────────┐ │ │ │ ✓ Crayon                │   │
│ │ │ Input field         │ │ │ │ ✓ Snowflake             │   │
│ │ │ [Ask about your     │ │ │ │ ✓ Clay                  │   │
│ │ │  data...] [Send]    │ │ │ │                         │   │
│ │ └─────────────────────┘ │ │ │ Example Queries:        │   │
│ └─────────────────────────┘ │ │ • "Show me top customers"│   │
│                            │ │ • "What deals are closing"│   │
│                            │ │ • "Enrich our prospects"  │   │
│                            │ │ • "Compare call outcomes" │   │
│                            │ └─────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## User Experience Flow

### **1. Initial Access**
```
User clicks "Data Assistant" in sidebar
↓
Loads /data-assistant page
↓
Shows welcome message with data source status
↓
Displays example queries for each source
```

### **2. Single-Source Query Flow**
```
User types: "Show me customer conversations from last week"
↓
AI analyzes question → detects "conversations" → routes to Intercom
↓
Shows typing indicator: "Analyzing your question..."
↓
Displays result with metadata:
┌─────────────────────────────────────────────────────────────┐
│ 🤖 Assistant                                                │
│ I found 15 customer conversations from last week:           │
│                                                             │
│ 1. John from Acme Corp - Asked about pricing               │
│ 2. Sarah from Beta Inc - Technical support issue           │
│ 3. Mike from Gamma LLC - Feature request                   │
│ ...                                                         │
│                                                             │
│ 📊 Query executed in 1.2s | Data Source: Intercom | 15 results │
│ 💡 Try: "Show me conversations about pricing"              │
└─────────────────────────────────────────────────────────────┘
```

### **3. Multi-Source Query Flow**
```
User types: "Enrich our top customers with company funding data"
↓
AI detects need for multiple sources → HubSpot + Clay
↓
Shows progress: "Querying HubSpot for customers... ✓"
                "Enriching with Clay data... ✓"
                "Analyzing results... ✓"
↓
Displays combined result:
┌─────────────────────────────────────────────────────────────┐
│ 🤖 Assistant                                                │
│ I've enriched your top 10 customers with funding data:     │
│                                                             │
│ 1. Acme Corp - $2.5M revenue | Series B, $50M funding     │
│ 2. Beta Inc - $1.8M revenue | Series A, $15M funding      │
│ 3. Gamma LLC - $1.2M revenue | Seed, $3M funding          │
│ ...                                                         │
│                                                             │
│ 📊 Multi-source query | HubSpot + Clay | 2.3s | 10 results │
│ 💡 Try: "Show me customers by funding stage"               │
└─────────────────────────────────────────────────────────────┘
```

### **4. Data Source Selection**
```
User can manually select data source:
┌─────────────────────────────────────────────────────────────┐
│ Data Source: [Auto-detect ▼]                               │
│                                                             │
│ Or select specific source:                                  │
│ ○ Intercom (Customer Support)                              │
│ ○ HubSpot (CRM & Sales)                                    │
│ ○ Gong (Call Intelligence)                                 │
│ ○ Mixpanel (Product Analytics)                             │
│ ○ Crayon (Competitive Intel)                               │
│ ○ Snowflake (Data Warehouse)                               │
│ ○ Clay (Data Enrichment)                                   │
└─────────────────────────────────────────────────────────────┘
```

## Implementation Phases

### **Phase 1: Core Infrastructure (Week 1-2)**

#### **1.1 Update AI Query Engine Schemas**
**File:** `lib/integrations/ai-query-engine.ts`

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
          { name: 'contact_id', type: 'STRING', description: 'Customer contact ID' },
          { name: 'status', type: 'STRING', description: 'Conversation status' }
        ],
        sampleQueries: [
          'SELECT * FROM conversations WHERE created_at >= NOW() - INTERVAL \'7 days\'',
          'SELECT topic, COUNT(*) FROM conversations GROUP BY topic',
          'SELECT contact_id, COUNT(*) FROM conversations GROUP BY contact_id'
        ]
      },
      {
        name: 'contacts',
        description: 'Customer contact information',
        columns: [
          { name: 'id', type: 'STRING', description: 'Contact ID' },
          { name: 'name', type: 'STRING', description: 'Contact name' },
          { name: 'email', type: 'STRING', description: 'Contact email' },
          { name: 'company', type: 'STRING', description: 'Company name' },
          { name: 'created_at', type: 'TIMESTAMP', description: 'Contact creation date' }
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
          { name: 'stage', type: 'STRING', description: 'Deal stage' },
          { name: 'close_date', type: 'DATE', description: 'Expected close date' },
          { name: 'contact_id', type: 'STRING', description: 'Associated contact' }
        ],
        sampleQueries: [
          'SELECT deal_name, amount, stage FROM deals WHERE stage = \'negotiation\'',
          'SELECT DATE_TRUNC(\'month\', close_date) as month, SUM(amount) FROM deals GROUP BY month',
          'SELECT stage, COUNT(*) FROM deals GROUP BY stage'
        ]
      }
    ]
  },
  
  gong: {
    name: 'Gong Call Intelligence',
    description: 'Sales call recordings, transcripts, and conversation analytics',
    tables: [
      {
        name: 'calls',
        description: 'Sales call recordings and metadata',
        columns: [
          { name: 'call_id', type: 'STRING', description: 'Unique call identifier' },
          { name: 'call_date', type: 'TIMESTAMP', description: 'When call occurred' },
          { name: 'outcome', type: 'STRING', description: 'Call outcome' },
          { name: 'score', type: 'NUMBER', description: 'Call quality score' },
          { name: 'duration', type: 'NUMBER', description: 'Call duration in minutes' }
        ]
      }
    ]
  },
  
  clay: {
    name: 'Clay Data Enrichment',
    description: 'Data enrichment, lead generation, and company intelligence',
    tables: [
      {
        name: 'enriched_contacts',
        description: 'Contacts with additional data points',
        columns: [
          { name: 'contact_id', type: 'STRING', description: 'Original contact ID' },
          { name: 'company_funding', type: 'STRING', description: 'Company funding stage' },
          { name: 'employee_count', type: 'NUMBER', description: 'Company size' },
          { name: 'linkedin_url', type: 'STRING', description: 'LinkedIn profile URL' },
          { name: 'industry', type: 'STRING', description: 'Company industry' }
        ]
      }
    ]
  }
  
  // ... existing schemas for Mixpanel, Crayon, Snowflake
}
```

#### **1.2 Create MCP Client Implementations**

**Intercom MCP Client** (`lib/integrations/intercom-mcp.ts`)
```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'

export interface IntercomMCPConfig {
  accessToken: string
  readOnly?: boolean
  maxResults?: number
  timeout?: number
}

export class IntercomMCPClient {
  private client: Client
  private config: IntercomMCPConfig

  async connect(): Promise<void> {
    // Connect to Intercom MCP server
  }

  async getConversations(options: any): Promise<any> {
    // Query conversations
  }

  async getContacts(options: any): Promise<any> {
    // Query contacts
  }

  async getCompanies(options: any): Promise<any> {
    // Query companies
  }
}
```

**HubSpot MCP Client** (`lib/integrations/hubspot-mcp.ts`)
```typescript
export class HubSpotMCPClient {
  async getDeals(options: any): Promise<any> {
    // Query deals
  }

  async getContacts(options: any): Promise<any> {
    // Query contacts
  }

  async getCompanies(options: any): Promise<any> {
    // Query companies
  }
}
```

**Gong MCP Client** (`lib/integrations/gong-mcp.ts`)
```typescript
export class GongMCPClient {
  async getCalls(options: any): Promise<any> {
    // Query calls
  }

  async getTranscripts(options: any): Promise<any> {
    // Query transcripts
  }

  async getInsights(options: any): Promise<any> {
    // Query insights
  }
}
```

**Clay MCP Client** (`lib/integrations/clay-mcp.ts`)
```typescript
export class ClayMCPClient {
  async enrichContacts(contacts: any[]): Promise<any> {
    // Enrich contact data
  }

  async getCompanyInsights(companyIds: string[]): Promise<any> {
    // Get company insights
  }

  async findProspects(criteria: any): Promise<any> {
    // Find new prospects
  }
}
```

### **Phase 2: API Integration (Week 2-3)**

#### **2.1 Update Data Chatbot API Route**
**File:** `app/api/data-chatbot/route.ts`

```typescript
import { createIntercomMCPClient } from '@/lib/integrations/intercom-mcp'
import { createHubSpotMCPClient } from '@/lib/integrations/hubspot-mcp'
import { createGongMCPClient } from '@/lib/integrations/gong-mcp'
import { createClayMCPClient } from '@/lib/integrations/clay-mcp'

export async function POST(request: NextRequest) {
  // ... existing code ...

  try {
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
      case 'clay':
        queryResult = await executeClayQuery(sanitizedQuery)
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
  } catch (error) {
    // Error handling
  }
}

async function executeIntercomQuery(query: string): Promise<any> {
  const intercomClient = createIntercomMCPClient()
  return await intercomClient.executeQuery(query)
}

async function executeHubSpotQuery(query: string): Promise<any> {
  const hubspotClient = createHubSpotMCPClient()
  return await hubspotClient.executeQuery(query)
}

async function executeGongQuery(query: string): Promise<any> {
  const gongClient = createGongMCPClient()
  return await gongClient.executeQuery(query)
}

async function executeClayQuery(query: string): Promise<any> {
  const clayClient = createClayMCPClient()
  return await clayClient.executeQuery(query)
}
```

### **Phase 3: UI Implementation (Week 3-4)**

#### **3.1 Update Data Chatbot Component**
**File:** `components/data-chatbot.tsx`

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
  {
    id: 'gong',
    name: 'Gong',
    type: 'gong',
    status: 'connected',
    description: 'Sales call intelligence and conversation analytics',
    icon: <Phone className="h-4 w-4" />
  },
  {
    id: 'mixpanel',
    name: 'Mixpanel',
    type: 'mixpanel',
    status: 'connected',
    description: 'Product analytics and user behavior tracking',
    icon: <BarChart3 className="h-4 w-4" />
  },
  {
    id: 'crayon',
    name: 'Crayon',
    type: 'crayon',
    status: 'connected',
    description: 'Competitive intelligence and market insights',
    icon: <Target className="h-4 w-4" />
  },
  {
    id: 'snowflake',
    name: 'Snowflake',
    type: 'snowflake',
    status: 'connected',
    description: 'Data warehouse with customer, sales, and analytics data',
    icon: <Database className="h-4 w-4" />
  },
  {
    id: 'clay',
    name: 'Clay',
    type: 'clay',
    status: 'connected',
    description: 'Data enrichment and lead generation',
    icon: <Sparkles className="h-4 w-4" />
  }
]

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
  },
  {
    source: 'clay',
    query: 'Enrich our top customers with company data',
    description: 'Add company insights to customer profiles'
  }
]
```

#### **3.2 Enhanced UI Layout**
```typescript
export default function DataChatbot({ className }: DataChatbotProps) {
  return (
    <div className="flex h-full">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Data Source Status Bar */}
        <div className="flex items-center gap-2 p-4 border-b">
          <span className="text-sm font-medium">Data Sources:</span>
          {dataSources.map(source => (
            <Badge 
              key={source.id} 
              variant={source.status === 'connected' ? 'default' : 'secondary'}
              className="flex items-center gap-1"
            >
              {source.icon}
              {source.name}
            </Badge>
          ))}
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map(message => (
            <ChatMessage key={message.id} message={message} />
          ))}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about your data... (e.g., 'Show me top customers')"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <Button onClick={handleSendMessage} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Data Source Panel */}
      <div className="w-80 border-l p-4">
        <h3 className="font-semibold mb-4">Data Sources</h3>
        
        {/* Source Status */}
        <div className="space-y-2 mb-6">
          {dataSources.map(source => (
            <div key={source.id} className="flex items-center gap-2">
              {source.icon}
              <span className="text-sm">{source.name}</span>
              <Badge variant={source.status === 'connected' ? 'default' : 'destructive'} className="text-xs">
                {source.status}
              </Badge>
            </div>
          ))}
        </div>

        {/* Example Queries */}
        <div>
          <h4 className="font-medium mb-3">Example Queries</h4>
          <div className="space-y-2">
            {exampleQueries.map((example, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="w-full text-left justify-start h-auto p-3"
                onClick={() => setInputValue(example.query)}
              >
                <div>
                  <div className="font-medium">{example.query}</div>
                  <div className="text-xs text-muted-foreground">{example.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
```

### **Phase 4: Multi-Source Queries (Week 4-5)**

#### **4.1 Enhanced AI Query Engine**
```typescript
export interface MultiSourceQuery {
  operation: 'single_source' | 'multi_source_compare' | 'multi_source_enrich'
  queries: Array<{
    query: string
    dataSource: string
    purpose: string
  }>
  analysis?: string
  confidence: number
}

async function generateMultiSourceQuery(message: string): Promise<MultiSourceQuery> {
  const prompt = createMultiSourcePrompt(message)
  const response = await callAI(prompt)
  
  // AI decides if single or multi-source needed
  if (response.data.queries.length === 1) {
    return { ...response.data, operation: 'single_source' }
  } else {
    return { ...response.data, operation: 'multi_source_compare' }
  }
}
```

#### **4.2 Multi-Source Execution**
```typescript
async function executeMultiSource(queryPlan: MultiSourceQuery) {
  // Execute all queries in parallel
  const results = await Promise.all(
    queryPlan.queries.map(q => executeQuery(q.query, q.dataSource))
  )
  
  // Combine results
  const combinedData = combineResults(results, queryPlan.queries)
  
  // Analyze with AI (if needed)
  if (needsAnalysis(queryPlan.operation)) {
    const analysis = await analyzeResults(combinedData, queryPlan.analysis)
    return formatMultiSourceResponse(combinedData, analysis)
  } else {
    return formatSimpleResponse(combinedData)
  }
}
```

### **Phase 5: Testing & Documentation (Week 5-6)**

#### **5.1 Test Suite**
**File:** `test-data-assistant-mcps.js`
```javascript
// Test all 7 MCP client connections
// Test query execution for each source with mock data
// Verify AI query generation for each source type
// Test error handling and validation
// Test data source auto-detection
// Test multi-source queries (HubSpot + Clay enrichment)
```

#### **5.2 Documentation Updates**
- Update `DATA_ASSISTANT_DOCUMENTATION.md`
- Create `DATA_SOURCES_INTEGRATION_GUIDE.md`
- Update `DATA_ASSISTANT_MCP_ARCHITECTURE.md`

## Environment Configuration

### **Updated `env.example`**
```bash
# Intercom MCP Configuration
INTERCOM_MCP_ENABLED=true
INTERCOM_ACCESS_TOKEN=your_intercom_access_token
INTERCOM_MCP_READ_ONLY=true
INTERCOM_MCP_MAX_RESULTS=100
INTERCOM_MCP_TIMEOUT=300

# HubSpot MCP Configuration
HUBSPOT_MCP_ENABLED=true
HUBSPOT_CLIENT_ID=your_hubspot_client_id
HUBSPOT_CLIENT_SECRET=your_hubspot_client_secret
HUBSPOT_MCP_READ_ONLY=true

# Gong MCP Configuration
GONG_MCP_ENABLED=true
GONG_API_KEY=your_gong_api_key
GONG_MCP_READ_ONLY=true
GONG_MCP_MAX_RESULTS=100

# Clay MCP Configuration
CLAY_MCP_ENABLED=true
CLAY_API_KEY=your_clay_api_key
CLAY_MCP_READ_ONLY=true
CLAY_MCP_MAX_RESULTS=100

# Existing configurations...
# Mixpanel, Crayon, Snowflake configs already present
```

## User Experience Examples

### **Example 1: Single Source Query**
```
User: "Show me customer conversations about pricing"
↓
AI: Routes to Intercom
↓
Result: "Found 12 conversations about pricing:
1. John from Acme Corp - Asked about enterprise pricing
2. Sarah from Beta Inc - Inquired about volume discounts
..."
```

### **Example 2: Multi-Source Enrichment**
```
User: "Enrich our top customers with company funding data"
↓
AI: Detects need for HubSpot + Clay
↓
Progress: "Querying HubSpot... ✓ Enriching with Clay... ✓"
↓
Result: "Top 10 customers with funding data:
1. Acme Corp - $2.5M revenue | Series B, $50M funding
2. Beta Inc - $1.8M revenue | Series A, $15M funding
..."
```

### **Example 3: Cross-Source Analysis**
```
User: "Compare our HubSpot deals with Gong call outcomes"
↓
AI: Detects need for HubSpot + Gong
↓
Result: "Deal vs Call Analysis:
- 15 deals closed this month totaling $450K
- 78% of calls resulted in positive outcomes
- Deals with high Gong scores (8+) had 40% higher close rates
..."
```

## Success Metrics

### **Technical Metrics:**
- All 7 MCP clients successfully integrated
- Query response time < 3 seconds average
- 95%+ uptime for all data sources
- Zero security vulnerabilities

### **User Experience Metrics:**
- Natural language query success rate > 90%
- User satisfaction score > 4.5/5
- Average queries per user session > 5
- Cross-source query usage > 30%

### **Business Metrics:**
- Reduced time to insights by 70%
- Increased data-driven decisions by 50%
- Improved sales team productivity by 40%
- Enhanced customer support response quality

## Timeline Summary

- **Week 1-2**: Core infrastructure and MCP clients
- **Week 2-3**: API integration and query execution
- **Week 3-4**: UI implementation and user experience
- **Week 4-5**: Multi-source queries and advanced features
- **Week 5-6**: Testing, documentation, and optimization

**Total Implementation Time: 6 weeks**

This plan provides a comprehensive roadmap for implementing a powerful 7-source Data Assistant that will transform how your team accesses and analyzes GTM data.
