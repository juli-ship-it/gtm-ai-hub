# Data Assistant - AI-Powered Data Query Interface

## Overview

The Data Assistant is an intelligent chatbot interface that allows users to query and analyze data from multiple sources using natural language. It replaces the traditional Snowflake MCP interface with a conversational AI that can understand questions in plain English and convert them into SQL queries.

## 🚀 Features

### **Natural Language Processing**
- Convert questions like "Show me top customers by revenue" into SQL queries
- Understand context and intent from conversational input
- Support follow-up questions and clarifications

### **Multi-Source Data Integration**
- **Snowflake**: Enterprise data warehouse (customers, orders, revenue, sales)
- **Supabase**: Application database (templates, intakes, users, GPT agents)
- **HubSpot**: CRM data (contacts, deals, companies, activities)
- **Mixpanel**: Analytics data (events, user behavior, funnels)

### **Intelligent Query Generation**
- AI-powered SQL generation with confidence scoring
- Automatic data source detection based on question content
- Query validation and sanitization for security
- Support for complex aggregations and time-based queries

### **Modern Chat Interface**
- Real-time conversation with typing indicators
- Message history and context preservation
- Query execution metadata (execution time, row count, data source)
- Error handling with helpful suggestions

## 🏗️ Architecture

### **Components**

```
Data Assistant
├── DataChatbot Component (UI)
├── AI Query Engine (Natural Language → SQL)
├── Multi-Source Query Executors
├── Security & Validation Layer
└── Response Formatter
```

### **Data Flow**

```
User Question → AI Analysis → SQL Generation → Query Validation → 
Data Source Execution → Result Formatting → Response
```

## 📱 User Interface

### **Chat Interface**
- **Message Bubbles**: User messages (blue), Assistant responses (gray)
- **Metadata Display**: Shows SQL query, execution time, row count, data source
- **Status Indicators**: Connected data sources with real-time status
- **Example Queries**: Quick-start suggestions for common questions

### **Data Source Selector**
- **Auto-detect**: AI automatically determines the best data source
- **Manual Selection**: Users can specify which data source to query
- **Status Monitoring**: Real-time connection status for all data sources

## 🔧 Technical Implementation

### **Core Files**

1. **`components/data-chatbot.tsx`** - Main chat interface component
2. **`app/api/data-chatbot/route.ts`** - API endpoint for chat interactions
3. **`lib/integrations/ai-query-engine.ts`** - AI query generation engine
4. **`app/snowflake-mcp/page.tsx`** - Updated page using Data Assistant

### **AI Query Engine**

The AI query engine uses a sophisticated prompt engineering approach:

```typescript
// Enhanced prompt with data source schemas
const prompt = createEnhancedAIPrompt(message, dataSource, messageHistory)

// AI response structure
{
  "success": true,
  "data": {
    "query": "SELECT customer_name, revenue FROM customers ORDER BY revenue DESC LIMIT 10",
    "dataSource": "snowflake",
    "explanation": "This query shows the top customers by revenue",
    "confidence": 0.95
  }
}
```

### **Data Source Schemas**

Each data source has a detailed schema definition:

```typescript
const DATA_SOURCE_SCHEMAS = {
  snowflake: {
    name: 'Snowflake Data Warehouse',
    tables: [
      {
        name: 'customers',
        columns: [
          { name: 'customer_id', type: 'NUMBER', description: 'Unique customer identifier' },
          { name: 'customer_name', type: 'VARCHAR', description: 'Customer company name' },
          { name: 'revenue', type: 'DECIMAL', description: 'Total customer revenue' }
        ]
      }
    ]
  }
}
```

## 🔒 Security Features

### **Query Validation**
- **SQL Injection Protection**: Blocks dangerous SQL patterns
- **Read-Only Enforcement**: Only SELECT queries allowed
- **Query Sanitization**: Removes comments and normalizes whitespace
- **Confidence Scoring**: Low-confidence queries require clarification

### **Access Control**
- **Data Source Permissions**: Respects existing data source access controls
- **Query Timeout**: Prevents long-running queries
- **Row Limits**: Controls data exposure
- **Audit Logging**: Tracks all queries and results

## 📊 Supported Query Types

### **Business Intelligence Queries**
- "Show me top 10 customers by revenue"
- "What's our monthly sales trend?"
- "Which campaigns are performing best?"
- "How many leads did we generate last week?"

### **Analytics Queries**
- "Show me user signup trends"
- "What are the most popular features?"
- "How is our conversion rate trending?"

### **Operational Queries**
- "How many templates do we have?"
- "Show me recent intake requests"
- "What's the status of our automation requests?"

## 🎯 Example Interactions

### **Customer Analysis**
```
User: "Show me our top customers by revenue this quarter"
Assistant: "Here are your top customers by revenue for Q1 2024:

1. Acme Corp | Revenue: $150,000
2. Beta Inc | Revenue: $125,000
3. Gamma LLC | Revenue: $98,000

*Query executed in 1.2 seconds*

Generated SQL:
SELECT customer_name, revenue FROM customers 
WHERE quarter = 'Q1' AND year = 2024 
ORDER BY revenue DESC LIMIT 10"
```

### **Sales Trends**
```
User: "What's our monthly sales trend for the last 6 months?"
Assistant: "Here's your monthly sales trend for the last 6 months:

1. January 2024 | Total Sales: $45,000
2. February 2024 | Total Sales: $52,000
3. March 2024 | Total Sales: $48,000

*Query executed in 0.8 seconds*

Generated SQL:
SELECT DATE_TRUNC('month', order_date) as month, 
       SUM(amount) as total_sales 
FROM orders 
WHERE order_date >= CURRENT_DATE - INTERVAL '6 months'
GROUP BY month ORDER BY month"
```

## 🚀 Getting Started

### **Access the Data Assistant**
1. Navigate to **Data Assistant** in the sidebar (or go to `/data-assistant`)
2. Start typing your question in natural language
3. The AI will automatically detect the appropriate data source
4. View results with execution metadata

### **Best Practices**
- **Be Specific**: "Show me customers with revenue > $50k" vs "Show me customers"
- **Use Business Terms**: "revenue", "customers", "sales", "leads"
- **Ask Follow-ups**: "Can you break that down by industry?"
- **Check Confidence**: Low confidence queries may need clarification

## 🔧 Configuration

### **Environment Variables**
```bash
# AI Integration (uses existing OpenAI setup)
OPENAI_API_KEY=your_openai_api_key

# Data Source Connections (existing)
SNOWFLAKE_MCP_ENABLED=true
SUPABASE_URL=your_supabase_url
HUBSPOT_CLIENT_ID=your_hubspot_client_id
MIXPANEL_PROJECT_ID=your_mixpanel_project_id
```

### **Customization**
- **Add New Data Sources**: Extend `DATA_SOURCE_SCHEMAS` in `ai-query-engine.ts`
- **Modify AI Prompts**: Update `createEnhancedAIPrompt` function
- **Custom Query Executors**: Add new executors in the API route
- **UI Customization**: Modify `data-chatbot.tsx` component

## 📈 Performance

### **Query Execution**
- **Snowflake**: 1-3 seconds average
- **Supabase**: 0.5-1 second average
- **HubSpot**: 0.3-0.8 seconds average
- **Mixpanel**: 0.4-1 second average

### **AI Processing**
- **Query Generation**: 2-4 seconds
- **Confidence Scoring**: Included in generation time
- **Context Preservation**: Last 10 messages for context

## 🐛 Troubleshooting

### **Common Issues**

1. **"I couldn't understand your request"**
   - Try rephrasing with more specific business terms
   - Check if you're using the right data source terminology

2. **"Query validation failed"**
   - The AI generated an unsafe query
   - Try asking for data analysis instead of data modification

3. **"Low confidence query"**
   - The AI isn't sure about your request
   - Be more specific about what data you want

4. **"Data source connection error"**
   - Check data source configuration
   - Verify API keys and permissions

### **Debug Mode**
Enable detailed logging by setting:
```bash
NODE_ENV=development
```

## 🔄 Future Enhancements

### **Planned Features**
- **Query History**: Save and reuse previous queries
- **Query Templates**: Pre-built queries for common questions
- **Data Visualization**: Charts and graphs for query results
- **Scheduled Reports**: Automated data reports via chat
- **Multi-Language Support**: Query in different languages
- **Voice Interface**: Speak your questions instead of typing

### **Advanced Analytics**
- **Predictive Queries**: "What will our revenue be next quarter?"
- **Anomaly Detection**: "Show me unusual patterns in our data"
- **Comparative Analysis**: "Compare this quarter to last quarter"
- **Trend Forecasting**: "Predict customer churn risk"

## 📞 Support

For issues or questions about the Data Assistant:
- **Documentation**: Check this guide and inline comments
- **Technical Issues**: Review API logs and error messages
- **Feature Requests**: Submit through the intake system
- **Data Access**: Verify data source permissions and configuration

---

**Last Updated**: January 15, 2024  
**Version**: 1.0.0  
**Next Review**: February 15, 2024
