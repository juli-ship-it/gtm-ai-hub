# Data Assistant MCP Integration Plan - 7 Sources

## Overview

Enhance the existing Data Assistant to support 7 MCP data sources: Intercom, HubSpot, Gong, Mixpanel, Crayon, Snowflake, and Clay. This will replace mock implementations with real MCP integrations and add new data sources for comprehensive GTM intelligence with data enrichment capabilities.

## Current State

The Data Assistant (`/data-assistant`) currently has:
- Working: Snowflake MCP integration
- Already integrated: Mixpanel MCP, Crayon MCP (just added)
- Mock implementations: HubSpot queries (needs real integration)
- Missing: Intercom MCP, Gong MCP, Clay MCP integrations
- Core files: `app/api/data-chatbot/route.ts`, `lib/integrations/ai-query-engine.ts`, `components/data-chatbot.tsx`

## 7 Data Sources

1. **Intercom** - Customer support conversations and tickets
2. **HubSpot** - CRM contacts, deals, companies, activities
3. **Gong** - Sales call intelligence and conversation analytics
4. **Mixpanel** - Product analytics and user behavior
5. **Crayon** - Competitive intelligence and market insights
6. **Snowflake** - Data warehouse and business intelligence
7. **Clay** - Data enrichment and lead generation

## Implementation Steps

### 1. Create MCP Client Implementations

**Intercom MCP Client** (`lib/integrations/intercom-mcp.ts`)
- Create MCP client following same pattern as Crayon MCP
- Support queries for: conversations, contacts, companies, messages, tickets
- Include mock data for development mode
- Types: Conversation, Contact, Company, Ticket

**HubSpot MCP Client** (`lib/integrations/hubspot-mcp.ts`)
- Create MCP client (or API wrapper with MCP interface if no official MCP)
- Support queries for: contacts, deals, companies, activities, pipelines
- Include mock data for development mode
- Types: Contact, Deal, Company, Activity

**Gong MCP Client** (`lib/integrations/gong-mcp.ts`)
- Create MCP client (or API wrapper with MCP interface if no official MCP)
- Support queries for: calls, transcripts, topics, insights, scorecards
- Include mock data for development mode
- Types: Call, Transcript, Topic, Insight

**Clay MCP Client** (`lib/integrations/clay-mcp.ts`)
- Create MCP client (or API wrapper with MCP interface if no official MCP)
- Support queries for: contact enrichment, company insights, lead generation, data verification
- Include mock data for development mode
- Types: EnrichedContact, CompanyInsight, Prospect, VerificationResult

### 2. Update AI Query Engine Schemas

**Update `lib/integrations/ai-query-engine.ts`:**

- Add Intercom schema to `DATA_SOURCE_SCHEMAS`:
  - Tables: conversations, contacts, companies, messages, tickets
  - Columns with descriptions and examples
  - Sample queries for common use cases

- Add HubSpot schema (enhance existing):
  - Tables: contacts, deals, companies, activities, pipelines
  - Columns with descriptions and examples
  - Sample queries for sales/CRM queries

- Add Gong schema:
  - Tables: calls, transcripts, topics, insights, scorecards
  - Columns with descriptions and examples
  - Sample queries for conversation intelligence

- Add Clay schema:
  - Tables: enriched_contacts, company_insights, prospects, verification_results
  - Columns with descriptions and examples
  - Sample queries for data enrichment and lead generation

- Update Mixpanel schema (enhance existing)
- Update Crayon schema (add to schemas)
- Verify Snowflake schema (already exists)

### 3. Update Data Chatbot API Route

**Update `app/api/data-chatbot/route.ts`:**

- Import new MCP clients: `createIntercomMCPClient`, `createHubSpotMCPClient`, `createGongMCPClient`, `createClayMCPClient`
- Replace mock `executeHubSpotQuery` with real MCP integration
- Replace mock `executeMixpanelQuery` with real MCP integration (using existing mixpanel-mcp.ts)
- Add new executor functions:
  - `executeIntercomQuery(query: string)` - use Intercom MCP client
  - `executeGongQuery(query: string)` - use Gong MCP client
  - `executeClayQuery(query: string)` - use Clay MCP client
  - `executeCrayonQuery(query: string)` - use existing Crayon MCP client
- Update switch statement to include all 7 data sources
- Add proper error handling for each source

### 4. Update UI Components

**Update `components/data-chatbot.tsx`:**

- Add data source status indicators for all 7 sources
- Update example queries to include samples from each source:
  - Intercom: "Show me recent customer conversations"
  - HubSpot: "What deals are closing this month?"
  - Gong: "Show me top sales call topics"
  - Mixpanel: "What features are users engaging with most?"
  - Crayon: "What are our competitors doing?"
  - Snowflake: "Show me revenue trends"
  - Clay: "Enrich our top customers with company data"
- Update data source selector to show all 7 options
- Add icons/badges for each data source type

**Update `app/data-assistant/page.tsx`:**
- Update description to mention all 7 data sources
- Update metadata

### 5. Environment Configuration

**Update `env.example`:**

- Add Intercom MCP configuration:
  - `INTERCOM_MCP_ENABLED=true`
  - `INTERCOM_ACCESS_TOKEN=your_token`
  - `INTERCOM_MCP_READ_ONLY=true`

- Add Gong MCP configuration:
  - `GONG_MCP_ENABLED=true`
  - `GONG_API_KEY=your_key`
  - `GONG_MCP_READ_ONLY=true`

- Add Clay MCP configuration:
  - `CLAY_MCP_ENABLED=true`
  - `CLAY_API_KEY=your_key`
  - `CLAY_MCP_READ_ONLY=true`

- Verify existing HubSpot, Mixpanel, Crayon, Snowflake configs are present

### 6. Create Test Suite

**Create `test-data-assistant-mcps.js`:**
- Test all 7 MCP client connections
- Test query execution for each source with mock data
- Verify AI query generation for each source type
- Test error handling and validation
- Test data source auto-detection
- Test multi-source queries (HubSpot + Clay enrichment)

### 7. Update Documentation

**Update `DATA_ASSISTANT_DOCUMENTATION.md`:**
- Add Intercom to Multi-Source Data Integration section
- Add Gong to Multi-Source Data Integration section
- Add Clay to Multi-Source Data Integration section
- Update Crayon section (new addition)
- Add example queries for each new source
- Update configuration section with new env vars
- Add troubleshooting for each data source

**Create `DATA_SOURCES_INTEGRATION_GUIDE.md`:**
- Comprehensive guide for each of the 7 data sources
- Setup instructions for each MCP
- Schema documentation
- Query examples and best practices
- Security and access control per source

## Multi-Source Query Examples

### Cross-Source Analysis
```
"Compare our HubSpot deals with Gong call outcomes"
→ HubSpot: Get deals data
→ Gong: Get call outcomes
→ AI: Analyze correlation between call quality and deal success
```

### Data Enrichment Workflows
```
"Enrich our top customers with company funding information"
→ HubSpot: Get top customers by deal value
→ Clay: Enrich with company funding data
→ AI: Combine and analyze customer value vs funding stage
```

### Customer Journey Analysis
```
"Show me the complete customer journey from first contact to deal close"
→ Intercom: Get initial conversations
→ HubSpot: Get deal progression
→ Gong: Get sales call outcomes
→ AI: Map complete customer journey
```

### Lead Generation
```
"Find new prospects in fintech with recent funding"
→ Clay: Search for fintech companies with recent funding
→ HubSpot: Check if we already have these companies
→ AI: Present new prospect opportunities
```

## Key Files to Modify

1. `lib/integrations/intercom-mcp.ts` (new)
2. `lib/integrations/hubspot-mcp.ts` (new)
3. `lib/integrations/gong-mcp.ts` (new)
4. `lib/integrations/clay-mcp.ts` (new)
5. `lib/integrations/ai-query-engine.ts` (update schemas)
6. `app/api/data-chatbot/route.ts` (add executors)
7. `components/data-chatbot.tsx` (update UI)
8. `app/data-assistant/page.tsx` (update description)
9. `env.example` (add configs)
10. `DATA_ASSISTANT_DOCUMENTATION.md` (update)
11. `test-data-assistant-mcps.js` (new)

## Security Considerations

All MCP integrations will follow these security patterns:
- Read-only access by default
- Query validation and sanitization (already implemented)
- Rate limiting per data source
- Audit logging for all queries
- Mock data mode for development/testing
- No PII exposure in logs
- Proper error handling without leaking sensitive info

## Expected Benefits

- Unified natural language interface for all GTM data
- Consistent security model across all sources
- Faster insights with AI-powered query generation
- Reduced context switching between tools
- Comprehensive data access for sales, marketing, and support teams
- Data enrichment capabilities for better decision making
- Cross-source analysis and correlation insights

## Implementation Priority

### Phase 1: Core MCP Clients
1. Create Intercom MCP client
2. Create HubSpot MCP client  
3. Create Gong MCP client
4. Create Clay MCP client

### Phase 2: Integration & Testing
1. Update AI query engine schemas
2. Update API route with all executors
3. Update UI components
4. Create comprehensive test suite

### Phase 3: Documentation & Optimization
1. Update documentation
2. Add multi-source query examples
3. Performance optimization
4. User training materials

## To-dos

- [ ] Create Intercom MCP client with conversation, contact, company, and ticket query support
- [ ] Create HubSpot MCP client with contact, deal, company, and activity query support
- [ ] Create Gong MCP client with call, transcript, topic, and insight query support
- [ ] Create Clay MCP client with contact enrichment, company insights, and lead generation support
- [ ] Update AI query engine with schemas for all 7 data sources (Intercom, HubSpot, Gong, Mixpanel, Crayon, Snowflake, Clay)
- [ ] Update data-chatbot API route with all 7 MCP query executors and proper error handling
- [ ] Update Data Chatbot UI with all 7 data source indicators, examples, and status monitoring
- [ ] Update environment configuration with Intercom, Gong, and Clay MCP settings
- [ ] Create comprehensive test suite for all 7 MCP integrations
- [ ] Update documentation with all 7 data sources, examples, and setup guides
- [ ] Implement multi-source query capabilities for cross-source analysis
- [ ] Add data enrichment workflows (HubSpot + Clay integration)
- [ ] Create customer journey analysis capabilities
- [ ] Add lead generation and prospect research features
