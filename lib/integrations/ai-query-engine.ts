// AI-powered query engine for natural language to SQL conversion
// Supports multiple data sources with intelligent query generation

export interface DataSourceSchema {
  name: string
  tables: TableSchema[]
  description: string
}

export interface TableSchema {
  name: string
  columns: ColumnSchema[]
  description: string
  sampleQueries?: string[]
}

export interface ColumnSchema {
  name: string
  type: string
  description: string
  nullable: boolean
  examples?: string[]
}

export interface QueryResult {
  success: boolean
  query?: string
  dataSource?: string
  explanation?: string
  error?: string
  confidence?: number
}

// Data source schemas for better AI understanding
export const DATA_SOURCE_SCHEMAS: Record<string, DataSourceSchema> = {
  snowflake: {
    name: 'Snowflake Data Warehouse',
    description: 'Enterprise data warehouse containing business-critical data',
    tables: [
      {
        name: 'customers',
        description: 'Customer information and profiles',
        columns: [
          { name: 'customer_id', type: 'NUMBER', description: 'Unique customer identifier', nullable: false, examples: ['1', '2', '3'] },
          { name: 'customer_name', type: 'VARCHAR', description: 'Customer company or individual name', nullable: false, examples: ['Acme Corp', 'Beta Inc'] },
          { name: 'email', type: 'VARCHAR', description: 'Customer email address', nullable: true, examples: ['john@acme.com', 'jane@beta.com'] },
          { name: 'revenue', type: 'DECIMAL', description: 'Total customer revenue', nullable: true, examples: ['50000', '75000'] },
          { name: 'created_at', type: 'TIMESTAMP', description: 'Customer creation date', nullable: false, examples: ['2024-01-15', '2024-01-16'] },
          { name: 'industry', type: 'VARCHAR', description: 'Customer industry', nullable: true, examples: ['Technology', 'Healthcare'] },
          { name: 'status', type: 'VARCHAR', description: 'Customer status', nullable: false, examples: ['active', 'inactive', 'prospect'] }
        ],
        sampleQueries: [
          'SELECT customer_name, revenue FROM customers ORDER BY revenue DESC LIMIT 10',
          'SELECT COUNT(*) FROM customers WHERE status = \'active\'',
          'SELECT industry, COUNT(*) FROM customers GROUP BY industry'
        ]
      },
      {
        name: 'orders',
        description: 'Order and transaction data',
        columns: [
          { name: 'order_id', type: 'NUMBER', description: 'Unique order identifier', nullable: false, examples: ['1001', '1002'] },
          { name: 'customer_id', type: 'NUMBER', description: 'Customer who placed the order', nullable: false, examples: ['1', '2'] },
          { name: 'order_date', type: 'DATE', description: 'Date the order was placed', nullable: false, examples: ['2024-01-15', '2024-01-16'] },
          { name: 'amount', type: 'DECIMAL', description: 'Order total amount', nullable: false, examples: ['1500.00', '2500.00'] },
          { name: 'status', type: 'VARCHAR', description: 'Order status', nullable: false, examples: ['completed', 'pending', 'cancelled'] },
          { name: 'product_category', type: 'VARCHAR', description: 'Product category', nullable: true, examples: ['Software', 'Services'] }
        ],
        sampleQueries: [
          'SELECT DATE_TRUNC(\'month\', order_date) as month, SUM(amount) as total_sales FROM orders GROUP BY month',
          'SELECT product_category, COUNT(*) FROM orders GROUP BY product_category',
          'SELECT customer_id, SUM(amount) as total_spent FROM orders GROUP BY customer_id ORDER BY total_spent DESC'
        ]
      },
      {
        name: 'products',
        description: 'Product catalog and information',
        columns: [
          { name: 'product_id', type: 'NUMBER', description: 'Unique product identifier', nullable: false, examples: ['101', '102'] },
          { name: 'product_name', type: 'VARCHAR', description: 'Product name', nullable: false, examples: ['Premium Plan', 'Basic Plan'] },
          { name: 'category', type: 'VARCHAR', description: 'Product category', nullable: false, examples: ['Software', 'Services'] },
          { name: 'price', type: 'DECIMAL', description: 'Product price', nullable: false, examples: ['99.99', '199.99'] },
          { name: 'is_active', type: 'BOOLEAN', description: 'Whether product is active', nullable: false, examples: ['true', 'false'] }
        ]
      }
    ]
  },
  
  supabase: {
    name: 'Supabase Application Database',
    description: 'Application database containing templates, intakes, and user data',
    tables: [
      {
        name: 'templates',
        description: 'n8n workflow templates',
        columns: [
          { name: 'id', type: 'UUID', description: 'Template unique identifier', nullable: false },
          { name: 'name', type: 'VARCHAR', description: 'Template name', nullable: false, examples: ['HubSpot Lead Import', 'Slack Notification'] },
          { name: 'description', type: 'TEXT', description: 'Template description', nullable: true },
          { name: 'category', type: 'VARCHAR', description: 'Template category', nullable: false, examples: ['content', 'automation', 'reporting'] },
          { name: 'created_at', type: 'TIMESTAMP', description: 'Creation timestamp', nullable: false },
          { name: 'is_public', type: 'BOOLEAN', description: 'Whether template is public', nullable: false },
          { name: 'usage_count', type: 'INTEGER', description: 'Number of times used', nullable: true }
        ],
        sampleQueries: [
          'SELECT name, category, usage_count FROM templates WHERE is_public = true ORDER BY usage_count DESC',
          'SELECT category, COUNT(*) FROM templates GROUP BY category',
          'SELECT COUNT(*) FROM templates WHERE created_at >= CURRENT_DATE - INTERVAL \'30 days\''
        ]
      },
      {
        name: 'intakes',
        description: 'GTM intake requests and submissions',
        columns: [
          { name: 'id', type: 'UUID', description: 'Intake unique identifier', nullable: false },
          { name: 'title', type: 'VARCHAR', description: 'Intake request title', nullable: false },
          { name: 'category', type: 'VARCHAR', description: 'Intake category', nullable: false, examples: ['campaign_execution', 'content_creation'] },
          { name: 'status', type: 'VARCHAR', description: 'Request status', nullable: false, examples: ['pending', 'in_progress', 'completed'] },
          { name: 'created_at', type: 'TIMESTAMP', description: 'Submission timestamp', nullable: false },
          { name: 'priority', type: 'VARCHAR', description: 'Request priority', nullable: false, examples: ['low', 'medium', 'high', 'urgent'] }
        ]
      }
    ]
  },
  
  hubspot: {
    name: 'HubSpot CRM',
    description: 'Customer relationship management data',
    tables: [
      {
        name: 'contacts',
        description: 'Contact and lead information',
        columns: [
          { name: 'contact_id', type: 'NUMBER', description: 'HubSpot contact ID', nullable: false },
          { name: 'email', type: 'VARCHAR', description: 'Contact email', nullable: false },
          { name: 'first_name', type: 'VARCHAR', description: 'First name', nullable: true },
          { name: 'last_name', type: 'VARCHAR', description: 'Last name', nullable: true },
          { name: 'company', type: 'VARCHAR', description: 'Company name', nullable: true },
          { name: 'lifecycle_stage', type: 'VARCHAR', description: 'Sales lifecycle stage', nullable: true, examples: ['lead', 'opportunity', 'customer'] },
          { name: 'created_at', type: 'TIMESTAMP', description: 'Contact creation date', nullable: false }
        ]
      },
      {
        name: 'deals',
        description: 'Sales deals and opportunities',
        columns: [
          { name: 'deal_id', type: 'NUMBER', description: 'HubSpot deal ID', nullable: false },
          { name: 'deal_name', type: 'VARCHAR', description: 'Deal name', nullable: false },
          { name: 'amount', type: 'DECIMAL', description: 'Deal amount', nullable: true },
          { name: 'stage', type: 'VARCHAR', description: 'Deal stage', nullable: false, examples: ['appointmentscheduled', 'qualifiedtobuy', 'closedwon'] },
          { name: 'close_date', type: 'DATE', description: 'Expected close date', nullable: true }
        ]
      }
    ]
  },
  
  mixpanel: {
    name: 'Mixpanel Analytics',
    description: 'User behavior and event tracking data',
    tables: [
      {
        name: 'events',
        description: 'User events and actions',
        columns: [
          { name: 'event_name', type: 'VARCHAR', description: 'Event name', nullable: false, examples: ['page_view', 'signup', 'purchase'] },
          { name: 'user_id', type: 'VARCHAR', description: 'User identifier', nullable: true },
          { name: 'timestamp', type: 'TIMESTAMP', description: 'Event timestamp', nullable: false },
          { name: 'properties', type: 'JSON', description: 'Event properties', nullable: true }
        ]
      }
    ]
  }
}

export function createEnhancedAIPrompt(
  message: string, 
  dataSource: string, 
  messageHistory: any[]
): string {
  const context = messageHistory.slice(-3).map(msg => 
    `${msg.type}: ${msg.content}`
  ).join('\n')

  const schemaInfo = Object.entries(DATA_SOURCE_SCHEMAS)
    .map(([key, schema]) => {
      const tablesInfo = schema.tables.map(table => {
        const columnsInfo = table.columns.map(col => 
          `    - ${col.name} (${col.type}): ${col.description}${col.examples ? ` - Examples: ${col.examples.join(', ')}` : ''}`
        ).join('\n')
        return `  ${table.name}: ${table.description}\n${columnsInfo}`
      }).join('\n\n')
      
      return `${key.toUpperCase()}:\n${schema.description}\n\n${tablesInfo}`
    }).join('\n\n')

  return `You are an expert data analyst AI assistant. Convert the user's natural language question into a SQL query and determine the appropriate data source.

AVAILABLE DATA SOURCES AND SCHEMAS:
${schemaInfo}

User's question: "${message}"
Preferred data source: ${dataSource === 'auto' ? 'auto-detect based on question content' : dataSource}

Recent conversation context:
${context}

Return ONLY a JSON object with this exact structure:
{
  "success": true,
  "data": {
    "query": "SELECT ... FROM ... WHERE ...",
    "dataSource": "snowflake|supabase|hubspot|mixpanel",
    "explanation": "Brief explanation of what this query does and what insights it provides",
    "confidence": 0.95
  }
}

Guidelines:
- Use standard SQL syntax appropriate for the data source
- Only SELECT queries (no INSERT, UPDATE, DELETE, DROP, ALTER)
- Use exact table and column names from the schema above
- For Snowflake: Use DATE_TRUNC, SUM, COUNT, GROUP BY for aggregations
- For Supabase: Use PostgreSQL syntax
- For HubSpot: Use standard SQL with HubSpot table names
- For Mixpanel: Use event-based queries with JSON properties
- If the question is unclear or ambiguous, set success: false and provide an error message
- Set confidence between 0.0 and 1.0 based on how certain you are about the query

Examples:
- "Show me top customers by revenue" → SELECT customer_name, revenue FROM customers ORDER BY revenue DESC LIMIT 10
- "How many templates do we have?" → SELECT COUNT(*) as template_count FROM templates
- "What's our monthly sales trend?" → SELECT DATE_TRUNC('month', order_date) as month, SUM(amount) as total_sales FROM orders GROUP BY month ORDER BY month
- "Show me recent signups" → SELECT COUNT(*) FROM events WHERE event_name = 'signup' AND timestamp >= CURRENT_DATE - INTERVAL '7 days'`
}

export function validateQuery(query: string, dataSource: string): boolean {
  // Basic SQL injection protection
  const dangerousPatterns = [
    /drop\s+table/i,
    /delete\s+from/i,
    /truncate\s+table/i,
    /alter\s+table/i,
    /create\s+table/i,
    /insert\s+into/i,
    /update\s+/i,
    /grant\s+/i,
    /revoke\s+/i,
    /exec\s+/i,
    /execute\s+/i
  ]

  if (dangerousPatterns.some(pattern => pattern.test(query))) {
    return false
  }

  // Ensure it's a SELECT query
  if (!/^\s*select\s+/i.test(query.trim())) {
    return false
  }

  return true
}

export function sanitizeQuery(query: string): string {
  return query
    .replace(/--.*$/gm, '') // Remove SQL comments
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
}

export function getDataSourceFromQuery(query: string): string {
  // Try to infer data source from query content
  const queryLower = query.toLowerCase()
  
  if (queryLower.includes('customers') || queryLower.includes('orders') || queryLower.includes('revenue')) {
    return 'snowflake'
  }
  
  if (queryLower.includes('templates') || queryLower.includes('intakes') || queryLower.includes('gpt_agents')) {
    return 'supabase'
  }
  
  if (queryLower.includes('contacts') || queryLower.includes('deals') || queryLower.includes('hubspot')) {
    return 'hubspot'
  }
  
  if (queryLower.includes('events') || queryLower.includes('mixpanel') || queryLower.includes('signup')) {
    return 'mixpanel'
  }
  
  return 'snowflake' // Default fallback
}
