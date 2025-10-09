// Mixpanel MCP Server Configuration
// This file contains the server-side MCP implementation for Mixpanel

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js'

export interface MixpanelMCPServerConfig {
  projectId: string
  serviceAccountSecret: string
  apiSecret?: string
  readOnly?: boolean
  maxResults?: number
  timeout?: number
}

export class MixpanelMCPServer {
  private server: Server
  private config: MixpanelMCPServerConfig
  private mixpanelApi: any // Mixpanel API client

  constructor(config: MixpanelMCPServerConfig) {
    this.config = {
      readOnly: true,
      maxResults: 1000,
      timeout: 300,
      ...config
    }

    this.server = new Server(
      {
        name: 'mixpanel-mcp-server',
        version: '1.0.0'
      },
      {
        capabilities: {
          tools: {}
        }
      }
    )

    this.setupHandlers()
  }

  private setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'track_event',
            description: 'Track an event in Mixpanel',
            inputSchema: {
              type: 'object',
              properties: {
                event: {
                  type: 'string',
                  description: 'Event name to track'
                },
                properties: {
                  type: 'object',
                  description: 'Event properties',
                  additionalProperties: true
                },
                distinct_id: {
                  type: 'string',
                  description: 'User distinct ID'
                }
              },
              required: ['event']
            }
          },
          {
            name: 'get_insights',
            description: 'Get insights data from Mixpanel',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'Natural language query for insights'
                },
                from_date: {
                  type: 'string',
                  description: 'Start date (YYYY-MM-DD)'
                },
                to_date: {
                  type: 'string',
                  description: 'End date (YYYY-MM-DD)'
                },
                interval: {
                  type: 'string',
                  enum: ['day', 'week', 'month'],
                  description: 'Data aggregation interval'
                },
                unit: {
                  type: 'string',
                  enum: ['day', 'week', 'month'],
                  description: 'Time unit for analysis'
                },
                limit: {
                  type: 'number',
                  description: 'Maximum number of results'
                },
                offset: {
                  type: 'number',
                  description: 'Number of results to skip'
                }
              },
              required: ['query']
            }
          },
          {
            name: 'get_funnels',
            description: 'Get funnel analysis data from Mixpanel',
            inputSchema: {
              type: 'object',
              properties: {
                funnel_id: {
                  type: 'string',
                  description: 'Funnel ID to analyze'
                },
                from_date: {
                  type: 'string',
                  description: 'Start date (YYYY-MM-DD)'
                },
                to_date: {
                  type: 'string',
                  description: 'End date (YYYY-MM-DD)'
                },
                interval: {
                  type: 'string',
                  enum: ['day', 'week', 'month'],
                  description: 'Data aggregation interval'
                },
                unit: {
                  type: 'string',
                  enum: ['day', 'week', 'month'],
                  description: 'Time unit for analysis'
                }
              },
              required: ['funnel_id']
            }
          },
          {
            name: 'get_retention',
            description: 'Get retention analysis data from Mixpanel',
            inputSchema: {
              type: 'object',
              properties: {
                retention_id: {
                  type: 'string',
                  description: 'Retention analysis ID'
                },
                from_date: {
                  type: 'string',
                  description: 'Start date (YYYY-MM-DD)'
                },
                to_date: {
                  type: 'string',
                  description: 'End date (YYYY-MM-DD)'
                },
                interval: {
                  type: 'string',
                  enum: ['day', 'week', 'month'],
                  description: 'Data aggregation interval'
                },
                unit: {
                  type: 'string',
                  enum: ['day', 'week', 'month'],
                  description: 'Time unit for analysis'
                }
              },
              required: ['retention_id']
            }
          },
          {
            name: 'get_cohorts',
            description: 'Get cohort analysis data from Mixpanel',
            inputSchema: {
              type: 'object',
              properties: {
                limit: {
                  type: 'number',
                  description: 'Maximum number of cohorts to return'
                },
                offset: {
                  type: 'number',
                  description: 'Number of cohorts to skip'
                }
              }
            }
          },
          {
            name: 'get_events',
            description: 'Get event data from Mixpanel',
            inputSchema: {
              type: 'object',
              properties: {
                event_name: {
                  type: 'string',
                  description: 'Name of the event to query'
                },
                from_date: {
                  type: 'string',
                  description: 'Start date (YYYY-MM-DD)'
                },
                to_date: {
                  type: 'string',
                  description: 'End date (YYYY-MM-DD)'
                },
                limit: {
                  type: 'number',
                  description: 'Maximum number of events to return'
                }
              },
              required: ['event_name']
            }
          },
          {
            name: 'get_users',
            description: 'Get user data from Mixpanel',
            inputSchema: {
              type: 'object',
              properties: {
                distinct_id: {
                  type: 'string',
                  description: 'User distinct ID'
                },
                from_date: {
                  type: 'string',
                  description: 'Start date (YYYY-MM-DD)'
                },
                to_date: {
                  type: 'string',
                  description: 'End date (YYYY-MM-DD)'
                },
                limit: {
                  type: 'number',
                  description: 'Maximum number of users to return'
                }
              }
            }
          }
        ]
      }
    })

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params

      try {
        switch (name) {
          case 'track_event':
            return await this.handleTrackEvent(args)
          case 'get_insights':
            return await this.handleGetInsights(args)
          case 'get_funnels':
            return await this.handleGetFunnels(args)
          case 'get_retention':
            return await this.handleGetRetention(args)
          case 'get_cohorts':
            return await this.handleGetCohorts(args)
          case 'get_events':
            return await this.handleGetEvents(args)
          case 'get_users':
            return await this.handleGetUsers(args)
          default:
            throw new Error(`Unknown tool: ${name}`)
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error executing ${name}: ${error}`
            }
          ]
        }
      }
    })
  }

  private async handleTrackEvent(args: any) {
    if (this.config.readOnly) {
      throw new Error('Server is in read-only mode')
    }

    const { event, properties = {}, distinct_id } = args

    // Validate event name
    if (!event || typeof event !== 'string') {
      throw new Error('Event name is required and must be a string')
    }

    // Track event using Mixpanel API
    const result = await this.trackEventInMixpanel(event, properties, distinct_id)

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            message: 'Event tracked successfully',
            data: result
          })
        }
      ]
    }
  }

  private async handleGetInsights(args: any) {
    const { query, from_date, to_date, interval, unit, limit, offset } = args

    // Validate query
    if (!query || typeof query !== 'string') {
      throw new Error('Query is required and must be a string')
    }

    // Get insights from Mixpanel
    const result = await this.getInsightsFromMixpanel({
      query,
      from_date,
      to_date,
      interval,
      unit,
      limit: limit || this.config.maxResults,
      offset: offset || 0
    })

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            data: result
          })
        }
      ]
    }
  }

  private async handleGetFunnels(args: any) {
    const { funnel_id, from_date, to_date, interval, unit } = args

    // Validate funnel ID
    if (!funnel_id || typeof funnel_id !== 'string') {
      throw new Error('Funnel ID is required and must be a string')
    }

    // Get funnel data from Mixpanel
    const result = await this.getFunnelsFromMixpanel({
      funnel_id,
      from_date,
      to_date,
      interval,
      unit
    })

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            data: result
          })
        }
      ]
    }
  }

  private async handleGetRetention(args: any) {
    const { retention_id, from_date, to_date, interval, unit } = args

    // Validate retention ID
    if (!retention_id || typeof retention_id !== 'string') {
      throw new Error('Retention ID is required and must be a string')
    }

    // Get retention data from Mixpanel
    const result = await this.getRetentionFromMixpanel({
      retention_id,
      from_date,
      to_date,
      interval,
      unit
    })

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            data: result
          })
        }
      ]
    }
  }

  private async handleGetCohorts(args: any) {
    const { limit, offset } = args

    // Get cohorts from Mixpanel
    const result = await this.getCohortsFromMixpanel({
      limit: limit || this.config.maxResults,
      offset: offset || 0
    })

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            data: result
          })
        }
      ]
    }
  }

  private async handleGetEvents(args: any) {
    const { event_name, from_date, to_date, limit } = args

    // Validate event name
    if (!event_name || typeof event_name !== 'string') {
      throw new Error('Event name is required and must be a string')
    }

    // Get events from Mixpanel
    const result = await this.getEventsFromMixpanel({
      event_name,
      from_date,
      to_date,
      limit: limit || this.config.maxResults
    })

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            data: result
          })
        }
      ]
    }
  }

  private async handleGetUsers(args: any) {
    const { distinct_id, from_date, to_date, limit } = args

    // Get users from Mixpanel
    const result = await this.getUsersFromMixpanel({
      distinct_id,
      from_date,
      to_date,
      limit: limit || this.config.maxResults
    })

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            data: result
          })
        }
      ]
    }
  }

  // Mixpanel API integration methods
  private async trackEventInMixpanel(event: string, properties: Record<string, any>, distinctId?: string) {
    // Implementation for tracking events in Mixpanel
    // This would use the Mixpanel API to track events
    console.log(`Tracking event: ${event}`, { properties, distinctId })
    
    // Mock implementation - replace with actual Mixpanel API call
    return {
      event,
      properties,
      distinct_id: distinctId,
      timestamp: new Date().toISOString()
    }
  }

  private async getInsightsFromMixpanel(options: any) {
    // Implementation for getting insights from Mixpanel
    console.log('Getting insights from Mixpanel:', options)
    
    // Mock implementation - replace with actual Mixpanel API call
    return {
      series: [
        { name: 'Page Views', data: [100, 120, 150, 180, 200] },
        { name: 'Unique Users', data: [80, 95, 110, 130, 145] }
      ],
      labels: ['2024-01-01', '2024-01-02', '2024-01-03', '2024-01-04', '2024-01-05'],
      values: [100, 120, 150, 180, 200]
    }
  }

  private async getFunnelsFromMixpanel(options: any) {
    // Implementation for getting funnel data from Mixpanel
    console.log('Getting funnels from Mixpanel:', options)
    
    // Mock implementation - replace with actual Mixpanel API call
    return {
      steps: [
        { name: 'Sign Up', count: 1000 },
        { name: 'Email Verification', count: 800 },
        { name: 'Profile Setup', count: 600 },
        { name: 'First Purchase', count: 300 }
      ],
      conversion_rates: [100, 80, 75, 50]
    }
  }

  private async getRetentionFromMixpanel(options: any) {
    // Implementation for getting retention data from Mixpanel
    console.log('Getting retention from Mixpanel:', options)
    
    // Mock implementation - replace with actual Mixpanel API call
    return {
      cohorts: [
        { cohort: '2024-01-01', size: 1000, retention: [100, 60, 40, 30, 25] },
        { cohort: '2024-01-08', size: 1200, retention: [100, 65, 45, 35, 30] }
      ],
      retention_rates: [100, 62.5, 42.5, 32.5, 27.5]
    }
  }

  private async getCohortsFromMixpanel(options: any) {
    // Implementation for getting cohorts from Mixpanel
    console.log('Getting cohorts from Mixpanel:', options)
    
    // Mock implementation - replace with actual Mixpanel API call
    return {
      cohorts: [
        { id: 'cohort_1', name: 'New Users', size: 1000, created: '2024-01-01' },
        { id: 'cohort_2', name: 'Power Users', size: 500, created: '2024-01-15' }
      ],
      total_count: 2
    }
  }

  private async getEventsFromMixpanel(options: any) {
    // Implementation for getting events from Mixpanel
    console.log('Getting events from Mixpanel:', options)
    
    // Mock implementation - replace with actual Mixpanel API call
    return {
      events: [
        { event: 'page_view', count: 1000, timestamp: '2024-01-01T00:00:00Z' },
        { event: 'button_click', count: 500, timestamp: '2024-01-01T00:00:00Z' }
      ],
      total_count: 2
    }
  }

  private async getUsersFromMixpanel(options: any) {
    // Implementation for getting users from Mixpanel
    console.log('Getting users from Mixpanel:', options)
    
    // Mock implementation - replace with actual Mixpanel API call
    return {
      users: [
        { distinct_id: 'user_1', properties: { email: 'user1@example.com' } },
        { distinct_id: 'user_2', properties: { email: 'user2@example.com' } }
      ],
      total_count: 2
    }
  }

  async start() {
    const transport = new StdioServerTransport()
    await this.server.connect(transport)
    console.log('Mixpanel MCP server started')
  }
}

// Main function to start the server
async function main() {
  const config: MixpanelMCPServerConfig = {
    projectId: process.env.MIXPANEL_PROJECT_ID || '',
    serviceAccountSecret: process.env.MIXPANEL_SERVICE_ACCOUNT_SECRET || '',
    apiSecret: process.env.MIXPANEL_API_SECRET,
    readOnly: process.env.MIXPANEL_MCP_READ_ONLY === 'true',
    maxResults: parseInt(process.env.MIXPANEL_MCP_MAX_RESULTS || '1000'),
    timeout: parseInt(process.env.MIXPANEL_MCP_TIMEOUT || '300')
  }

  if (!config.projectId || !config.serviceAccountSecret) {
    console.error('Missing required Mixpanel configuration')
    process.exit(1)
  }

  const server = new MixpanelMCPServer(config)
  await server.start()
}

// Start the server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error)
}
