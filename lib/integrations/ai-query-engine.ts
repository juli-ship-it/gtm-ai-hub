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
  intercom: {
    name: 'Intercom Customer Support',
    description: 'Customer support conversations, tickets, and contact data',
    tables: [
      {
        name: 'conversations',
        description: 'Customer support conversations and chat history',
        columns: [
          { name: 'id', type: 'STRING', description: 'Conversation ID', nullable: false, examples: ['conv_1', 'conv_2'] },
          { name: 'topic', type: 'STRING', description: 'Conversation topic or subject', nullable: true, examples: ['pricing', 'technical_support', 'billing'] },
          { name: 'created_at', type: 'TIMESTAMP', description: 'When conversation started', nullable: false, examples: ['2024-01-15T10:30:00Z'] },
          { name: 'updated_at', type: 'TIMESTAMP', description: 'Last message timestamp', nullable: false, examples: ['2024-01-15T11:45:00Z'] },
          { name: 'contact_id', type: 'STRING', description: 'Customer contact ID', nullable: false, examples: ['contact_1', 'contact_2'] },
          { name: 'status', type: 'STRING', description: 'Conversation status', nullable: false, examples: ['open', 'closed', 'pending'] },
          { name: 'message_count', type: 'NUMBER', description: 'Number of messages in conversation', nullable: false, examples: ['5', '12', '3'] },
          { name: 'assignee_id', type: 'STRING', description: 'Support agent assigned', nullable: true, examples: ['user_1', 'user_2'] },
          { name: 'tags', type: 'ARRAY', description: 'Conversation tags', nullable: true, examples: ['[pricing, enterprise]', '[bug, urgent]'] }
        ],
        sampleQueries: [
          'SELECT topic, COUNT(*) FROM conversations WHERE created_at >= NOW() - INTERVAL \'7 days\' GROUP BY topic',
          'SELECT contact_id, COUNT(*) FROM conversations WHERE status = \'open\' GROUP BY contact_id',
          'SELECT assignee_id, AVG(message_count) FROM conversations GROUP BY assignee_id'
        ]
      },
      {
        name: 'contacts',
        description: 'Customer contact information and profiles',
        columns: [
          { name: 'id', type: 'STRING', description: 'Contact ID', nullable: false, examples: ['contact_1', 'contact_2'] },
          { name: 'name', type: 'STRING', description: 'Contact name', nullable: true, examples: ['John Smith', 'Sarah Johnson'] },
          { name: 'email', type: 'STRING', description: 'Contact email address', nullable: false, examples: ['john@acme.com', 'sarah@beta.com'] },
          { name: 'phone', type: 'STRING', description: 'Contact phone number', nullable: true, examples: ['+1-555-0123', '+1-555-0456'] },
          { name: 'company_id', type: 'STRING', description: 'Associated company ID', nullable: true, examples: ['company_1', 'company_2'] },
          { name: 'created_at', type: 'TIMESTAMP', description: 'Contact creation date', nullable: false, examples: ['2024-01-01T00:00:00Z'] },
          { name: 'last_seen_at', type: 'TIMESTAMP', description: 'Last activity timestamp', nullable: true, examples: ['2024-01-15T14:30:00Z'] },
          { name: 'tags', type: 'ARRAY', description: 'Contact tags', nullable: true, examples: ['[vip, enterprise]', '[technical, support]'] }
        ],
        sampleQueries: [
          'SELECT name, email, last_seen_at FROM contacts WHERE last_seen_at >= NOW() - INTERVAL \'30 days\'',
          'SELECT company_id, COUNT(*) FROM contacts GROUP BY company_id',
          'SELECT tags, COUNT(*) FROM contacts WHERE tags IS NOT NULL GROUP BY tags'
        ]
      },
      {
        name: 'companies',
        description: 'Company information and organization data',
        columns: [
          { name: 'id', type: 'STRING', description: 'Company ID', nullable: false, examples: ['company_1', 'company_2'] },
          { name: 'name', type: 'STRING', description: 'Company name', nullable: false, examples: ['Acme Corp', 'Beta Inc'] },
          { name: 'website', type: 'STRING', description: 'Company website', nullable: true, examples: ['https://acme.com', 'https://beta.com'] },
          { name: 'industry', type: 'STRING', description: 'Company industry', nullable: true, examples: ['Technology', 'Healthcare', 'Finance'] },
          { name: 'size', type: 'STRING', description: 'Company size category', nullable: true, examples: ['1-10', '11-50', '51-200', '201-500'] },
          { name: 'created_at', type: 'TIMESTAMP', description: 'Company creation date', nullable: false, examples: ['2024-01-01T00:00:00Z'] },
          { name: 'plan', type: 'STRING', description: 'Intercom plan', nullable: true, examples: ['starter', 'professional', 'enterprise'] },
          { name: 'monthly_spend', type: 'NUMBER', description: 'Monthly spend amount', nullable: true, examples: ['99', '299', '999'] }
        ],
        sampleQueries: [
          'SELECT name, industry, size FROM companies WHERE size IN (\'51-200\', \'201-500\')',
          'SELECT plan, COUNT(*) FROM companies GROUP BY plan',
          'SELECT industry, AVG(monthly_spend) FROM companies GROUP BY industry'
        ]
      },
      {
        name: 'tickets',
        description: 'Support tickets and issue tracking',
        columns: [
          { name: 'id', type: 'STRING', description: 'Ticket ID', nullable: false, examples: ['ticket_1', 'ticket_2'] },
          { name: 'title', type: 'STRING', description: 'Ticket title', nullable: false, examples: ['Login issues', 'Feature request'] },
          { name: 'description', type: 'TEXT', description: 'Ticket description', nullable: true },
          { name: 'status', type: 'STRING', description: 'Ticket status', nullable: false, examples: ['new', 'open', 'pending', 'solved', 'closed'] },
          { name: 'priority', type: 'STRING', description: 'Ticket priority', nullable: false, examples: ['low', 'normal', 'high', 'urgent'] },
          { name: 'created_at', type: 'TIMESTAMP', description: 'Ticket creation date', nullable: false, examples: ['2024-01-15T09:00:00Z'] },
          { name: 'contact_id', type: 'STRING', description: 'Contact who created ticket', nullable: false, examples: ['contact_1', 'contact_2'] },
          { name: 'assignee_id', type: 'STRING', description: 'Assigned support agent', nullable: true, examples: ['user_1', 'user_2'] }
        ],
        sampleQueries: [
          'SELECT status, COUNT(*) FROM tickets GROUP BY status',
          'SELECT priority, AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/3600) FROM tickets GROUP BY priority',
          'SELECT assignee_id, COUNT(*) FROM tickets WHERE status = \'open\' GROUP BY assignee_id'
        ]
      }
    ]
  },

  hubspot: {
    name: 'HubSpot CRM',
    description: 'Customer relationship management data with contacts, deals, companies, and activities',
    tables: [
      {
        name: 'contacts',
        description: 'Contact and lead information',
        columns: [
          { name: 'id', type: 'STRING', description: 'HubSpot contact ID', nullable: false, examples: ['contact_1', 'contact_2'] },
          { name: 'email', type: 'STRING', description: 'Contact email address', nullable: false, examples: ['john@acme.com', 'sarah@beta.com'] },
          { name: 'firstname', type: 'STRING', description: 'First name', nullable: true, examples: ['John', 'Sarah'] },
          { name: 'lastname', type: 'STRING', description: 'Last name', nullable: true, examples: ['Smith', 'Johnson'] },
          { name: 'phone', type: 'STRING', description: 'Phone number', nullable: true, examples: ['+1-555-0123', '+1-555-0456'] },
          { name: 'company', type: 'STRING', description: 'Company name', nullable: true, examples: ['Acme Corp', 'Beta Inc'] },
          { name: 'lifecyclestage', type: 'STRING', description: 'Sales lifecycle stage', nullable: true, examples: ['lead', 'opportunity', 'customer', 'evangelist'] },
          { name: 'createdate', type: 'TIMESTAMP', description: 'Contact creation date', nullable: false, examples: ['2024-01-01T00:00:00Z'] },
          { name: 'lastmodifieddate', type: 'TIMESTAMP', description: 'Last modification date', nullable: false, examples: ['2024-01-15T14:30:00Z'] }
        ],
        sampleQueries: [
          'SELECT firstname, lastname, company, lifecyclestage FROM contacts WHERE lifecyclestage = \'customer\'',
          'SELECT lifecyclestage, COUNT(*) FROM contacts GROUP BY lifecyclestage',
          'SELECT company, COUNT(*) FROM contacts WHERE company IS NOT NULL GROUP BY company ORDER BY COUNT(*) DESC'
        ]
      },
      {
        name: 'deals',
        description: 'Sales deals and opportunities',
        columns: [
          { name: 'id', type: 'STRING', description: 'HubSpot deal ID', nullable: false, examples: ['deal_1', 'deal_2'] },
          { name: 'dealname', type: 'STRING', description: 'Deal name', nullable: false, examples: ['Acme Corp Enterprise', 'Beta Inc Professional'] },
          { name: 'amount', type: 'NUMBER', description: 'Deal amount', nullable: true, examples: ['50000', '25000', '100000'] },
          { name: 'dealstage', type: 'STRING', description: 'Deal stage', nullable: false, examples: ['appointmentscheduled', 'qualifiedtobuy', 'negotiation', 'closedwon', 'closedlost'] },
          { name: 'closedate', type: 'DATE', description: 'Expected close date', nullable: true, examples: ['2024-02-15', '2024-03-01'] },
          { name: 'createdate', type: 'TIMESTAMP', description: 'Deal creation date', nullable: false, examples: ['2024-01-01T00:00:00Z'] },
          { name: 'pipeline', type: 'STRING', description: 'Sales pipeline', nullable: false, examples: ['default', 'enterprise', 'partnership'] }
        ],
        sampleQueries: [
          'SELECT dealname, amount, dealstage FROM deals WHERE dealstage = \'closedwon\' ORDER BY amount DESC',
          'SELECT dealstage, COUNT(*), SUM(amount) FROM deals GROUP BY dealstage',
          'SELECT DATE_TRUNC(\'month\', closedate) as month, SUM(amount) FROM deals WHERE closedate >= NOW() GROUP BY month'
        ]
      },
      {
        name: 'companies',
        description: 'Company and organization records',
        columns: [
          { name: 'id', type: 'STRING', description: 'HubSpot company ID', nullable: false, examples: ['company_1', 'company_2'] },
          { name: 'name', type: 'STRING', description: 'Company name', nullable: false, examples: ['Acme Corp', 'Beta Inc'] },
          { name: 'domain', type: 'STRING', description: 'Company domain', nullable: true, examples: ['acme.com', 'beta.com'] },
          { name: 'industry', type: 'STRING', description: 'Company industry', nullable: true, examples: ['Technology', 'Healthcare', 'Finance'] },
          { name: 'numberofemployees', type: 'NUMBER', description: 'Number of employees', nullable: true, examples: ['50', '200', '1000'] },
          { name: 'createdate', type: 'TIMESTAMP', description: 'Company creation date', nullable: false, examples: ['2024-01-01T00:00:00Z'] },
          { name: 'annualrevenue', type: 'NUMBER', description: 'Annual revenue', nullable: true, examples: ['1000000', '10000000', '50000000'] }
        ],
        sampleQueries: [
          'SELECT name, industry, numberofemployees FROM companies WHERE numberofemployees > 100',
          'SELECT industry, COUNT(*), AVG(numberofemployees) FROM companies GROUP BY industry',
          'SELECT name, annualrevenue FROM companies WHERE annualrevenue > 1000000 ORDER BY annualrevenue DESC'
        ]
      },
      {
        name: 'activities',
        description: 'Sales activities and touchpoints',
        columns: [
          { name: 'id', type: 'STRING', description: 'Activity ID', nullable: false, examples: ['activity_1', 'activity_2'] },
          { name: 'type', type: 'STRING', description: 'Activity type', nullable: false, examples: ['email', 'call', 'meeting', 'note', 'task'] },
          { name: 'timestamp', type: 'TIMESTAMP', description: 'Activity timestamp', nullable: false, examples: ['2024-01-15T10:30:00Z'] },
          { name: 'contact_id', type: 'STRING', description: 'Associated contact', nullable: true, examples: ['contact_1', 'contact_2'] },
          { name: 'company_id', type: 'STRING', description: 'Associated company', nullable: true, examples: ['company_1', 'company_2'] },
          { name: 'deal_id', type: 'STRING', description: 'Associated deal', nullable: true, examples: ['deal_1', 'deal_2'] },
          { name: 'subject', type: 'STRING', description: 'Activity subject', nullable: true, examples: ['Follow up call', 'Demo scheduled'] }
        ],
        sampleQueries: [
          'SELECT type, COUNT(*) FROM activities WHERE timestamp >= NOW() - INTERVAL \'30 days\' GROUP BY type',
          'SELECT contact_id, COUNT(*) FROM activities GROUP BY contact_id ORDER BY COUNT(*) DESC',
          'SELECT DATE_TRUNC(\'day\', timestamp) as day, COUNT(*) FROM activities GROUP BY day ORDER BY day'
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
          { name: 'id', type: 'STRING', description: 'Call ID', nullable: false, examples: ['call_1', 'call_2'] },
          { name: 'title', type: 'STRING', description: 'Call title', nullable: false, examples: ['Discovery Call - Acme Corp', 'Demo - Beta Inc'] },
          { name: 'started', type: 'TIMESTAMP', description: 'Call start time', nullable: false, examples: ['2024-01-15T10:00:00Z'] },
          { name: 'finished', type: 'TIMESTAMP', description: 'Call end time', nullable: false, examples: ['2024-01-15T10:30:00Z'] },
          { name: 'duration', type: 'NUMBER', description: 'Call duration in seconds', nullable: false, examples: ['1800', '2700', '3600'] },
          { name: 'outcome', type: 'STRING', description: 'Call outcome', nullable: false, examples: ['connected', 'no_answer', 'voicemail', 'busy', 'failed'] },
          { name: 'score', type: 'NUMBER', description: 'Call quality score', nullable: true, examples: ['8.5', '7.2', '9.1'] },
          { name: 'topics', type: 'ARRAY', description: 'Topics discussed', nullable: true, examples: ['[pricing, features, integration]', '[objections, competitors]'] },
          { name: 'insights', type: 'ARRAY', description: 'Key insights from call', nullable: true, examples: ['[Budget concerns raised]', '[Decision maker identified]'] }
        ],
        sampleQueries: [
          'SELECT title, duration, score FROM calls WHERE outcome = \'connected\' ORDER BY score DESC',
          'SELECT outcome, COUNT(*), AVG(duration) FROM calls GROUP BY outcome',
          'SELECT DATE_TRUNC(\'week\', started) as week, COUNT(*), AVG(score) FROM calls GROUP BY week'
        ]
      },
      {
        name: 'transcripts',
        description: 'Call conversation transcripts and analysis',
        columns: [
          { name: 'id', type: 'STRING', description: 'Transcript ID', nullable: false, examples: ['transcript_1', 'transcript_2'] },
          { name: 'call_id', type: 'STRING', description: 'Associated call ID', nullable: false, examples: ['call_1', 'call_2'] },
          { name: 'content', type: 'TEXT', description: 'Full transcript content', nullable: true },
          { name: 'summary', type: 'TEXT', description: 'Call summary', nullable: true, examples: ['Discovery call focused on integration requirements'] },
          { name: 'key_points', type: 'ARRAY', description: 'Key discussion points', nullable: true, examples: ['[Integration critical, Budget approval needed]'] },
          { name: 'sentiment', type: 'STRING', description: 'Overall call sentiment', nullable: true, examples: ['positive', 'neutral', 'negative'] },
          { name: 'confidence', type: 'NUMBER', description: 'Transcript confidence score', nullable: true, examples: ['0.92', '0.87', '0.95'] }
        ],
        sampleQueries: [
          'SELECT call_id, summary, sentiment FROM transcripts WHERE sentiment = \'positive\'',
          'SELECT sentiment, COUNT(*) FROM transcripts GROUP BY sentiment',
          'SELECT call_id, confidence FROM transcripts WHERE confidence > 0.9 ORDER BY confidence DESC'
        ]
      },
      {
        name: 'topics',
        description: 'AI-identified conversation topics and trends',
        columns: [
          { name: 'id', type: 'STRING', description: 'Topic ID', nullable: false, examples: ['topic_1', 'topic_2'] },
          { name: 'name', type: 'STRING', description: 'Topic name', nullable: false, examples: ['Pricing', 'Integration', 'Competitors'] },
          { name: 'category', type: 'STRING', description: 'Topic category', nullable: false, examples: ['Commercial', 'Technical', 'Competitive'] },
          { name: 'frequency', type: 'NUMBER', description: 'How often topic appears', nullable: false, examples: ['45', '32', '28'] },
          { name: 'sentiment', type: 'STRING', description: 'Topic sentiment', nullable: true, examples: ['positive', 'neutral', 'negative'] },
          { name: 'examples', type: 'ARRAY', description: 'Example mentions', nullable: true, examples: ['[What are your pricing options?, How does pricing compare?]'] }
        ],
        sampleQueries: [
          'SELECT name, frequency, sentiment FROM topics ORDER BY frequency DESC',
          'SELECT category, COUNT(*), AVG(frequency) FROM topics GROUP BY category',
          'SELECT name, sentiment FROM topics WHERE sentiment = \'negative\' ORDER BY frequency DESC'
        ]
      },
      {
        name: 'insights',
        description: 'AI-generated call insights and action items',
        columns: [
          { name: 'id', type: 'STRING', description: 'Insight ID', nullable: false, examples: ['insight_1', 'insight_2'] },
          { name: 'type', type: 'STRING', description: 'Insight type', nullable: false, examples: ['objection', 'pain_point', 'competitor', 'budget', 'timeline', 'decision_maker'] },
          { name: 'content', type: 'TEXT', description: 'Insight content', nullable: false, examples: ['Price is higher than expected budget', 'Currently evaluating CompetitorX'] },
          { name: 'call_id', type: 'STRING', description: 'Associated call ID', nullable: false, examples: ['call_1', 'call_2'] },
          { name: 'timestamp', type: 'NUMBER', description: 'Timestamp in call (seconds)', nullable: false, examples: ['1200', '1800', '2400'] },
          { name: 'confidence', type: 'NUMBER', description: 'Insight confidence score', nullable: false, examples: ['0.89', '0.95', '0.82'] },
          { name: 'impact', type: 'STRING', description: 'Insight impact level', nullable: false, examples: ['high', 'medium', 'low'] },
          { name: 'action_items', type: 'ARRAY', description: 'Recommended action items', nullable: true, examples: ['[Prepare ROI calculator, Schedule demo with CFO]'] }
        ],
        sampleQueries: [
          'SELECT type, content, confidence FROM insights WHERE impact = \'high\' ORDER BY confidence DESC',
          'SELECT type, COUNT(*) FROM insights GROUP BY type',
          'SELECT call_id, COUNT(*) FROM insights GROUP BY call_id ORDER BY COUNT(*) DESC'
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
          { name: 'event_name', type: 'STRING', description: 'Event name', nullable: false, examples: ['page_view', 'signup', 'purchase', 'feature_used'] },
          { name: 'user_id', type: 'STRING', description: 'User identifier', nullable: true, examples: ['user_123', 'user_456'] },
          { name: 'timestamp', type: 'TIMESTAMP', description: 'Event timestamp', nullable: false, examples: ['2024-01-15T10:30:00Z'] },
          { name: 'properties', type: 'JSON', description: 'Event properties', nullable: true, examples: ['{"page": "/dashboard", "source": "google"}'] }
        ],
        sampleQueries: [
          'SELECT event_name, COUNT(*) FROM events WHERE timestamp >= NOW() - INTERVAL \'7 days\' GROUP BY event_name',
          'SELECT user_id, COUNT(*) FROM events GROUP BY user_id ORDER BY COUNT(*) DESC LIMIT 10',
          'SELECT DATE_TRUNC(\'day\', timestamp) as day, COUNT(*) FROM events GROUP BY day ORDER BY day'
        ]
      },
      {
        name: 'funnels',
        description: 'Conversion funnel analysis',
        columns: [
          { name: 'funnel_name', type: 'STRING', description: 'Funnel name', nullable: false, examples: ['signup_funnel', 'purchase_funnel'] },
          { name: 'step', type: 'STRING', description: 'Funnel step', nullable: false, examples: ['landing_page', 'signup_form', 'email_verification'] },
          { name: 'user_count', type: 'NUMBER', description: 'Users at this step', nullable: false, examples: ['1000', '800', '600'] },
          { name: 'conversion_rate', type: 'NUMBER', description: 'Conversion rate to next step', nullable: true, examples: ['0.8', '0.75', '0.6'] }
        ],
        sampleQueries: [
          'SELECT step, user_count, conversion_rate FROM funnels WHERE funnel_name = \'signup_funnel\'',
          'SELECT funnel_name, AVG(conversion_rate) FROM funnels GROUP BY funnel_name',
          'SELECT step, user_count FROM funnels ORDER BY user_count DESC'
        ]
      },
      {
        name: 'cohorts',
        description: 'User cohort analysis',
        columns: [
          { name: 'cohort_name', type: 'STRING', description: 'Cohort name', nullable: false, examples: ['jan_2024_signups', 'q1_2024_customers'] },
          { name: 'period', type: 'STRING', description: 'Time period', nullable: false, examples: ['week_1', 'week_2', 'month_1'] },
          { name: 'user_count', type: 'NUMBER', description: 'Users in cohort', nullable: false, examples: ['100', '95', '88'] },
          { name: 'retention_rate', type: 'NUMBER', description: 'Retention rate', nullable: false, examples: ['1.0', '0.95', '0.88'] }
        ],
        sampleQueries: [
          'SELECT period, user_count, retention_rate FROM cohorts WHERE cohort_name = \'jan_2024_signups\'',
          'SELECT cohort_name, AVG(retention_rate) FROM cohorts GROUP BY cohort_name',
          'SELECT period, AVG(retention_rate) FROM cohorts GROUP BY period ORDER BY period'
        ]
      }
    ]
  },

  crayon: {
    name: 'Crayon Competitive Intelligence',
    description: 'Competitive intelligence, battlecards, and market insights',
    tables: [
      {
        name: 'battlecards',
        description: 'Competitive battlecards and positioning',
        columns: [
          { name: 'id', type: 'STRING', description: 'Battlecard ID', nullable: false, examples: ['battlecard_1', 'battlecard_2'] },
          { name: 'competitor', type: 'STRING', description: 'Competitor name', nullable: false, examples: ['CompetitorX', 'CompetitorY'] },
          { name: 'strengths', type: 'ARRAY', description: 'Competitor strengths', nullable: true, examples: ['[Strong brand, Enterprise focus]'] },
          { name: 'weaknesses', type: 'ARRAY', description: 'Competitor weaknesses', nullable: true, examples: ['[High pricing, Complex setup]'] },
          { name: 'positioning', type: 'TEXT', description: 'Competitive positioning', nullable: true, examples: ['Focus on ease of use and competitive pricing'] },
          { name: 'objections', type: 'ARRAY', description: 'Common objections', nullable: true, examples: ['[Pricing concerns, Feature gaps]'] },
          { name: 'responses', type: 'ARRAY', description: 'Objection responses', nullable: true, examples: ['[Emphasize ROI, Highlight support]'] },
          { name: 'last_updated', type: 'TIMESTAMP', description: 'Last update date', nullable: false, examples: ['2024-01-15T00:00:00Z'] }
        ],
        sampleQueries: [
          'SELECT competitor, positioning FROM battlecards WHERE competitor = \'CompetitorX\'',
          'SELECT competitor, COUNT(*) FROM battlecards GROUP BY competitor',
          'SELECT competitor, last_updated FROM battlecards ORDER BY last_updated DESC'
        ]
      },
      {
        name: 'win_loss_stories',
        description: 'Deal win/loss analysis and insights',
        columns: [
          { name: 'id', type: 'STRING', description: 'Story ID', nullable: false, examples: ['story_1', 'story_2'] },
          { name: 'competitor', type: 'STRING', description: 'Competitor involved', nullable: false, examples: ['CompetitorX', 'CompetitorY'] },
          { name: 'outcome', type: 'STRING', description: 'Deal outcome', nullable: false, examples: ['won', 'lost'] },
          { name: 'deal_value', type: 'NUMBER', description: 'Deal value', nullable: true, examples: ['50000', '75000'] },
          { name: 'key_factors', type: 'ARRAY', description: 'Key success/failure factors', nullable: true, examples: ['[Better pricing, Superior support]'] },
          { name: 'lessons', type: 'ARRAY', description: 'Lessons learned', nullable: true, examples: ['[Price competitively, Emphasize support quality]'] },
          { name: 'date', type: 'DATE', description: 'Deal date', nullable: false, examples: ['2024-01-15', '2024-01-10'] }
        ],
        sampleQueries: [
          'SELECT competitor, outcome, deal_value FROM win_loss_stories WHERE outcome = \'won\' ORDER BY deal_value DESC',
          'SELECT outcome, COUNT(*), AVG(deal_value) FROM win_loss_stories GROUP BY outcome',
          'SELECT competitor, COUNT(*) FROM win_loss_stories GROUP BY competitor'
        ]
      },
      {
        name: 'competitor_profiles',
        description: 'Competitor company profiles and information',
        columns: [
          { name: 'name', type: 'STRING', description: 'Competitor name', nullable: false, examples: ['CompetitorX', 'CompetitorY'] },
          { name: 'description', type: 'TEXT', description: 'Company description', nullable: true, examples: ['Leading provider of enterprise software'] },
          { name: 'products', type: 'ARRAY', description: 'Product offerings', nullable: true, examples: ['[Product A, Product B, Product C]'] },
          { name: 'pricing_model', type: 'STRING', description: 'Pricing model', nullable: true, examples: ['Subscription-based', 'Per-seat', 'Enterprise'] },
          { name: 'pricing_range', type: 'STRING', description: 'Pricing range', nullable: true, examples: ['$10,000 - $100,000 annually'] },
          { name: 'recent_news', type: 'ARRAY', description: 'Recent company news', nullable: true, examples: ['[Raised $50M, Launched new features]'] },
          { name: 'market_position', type: 'STRING', description: 'Market position', nullable: true, examples: ['Market leader', 'Challenger', 'Niche player'] }
        ],
        sampleQueries: [
          'SELECT name, description, market_position FROM competitor_profiles',
          'SELECT pricing_model, COUNT(*) FROM competitor_profiles GROUP BY pricing_model',
          'SELECT name, recent_news FROM competitor_profiles WHERE recent_news IS NOT NULL'
        ]
      },
      {
        name: 'market_alerts',
        description: 'Real-time competitive alerts and notifications',
        columns: [
          { name: 'id', type: 'STRING', description: 'Alert ID', nullable: false, examples: ['alert_1', 'alert_2'] },
          { name: 'type', type: 'STRING', description: 'Alert type', nullable: false, examples: ['product_launch', 'pricing_change', 'funding', 'partnership'] },
          { name: 'competitor', type: 'STRING', description: 'Competitor name', nullable: false, examples: ['CompetitorX', 'CompetitorY'] },
          { name: 'title', type: 'STRING', description: 'Alert title', nullable: false, examples: ['New AI features launched', 'Series C funding announced'] },
          { name: 'description', type: 'TEXT', description: 'Alert description', nullable: true, examples: ['CompetitorX has launched new AI capabilities'] },
          { name: 'impact', type: 'STRING', description: 'Impact level', nullable: false, examples: ['high', 'medium', 'low'] },
          { name: 'date', type: 'DATE', description: 'Alert date', nullable: false, examples: ['2024-01-20', '2024-01-18'] }
        ],
        sampleQueries: [
          'SELECT competitor, title, impact FROM market_alerts WHERE impact = \'high\' ORDER BY date DESC',
          'SELECT type, COUNT(*) FROM market_alerts GROUP BY type',
          'SELECT competitor, COUNT(*) FROM market_alerts GROUP BY competitor ORDER BY COUNT(*) DESC'
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
        description: 'Contacts with additional data points and enrichment',
        columns: [
          { name: 'id', type: 'STRING', description: 'Enriched contact ID', nullable: false, examples: ['enriched_1', 'enriched_2'] },
          { name: 'original_contact_id', type: 'STRING', description: 'Original contact ID', nullable: false, examples: ['contact_1', 'contact_2'] },
          { name: 'email', type: 'STRING', description: 'Contact email', nullable: false, examples: ['john@acme.com', 'sarah@beta.com'] },
          { name: 'first_name', type: 'STRING', description: 'First name', nullable: true, examples: ['John', 'Sarah'] },
          { name: 'last_name', type: 'STRING', description: 'Last name', nullable: true, examples: ['Smith', 'Johnson'] },
          { name: 'company', type: 'STRING', description: 'Company name', nullable: false, examples: ['Acme Corp', 'Beta Inc'] },
          { name: 'title', type: 'STRING', description: 'Job title', nullable: true, examples: ['VP of Engineering', 'CTO'] },
          { name: 'linkedin_url', type: 'STRING', description: 'LinkedIn profile URL', nullable: true, examples: ['https://linkedin.com/in/johnsmith'] },
          { name: 'phone', type: 'STRING', description: 'Phone number', nullable: true, examples: ['+1-555-0123', '+1-555-0456'] },
          { name: 'location', type: 'STRING', description: 'Location', nullable: true, examples: ['San Francisco, CA', 'Boston, MA'] },
          { name: 'enrichment_score', type: 'NUMBER', description: 'Data enrichment quality score', nullable: false, examples: ['0.95', '0.87', '0.92'] },
          { name: 'last_enriched', type: 'TIMESTAMP', description: 'Last enrichment date', nullable: false, examples: ['2024-01-15T00:00:00Z'] }
        ],
        sampleQueries: [
          'SELECT first_name, last_name, company, title FROM enriched_contacts WHERE enrichment_score > 0.9',
          'SELECT company, COUNT(*) FROM enriched_contacts GROUP BY company ORDER BY COUNT(*) DESC',
          'SELECT title, COUNT(*) FROM enriched_contacts WHERE title IS NOT NULL GROUP BY title'
        ]
      },
      {
        name: 'company_insights',
        description: 'Company intelligence and insights',
        columns: [
          { name: 'name', type: 'STRING', description: 'Company name', nullable: false, examples: ['Acme Corp', 'Beta Inc'] },
          { name: 'domain', type: 'STRING', description: 'Company domain', nullable: false, examples: ['acme.com', 'beta.com'] },
          { name: 'industry', type: 'STRING', description: 'Company industry', nullable: true, examples: ['Technology', 'Healthcare', 'Finance'] },
          { name: 'employee_count', type: 'NUMBER', description: 'Number of employees', nullable: true, examples: ['350', '120', '50'] },
          { name: 'annual_revenue', type: 'NUMBER', description: 'Annual revenue', nullable: true, examples: ['10000000', '5000000', '1000000'] },
          { name: 'funding_stage', type: 'STRING', description: 'Funding stage', nullable: true, examples: ['Series B', 'Series A', 'Seed'] },
          { name: 'funding_amount', type: 'NUMBER', description: 'Total funding amount', nullable: true, examples: ['50000000', '15000000', '3000000'] },
          { name: 'last_funding_date', type: 'DATE', description: 'Last funding date', nullable: true, examples: ['2023-06-15', '2023-03-01'] },
          { name: 'headquarters', type: 'STRING', description: 'Company headquarters', nullable: true, examples: ['San Francisco, CA', 'Boston, MA'] },
          { name: 'technologies', type: 'ARRAY', description: 'Technologies used', nullable: true, examples: ['[React, Node.js, AWS]', '[Python, Django, PostgreSQL]'] },
          { name: 'competitors', type: 'ARRAY', description: 'Known competitors', nullable: true, examples: ['[CompetitorX, CompetitorY]', '[CompetitorA, CompetitorB]'] }
        ],
        sampleQueries: [
          'SELECT name, industry, employee_count, funding_stage FROM company_insights WHERE funding_stage = \'Series B\'',
          'SELECT industry, COUNT(*), AVG(employee_count) FROM company_insights GROUP BY industry',
          'SELECT name, annual_revenue FROM company_insights WHERE annual_revenue > 1000000 ORDER BY annual_revenue DESC'
        ]
      },
      {
        name: 'prospects',
        description: 'Generated prospects and lead candidates',
        columns: [
          { name: 'id', type: 'STRING', description: 'Prospect ID', nullable: false, examples: ['prospect_1', 'prospect_2'] },
          { name: 'email', type: 'STRING', description: 'Prospect email', nullable: false, examples: ['jane@techstartup.com', 'mike@healthtech.com'] },
          { name: 'first_name', type: 'STRING', description: 'First name', nullable: false, examples: ['Jane', 'Mike'] },
          { name: 'last_name', type: 'STRING', description: 'Last name', nullable: false, examples: ['Doe', 'Johnson'] },
          { name: 'title', type: 'STRING', description: 'Job title', nullable: false, examples: ['CTO', 'VP of Product'] },
          { name: 'company', type: 'STRING', description: 'Company name', nullable: false, examples: ['TechStartup Inc', 'HealthTech Solutions'] },
          { name: 'company_domain', type: 'STRING', description: 'Company domain', nullable: false, examples: ['techstartup.com', 'healthtech.com'] },
          { name: 'industry', type: 'STRING', description: 'Company industry', nullable: false, examples: ['Technology', 'Healthcare'] },
          { name: 'employee_count', type: 'NUMBER', description: 'Company size', nullable: false, examples: ['50', '120'] },
          { name: 'location', type: 'STRING', description: 'Location', nullable: false, examples: ['Austin, TX', 'Boston, MA'] },
          { name: 'score', type: 'NUMBER', description: 'Prospect match score', nullable: false, examples: ['0.88', '0.82', '0.95'] },
          { name: 'match_reason', type: 'TEXT', description: 'Why this prospect matches', nullable: false, examples: ['High growth tech company, recent Series A funding'] },
          { name: 'source', type: 'STRING', description: 'Lead source', nullable: false, examples: ['clay_search', 'linkedin_scrape', 'company_search'] }
        ],
        sampleQueries: [
          'SELECT first_name, last_name, company, title, score FROM prospects WHERE score > 0.8 ORDER BY score DESC',
          'SELECT industry, COUNT(*), AVG(score) FROM prospects GROUP BY industry',
          'SELECT company, employee_count, score FROM prospects WHERE employee_count BETWEEN 50 AND 200 ORDER BY score DESC'
        ]
      },
      {
        name: 'verification_results',
        description: 'Data verification and quality results',
        columns: [
          { name: 'contact_id', type: 'STRING', description: 'Contact ID', nullable: false, examples: ['contact_1', 'contact_2'] },
          { name: 'email', type: 'STRING', description: 'Email address', nullable: false, examples: ['john@acme.com', 'sarah@beta.com'] },
          { name: 'verification_status', type: 'STRING', description: 'Email verification status', nullable: false, examples: ['valid', 'invalid', 'risky', 'unknown'] },
          { name: 'deliverability', type: 'STRING', description: 'Email deliverability', nullable: false, examples: ['high', 'medium', 'low', 'unknown'] },
          { name: 'bounce_risk', type: 'STRING', description: 'Bounce risk level', nullable: false, examples: ['low', 'medium', 'high'] },
          { name: 'suggestions', type: 'ARRAY', description: 'Verification suggestions', nullable: true, examples: ['[Email is valid and deliverable]', '[Email may be outdated]'] },
          { name: 'updated_data', type: 'JSON', description: 'Updated contact data', nullable: true, examples: ['{"phone": "+1-555-0123", "location": "San Francisco, CA"}'] }
        ],
        sampleQueries: [
          'SELECT email, verification_status, deliverability FROM verification_results WHERE verification_status = \'valid\'',
          'SELECT verification_status, COUNT(*) FROM verification_results GROUP BY verification_status',
          'SELECT email, bounce_risk FROM verification_results WHERE bounce_risk = \'high\''
        ]
      }
    ]
  },

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
    "dataSource": "intercom|hubspot|gong|mixpanel|crayon|clay|snowflake",
    "explanation": "Brief explanation of what this query does and what insights it provides",
    "confidence": 0.95
  }
}

Guidelines:
- Use standard SQL syntax appropriate for the data source
- Only SELECT queries (no INSERT, UPDATE, DELETE, DROP, ALTER)
- Use exact table and column names from the schema above
- For Intercom: Use conversation, contact, company, and ticket tables
- For HubSpot: Use contact, deal, company, and activity tables
- For Gong: Use call, transcript, topic, and insight tables
- For Mixpanel: Use event-based queries with JSON properties
- For Crayon: Use battlecard, win_loss_story, competitor_profile, and market_alert tables
- For Clay: Use enriched_contact, company_insight, prospect, and verification_result tables
- For Snowflake: Use DATE_TRUNC, SUM, COUNT, GROUP BY for aggregations
- If the question is unclear or ambiguous, set success: false and provide an error message
- Set confidence between 0.0 and 1.0 based on how certain you are about the query

Examples:
- "Show me top customers by revenue" → SELECT customer_name, revenue FROM customers ORDER BY revenue DESC LIMIT 10
- "What deals are closing this month?" → SELECT dealname, amount, closedate FROM deals WHERE closedate >= NOW() - INTERVAL '30 days'
- "Show me recent customer conversations" → SELECT topic, contact_id, created_at FROM conversations WHERE created_at >= NOW() - INTERVAL '7 days'
- "What are our competitors doing?" → SELECT competitor, title, impact FROM market_alerts WHERE impact = 'high' ORDER BY date DESC
- "Show me top sales call topics" → SELECT name, frequency, sentiment FROM topics ORDER BY frequency DESC
- "What features are users engaging with most?" → SELECT event_name, COUNT(*) FROM events WHERE timestamp >= NOW() - INTERVAL '7 days' GROUP BY event_name
- "Find high-quality prospects" → SELECT first_name, last_name, company, title, score FROM prospects WHERE score > 0.8 ORDER BY score DESC`
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
