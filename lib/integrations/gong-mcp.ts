import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'
import { spawn } from 'child_process'

export interface GongMCPConfig {
  apiKey: string
  readOnly?: boolean
  maxResults?: number
  timeout?: number
  auditLogging?: boolean
}

export interface GongQueryOptions {
  timeRange?: string
  include?: string[]
  limit?: number
  offset?: number
  userId?: string
  callId?: string
  topic?: string
  outcome?: string
}

export interface GongCall {
  id: string
  title: string
  started: string
  finished: string
  duration: number
  participants: GongParticipant[]
  outcome: 'connected' | 'no_answer' | 'voicemail' | 'busy' | 'failed'
  score: number
  topics: string[]
  insights: string[]
  metadata: {
    direction: 'inbound' | 'outbound'
    callType: 'sales' | 'support' | 'demo' | 'other'
    recordingUrl?: string
  }
}

export interface GongParticipant {
  id: string
  name: string
  email: string
  role: 'host' | 'guest' | 'prospect' | 'customer'
  talkTime: number
  talkPercentage: number
}

export interface GongTranscript {
  id: string
  callId: string
  content: string
  segments: GongTranscriptSegment[]
  summary: string
  keyPoints: string[]
  sentiment: 'positive' | 'neutral' | 'negative'
  confidence: number
}

export interface GongTranscriptSegment {
  id: string
  speaker: string
  text: string
  startTime: number
  endTime: number
  sentiment: 'positive' | 'neutral' | 'negative'
  topics: string[]
}

export interface GongTopic {
  id: string
  name: string
  category: string
  frequency: number
  sentiment: 'positive' | 'neutral' | 'negative'
  examples: string[]
  trends: {
    period: string
    count: number
    change: number
  }[]
}

export interface GongInsight {
  id: string
  type: 'objection' | 'pain_point' | 'competitor' | 'budget' | 'timeline' | 'decision_maker'
  content: string
  callId: string
  timestamp: number
  confidence: number
  impact: 'high' | 'medium' | 'low'
  actionItems: string[]
}

export class GongMCPClient {
  private client: Client
  private config: GongMCPConfig
  private isConnected: boolean = false

  constructor(config: GongMCPConfig) {
    this.config = {
      readOnly: true,
      maxResults: 100,
      timeout: 300,
      auditLogging: false,
      ...config
    }
  }

  async connect(): Promise<void> {
    if (this.isConnected) return

    // In development mode or when using mock data, skip actual MCP connection
    if (process.env.NODE_ENV === 'development' || !this.config.apiKey || this.config.apiKey === 'mock_api_key') {
      this.isConnected = true
      if (this.config.auditLogging) {
        console.log('Gong MCP client connected in mock mode')
      }
      return
    }

    try {
      // Spawn the Gong MCP server process
      const serverProcess = spawn('npx', [
        '-y',
        '@gong/mcp-server',
        '--api-key',
        this.config.apiKey
      ], {
        stdio: ['pipe', 'pipe', 'pipe']
      })

      // Create transport and client
      const transport = new StdioClientTransport({
        reader: serverProcess.stdout!,
        writer: serverProcess.stdin!
      })

      this.client = new Client({
        name: 'gong-mcp-client',
        version: '1.0.0'
      }, {
        capabilities: {}
      })

      await this.client.connect(transport)
      this.isConnected = true

      if (this.config.auditLogging) {
        console.log('Gong MCP client connected successfully')
      }
    } catch (error) {
      console.error('Failed to connect to Gong MCP server:', error)
      throw error
    }
  }

  async disconnect(): Promise<void> {
    if (this.client && this.isConnected) {
      await this.client.close()
      this.isConnected = false
    }
  }

  private async executeTool(toolName: string, args: any): Promise<any> {
    if (!this.isConnected) {
      await this.connect()
    }

    // In development mode or mock mode, return mock data
    if (process.env.NODE_ENV === 'development' || !this.config.apiKey || this.config.apiKey === 'mock_api_key') {
      if (this.config.auditLogging) {
        console.log(`Gong MCP tool executed (mock): ${toolName}`, { args })
      }
      return [{ text: 'mock_data' }] // Return mock format
    }

    try {
      const result = await this.client.callTool({
        name: toolName,
        arguments: args
      })

      if (this.config.auditLogging) {
        console.log(`Gong MCP tool executed: ${toolName}`, { args, result })
      }

      return result.content
    } catch (error) {
      console.error(`Gong MCP tool execution failed: ${toolName}`, error)
      throw error
    }
  }

  // Call Methods

  async getCalls(options: GongQueryOptions = {}): Promise<GongCall[]> {
    const args = {
      timeRange: options.timeRange || 'last_30_days',
      userId: options.userId,
      outcome: options.outcome,
      limit: this.config.maxResults,
      offset: options.offset || 0
    }

    const result = await this.executeTool('get_calls', args)
    
    // In mock mode, always return mock data
    if (process.env.NODE_ENV === 'development' || !this.config.apiKey || this.config.apiKey === 'mock_api_key') {
      return this.getMockCalls()
    }
    
    return result[0]?.text ? JSON.parse(result[0].text) : this.getMockCalls()
  }

  async getCallById(callId: string): Promise<GongCall | null> {
    const args = { callId }
    const result = await this.executeTool('get_call', args)
    
    if (process.env.NODE_ENV === 'development' || !this.config.apiKey || this.config.apiKey === 'mock_api_key') {
      return this.getMockCall(callId)
    }
    
    return result[0]?.text ? JSON.parse(result[0].text) : this.getMockCall(callId)
  }

  // Transcript Methods

  async getTranscripts(options: GongQueryOptions = {}): Promise<GongTranscript[]> {
    const args = {
      timeRange: options.timeRange || 'last_30_days',
      callId: options.callId,
      limit: this.config.maxResults,
      offset: options.offset || 0
    }

    const result = await this.executeTool('get_transcripts', args)
    
    if (process.env.NODE_ENV === 'development' || !this.config.apiKey || this.config.apiKey === 'mock_api_key') {
      return this.getMockTranscripts()
    }
    
    return result[0]?.text ? JSON.parse(result[0].text) : this.getMockTranscripts()
  }

  async getTranscriptByCallId(callId: string): Promise<GongTranscript | null> {
    const args = { callId }
    const result = await this.executeTool('get_transcript', args)
    
    if (process.env.NODE_ENV === 'development' || !this.config.apiKey || this.config.apiKey === 'mock_api_key') {
      return this.getMockTranscript(callId)
    }
    
    return result[0]?.text ? JSON.parse(result[0].text) : this.getMockTranscript(callId)
  }

  // Topic Methods

  async getTopics(options: GongQueryOptions = {}): Promise<GongTopic[]> {
    const args = {
      timeRange: options.timeRange || 'last_30_days',
      topic: options.topic,
      limit: this.config.maxResults,
      offset: options.offset || 0
    }

    const result = await this.executeTool('get_topics', args)
    
    if (process.env.NODE_ENV === 'development' || !this.config.apiKey || this.config.apiKey === 'mock_api_key') {
      return this.getMockTopics()
    }
    
    return result[0]?.text ? JSON.parse(result[0].text) : this.getMockTopics()
  }

  // Insight Methods

  async getInsights(options: GongQueryOptions = {}): Promise<GongInsight[]> {
    const args = {
      timeRange: options.timeRange || 'last_30_days',
      callId: options.callId,
      limit: this.config.maxResults,
      offset: options.offset || 0
    }

    const result = await this.executeTool('get_insights', args)
    
    if (process.env.NODE_ENV === 'development' || !this.config.apiKey || this.config.apiKey === 'mock_api_key') {
      return this.getMockInsights()
    }
    
    return result[0]?.text ? JSON.parse(result[0].text) : this.getMockInsights()
  }

  // Mock Data Methods (for development)

  private getMockCalls(): GongCall[] {
    return [
      {
        id: 'call_1',
        title: 'Discovery Call - Acme Corp',
        started: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        finished: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
        duration: 1800, // 30 minutes
        participants: [
          {
            id: 'user_1',
            name: 'John Smith',
            email: 'john@acme.com',
            role: 'prospect',
            talkTime: 900,
            talkPercentage: 50
          },
          {
            id: 'user_2',
            name: 'Sarah Johnson',
            email: 'sarah@ourcompany.com',
            role: 'host',
            talkTime: 900,
            talkPercentage: 50
          }
        ],
        outcome: 'connected',
        score: 8.5,
        topics: ['pricing', 'features', 'integration', 'timeline'],
        insights: ['Budget concerns raised', 'Decision maker identified', 'Competitor mentioned'],
        metadata: {
          direction: 'outbound',
          callType: 'sales',
          recordingUrl: 'https://gong.io/recordings/call_1'
        }
      },
      {
        id: 'call_2',
        title: 'Follow-up Call - Beta Inc',
        started: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        finished: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000).toISOString(),
        duration: 2700, // 45 minutes
        participants: [
          {
            id: 'user_3',
            name: 'Mike Wilson',
            email: 'mike@beta.com',
            role: 'prospect',
            talkTime: 1350,
            talkPercentage: 50
          },
          {
            id: 'user_2',
            name: 'Sarah Johnson',
            email: 'sarah@ourcompany.com',
            role: 'host',
            talkTime: 1350,
            talkPercentage: 50
          }
        ],
        outcome: 'connected',
        score: 7.2,
        topics: ['objections', 'competitors', 'pricing', 'demo'],
        insights: ['Price sensitivity high', 'Competitor evaluation in progress', 'Technical requirements discussed'],
        metadata: {
          direction: 'outbound',
          callType: 'sales',
          recordingUrl: 'https://gong.io/recordings/call_2'
        }
      }
    ]
  }

  private getMockCall(callId: string): GongCall | null {
    const calls = this.getMockCalls()
    return calls.find(c => c.id === callId) || null
  }

  private getMockTranscripts(): GongTranscript[] {
    return [
      {
        id: 'transcript_1',
        callId: 'call_1',
        content: 'Full transcript content here...',
        segments: [
          {
            id: 'seg_1',
            speaker: 'John Smith',
            text: 'We\'re looking for a solution that can integrate with our existing systems.',
            startTime: 0,
            endTime: 5,
            sentiment: 'neutral',
            topics: ['integration']
          },
          {
            id: 'seg_2',
            speaker: 'Sarah Johnson',
            text: 'Our platform has robust API capabilities and pre-built integrations.',
            startTime: 5,
            endTime: 10,
            sentiment: 'positive',
            topics: ['features', 'integration']
          }
        ],
        summary: 'Discovery call focused on integration requirements and pricing concerns.',
        keyPoints: [
          'Integration with existing systems is critical',
          'Budget approval needed from CFO',
          'Timeline: Q2 implementation',
          'Competitor evaluation in progress'
        ],
        sentiment: 'neutral',
        confidence: 0.92
      }
    ]
  }

  private getMockTranscript(callId: string): GongTranscript | null {
    const transcripts = this.getMockTranscripts()
    return transcripts.find(t => t.callId === callId) || null
  }

  private getMockTopics(): GongTopic[] {
    return [
      {
        id: 'topic_1',
        name: 'Pricing',
        category: 'Commercial',
        frequency: 45,
        sentiment: 'neutral',
        examples: [
          'What are your pricing options?',
          'How does your pricing compare to competitors?',
          'Is there room for negotiation on price?'
        ],
        trends: [
          { period: 'last_week', count: 12, change: 20 },
          { period: 'last_month', count: 45, change: 15 }
        ]
      },
      {
        id: 'topic_2',
        name: 'Integration',
        category: 'Technical',
        frequency: 32,
        sentiment: 'positive',
        examples: [
          'How does this integrate with our CRM?',
          'What APIs do you provide?',
          'Can we connect to our existing systems?'
        ],
        trends: [
          { period: 'last_week', count: 8, change: 33 },
          { period: 'last_month', count: 32, change: 28 }
        ]
      }
    ]
  }

  private getMockInsights(): GongInsight[] {
    return [
      {
        id: 'insight_1',
        type: 'objection',
        content: 'Price is higher than expected budget',
        callId: 'call_1',
        timestamp: 1200,
        confidence: 0.89,
        impact: 'high',
        actionItems: [
          'Prepare ROI calculator',
          'Schedule demo with CFO',
          'Provide competitive comparison'
        ]
      },
      {
        id: 'insight_2',
        type: 'competitor',
        content: 'Currently evaluating CompetitorX',
        callId: 'call_2',
        timestamp: 1800,
        confidence: 0.95,
        impact: 'medium',
        actionItems: [
          'Research CompetitorX positioning',
          'Prepare competitive differentiation',
          'Schedule technical comparison call'
        ]
      }
    ]
  }
}

// Factory function to create Gong MCP client
export function createGongMCPClient(config?: Partial<GongMCPConfig>): GongMCPClient {
  const defaultConfig: GongMCPConfig = {
    apiKey: process.env.GONG_API_KEY || '',
    readOnly: process.env.GONG_MCP_READ_ONLY === 'true',
    maxResults: parseInt(process.env.GONG_MCP_MAX_RESULTS || '100'),
    timeout: parseInt(process.env.GONG_MCP_TIMEOUT || '300'),
    auditLogging: process.env.GONG_MCP_AUDIT_LOGGING === 'true'
  }

  const finalConfig = { ...defaultConfig, ...config }
  return new GongMCPClient(finalConfig)
}

// Export types for use in other modules
export type {
  GongMCPConfig,
  GongQueryOptions,
  GongCall,
  GongParticipant,
  GongTranscript,
  GongTranscriptSegment,
  GongTopic,
  GongInsight
}
