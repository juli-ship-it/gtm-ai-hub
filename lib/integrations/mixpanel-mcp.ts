// Mixpanel MCP (Model Context Protocol) integration
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'

export interface MixpanelMCPClient {
  trackEvent: (event: string, properties?: Record<string, any>, distinctId?: string) => Promise<MixpanelResponse>
  getInsights: (query: string, options?: InsightOptions) => Promise<MixpanelInsightResult>
  getFunnels: (funnelId: string, options?: FunnelOptions) => Promise<MixpanelFunnelResult>
  getRetention: (retentionId: string, options?: RetentionOptions) => Promise<MixpanelRetentionResult>
  getCohorts: (options?: CohortOptions) => Promise<MixpanelCohortResult>
  getConnectionStatus: () => Promise<ConnectionStatus>
}

export interface InsightOptions {
  fromDate?: string
  toDate?: string
  interval?: 'day' | 'week' | 'month'
  unit?: 'day' | 'week' | 'month'
  limit?: number
  offset?: number
}

export interface FunnelOptions {
  fromDate?: string
  toDate?: string
  interval?: 'day' | 'week' | 'month'
  unit?: 'day' | 'week' | 'month'
}

export interface RetentionOptions {
  fromDate?: string
  toDate?: string
  interval?: 'day' | 'week' | 'month'
  unit?: 'day' | 'week' | 'month'
}

export interface CohortOptions {
  limit?: number
  offset?: number
}

export interface MixpanelResponse {
  success: boolean
  message?: string
  data?: any
}

export interface MixpanelInsightResult {
  success: boolean
  data?: {
    series: any[]
    labels: string[]
    values: number[]
  }
  error?: string
}

export interface MixpanelFunnelResult {
  success: boolean
  data?: {
    steps: any[]
    conversion_rates: number[]
  }
  error?: string
}

export interface MixpanelRetentionResult {
  success: boolean
  data?: {
    cohorts: any[]
    retention_rates: number[]
  }
  error?: string
}

export interface MixpanelCohortResult {
  success: boolean
  data?: {
    cohorts: any[]
    total_count: number
  }
  error?: string
}

export interface ConnectionStatus {
  connected: boolean
  error?: string
  lastChecked?: Date
}

// Mock implementation for development
class MockMixpanelMCPClient implements MixpanelMCPClient {
  async trackEvent(event: string, properties?: Record<string, any>, distinctId?: string): Promise<MixpanelResponse> {
    console.log(`[Mock Mixpanel] Tracking event: ${event}`, { properties, distinctId })
    return {
      success: true,
      message: 'Event tracked successfully (mock)',
      data: { event, properties, distinctId }
    }
  }

  async getInsights(query: string, options?: InsightOptions): Promise<MixpanelInsightResult> {
    console.log(`[Mock Mixpanel] Getting insights: ${query}`, options)
    return {
      success: true,
      data: {
        series: [
          { name: 'Page Views', data: [100, 120, 150, 180, 200] },
          { name: 'Unique Users', data: [80, 95, 110, 130, 145] }
        ],
        labels: ['2024-01-01', '2024-01-02', '2024-01-03', '2024-01-04', '2024-01-05'],
        values: [100, 120, 150, 180, 200]
      }
    }
  }

  async getFunnels(funnelId: string, options?: FunnelOptions): Promise<MixpanelFunnelResult> {
    console.log(`[Mock Mixpanel] Getting funnel: ${funnelId}`, options)
    return {
      success: true,
      data: {
        steps: [
          { name: 'Sign Up', count: 1000 },
          { name: 'Email Verification', count: 800 },
          { name: 'Profile Setup', count: 600 },
          { name: 'First Purchase', count: 300 }
        ],
        conversion_rates: [100, 80, 75, 50]
      }
    }
  }

  async getRetention(retentionId: string, options?: RetentionOptions): Promise<MixpanelRetentionResult> {
    console.log(`[Mock Mixpanel] Getting retention: ${retentionId}`, options)
    return {
      success: true,
      data: {
        cohorts: [
          { cohort: '2024-01-01', size: 1000, retention: [100, 60, 40, 30, 25] },
          { cohort: '2024-01-08', size: 1200, retention: [100, 65, 45, 35, 30] }
        ],
        retention_rates: [100, 62.5, 42.5, 32.5, 27.5]
      }
    }
  }

  async getCohorts(options?: CohortOptions): Promise<MixpanelCohortResult> {
    console.log(`[Mock Mixpanel] Getting cohorts`, options)
    return {
      success: true,
      data: {
        cohorts: [
          { id: 'cohort_1', name: 'New Users', size: 1000, created: '2024-01-01' },
          { id: 'cohort_2', name: 'Power Users', size: 500, created: '2024-01-15' }
        ],
        total_count: 2
      }
    }
  }

  async getConnectionStatus(): Promise<ConnectionStatus> {
    return {
      connected: true,
      lastChecked: new Date()
    }
  }
}

// Real implementation using MCP
class RealMixpanelMCPClient implements MixpanelMCPClient {
  private client: Client
  private connected: boolean = false

  constructor(mcpServerPath: string, mcpServerArgs: string[] = []) {
    this.client = new Client(
      {
        name: 'mixpanel-mcp-client',
        version: '1.0.0'
      },
      {
        capabilities: {
          tools: {}
        }
      }
    )

    this.initializeConnection(mcpServerPath, mcpServerArgs)
  }

  private async initializeConnection(mcpServerPath: string, mcpServerArgs: string[]) {
    try {
      const transport = new StdioClientTransport({
        command: mcpServerPath,
        args: mcpServerArgs
      })

      await this.client.connect(transport)
      this.connected = true
    } catch (error) {
      console.error('Failed to connect to Mixpanel MCP server:', error)
      this.connected = false
    }
  }

  async trackEvent(event: string, properties?: Record<string, any>, distinctId?: string): Promise<MixpanelResponse> {
    if (!this.connected) {
      throw new Error('Mixpanel MCP client not connected')
    }

    try {
      const result = await this.client.callTool({
        name: 'track_event',
        arguments: {
          event,
          properties: properties || {},
          distinct_id: distinctId
        }
      })

      return {
        success: true,
        data: result.content
      }
    } catch (error) {
      return {
        success: false,
        message: `Failed to track event: ${error}`
      }
    }
  }

  async getInsights(query: string, options?: InsightOptions): Promise<MixpanelInsightResult> {
    if (!this.connected) {
      throw new Error('Mixpanel MCP client not connected')
    }

    try {
      const result = await this.client.callTool({
        name: 'get_insights',
        arguments: {
          query,
          ...options
        }
      })

      return {
        success: true,
        data: result.content
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to get insights: ${error}`
      }
    }
  }

  async getFunnels(funnelId: string, options?: FunnelOptions): Promise<MixpanelFunnelResult> {
    if (!this.connected) {
      throw new Error('Mixpanel MCP client not connected')
    }

    try {
      const result = await this.client.callTool({
        name: 'get_funnels',
        arguments: {
          funnel_id: funnelId,
          ...options
        }
      })

      return {
        success: true,
        data: result.content
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to get funnels: ${error}`
      }
    }
  }

  async getRetention(retentionId: string, options?: RetentionOptions): Promise<MixpanelRetentionResult> {
    if (!this.connected) {
      throw new Error('Mixpanel MCP client not connected')
    }

    try {
      const result = await this.client.callTool({
        name: 'get_retention',
        arguments: {
          retention_id: retentionId,
          ...options
        }
      })

      return {
        success: true,
        data: result.content
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to get retention: ${error}`
      }
    }
  }

  async getCohorts(options?: CohortOptions): Promise<MixpanelCohortResult> {
    if (!this.connected) {
      throw new Error('Mixpanel MCP client not connected')
    }

    try {
      const result = await this.client.callTool({
        name: 'get_cohorts',
        arguments: options || {}
      })

      return {
        success: true,
        data: result.content
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to get cohorts: ${error}`
      }
    }
  }

  async getConnectionStatus(): Promise<ConnectionStatus> {
    return {
      connected: this.connected,
      lastChecked: new Date()
    }
  }
}

export function createMixpanelMCPClient(): MixpanelMCPClient {
  const isDevelopment = process.env.NODE_ENV === 'development'
  const mcpServerPath = process.env.MIXPANEL_MCP_SERVER_PATH
  const mcpServerArgs = process.env.MIXPANEL_MCP_SERVER_ARGS?.split(' ') || []

  if (isDevelopment || !mcpServerPath) {
    return new MockMixpanelMCPClient()
  }

  return new RealMixpanelMCPClient(mcpServerPath, mcpServerArgs)
}

// Security utilities for MCP
export class MixpanelMCPSecurity {
  static validateEventName(event: string): boolean {
    // Basic validation for event names
    return /^[a-zA-Z0-9_\-\.]+$/.test(event) && event.length <= 255
  }

  static validateProperties(properties: Record<string, any>): boolean {
    // Basic validation for event properties
    if (typeof properties !== 'object' || properties === null) {
      return false
    }

    for (const [key, value] of Object.entries(properties)) {
      if (typeof key !== 'string' || key.length > 255) {
        return false
      }
      
      if (typeof value === 'object' && value !== null) {
        return false // No nested objects allowed
      }
    }

    return true
  }

  static sanitizeEventName(event: string): string {
    return event.replace(/[^a-zA-Z0-9_\-\.]/g, '_').substring(0, 255)
  }

  static sanitizeProperties(properties: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {}
    
    for (const [key, value] of Object.entries(properties)) {
      const sanitizedKey = key.replace(/[^a-zA-Z0-9_\-\.]/g, '_').substring(0, 255)
      
      if (typeof value === 'object' && value !== null) {
        continue // Skip nested objects
      }
      
      sanitized[sanitizedKey] = value
    }
    
    return sanitized
  }
}
