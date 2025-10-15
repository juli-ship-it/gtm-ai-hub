import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'
import { spawn } from 'child_process'

export interface IntercomMCPConfig {
  accessToken: string
  readOnly?: boolean
  maxResults?: number
  timeout?: number
  auditLogging?: boolean
}

export interface IntercomQueryOptions {
  timeRange?: string
  include?: string[]
  limit?: number
  offset?: number
  status?: string
  contactId?: string
  companyId?: string
}

export interface IntercomConversation {
  id: string
  topic: string
  created_at: string
  updated_at: string
  contact_id: string
  status: 'open' | 'closed' | 'pending'
  message_count: number
  last_message_at: string
  assignee_id?: string
  tags: string[]
}

export interface IntercomContact {
  id: string
  name: string
  email: string
  phone?: string
  company_id?: string
  created_at: string
  updated_at: string
  last_seen_at?: string
  tags: string[]
  custom_attributes: Record<string, any>
}

export interface IntercomCompany {
  id: string
  name: string
  website?: string
  industry?: string
  size?: string
  created_at: string
  updated_at: string
  plan?: string
  monthly_spend?: number
  tags: string[]
  custom_attributes: Record<string, any>
}

export interface IntercomTicket {
  id: string
  title: string
  description: string
  status: 'new' | 'open' | 'pending' | 'solved' | 'closed'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  created_at: string
  updated_at: string
  contact_id: string
  assignee_id?: string
  tags: string[]
}

export class IntercomMCPClient {
  private client: Client
  private config: IntercomMCPConfig
  private isConnected: boolean = false

  constructor(config: IntercomMCPConfig) {
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
    if (process.env.NODE_ENV === 'development' || !this.config.accessToken || this.config.accessToken === 'mock_token') {
      this.isConnected = true
      if (this.config.auditLogging) {
      }
      return
    }

    try {
      // Spawn the Intercom MCP server process
      const serverProcess = spawn('npx', [
        '-y',
        '@intercom/mcp-server',
        '--access-token',
        this.config.accessToken
      ], {
        stdio: ['pipe', 'pipe', 'pipe']
      })

      // Create transport and client
      const transport = new StdioClientTransport({
        reader: serverProcess.stdout!,
        writer: serverProcess.stdin!
      })

      this.client = new Client({
        name: 'intercom-mcp-client',
        version: '1.0.0'
      }, {
        capabilities: {}
      })

      await this.client.connect(transport)
      this.isConnected = true

      if (this.config.auditLogging) {
      }
    } catch (error) {
      console.error('Failed to connect to Intercom MCP server:', error)
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
    if (process.env.NODE_ENV === 'development' || !this.config.accessToken || this.config.accessToken === 'mock_token') {
      if (this.config.auditLogging) {
      }
      return [{ text: 'mock_data' }] // Return mock format
    }

    try {
      const result = await this.client.callTool({
        name: toolName,
        arguments: args
      })

      if (this.config.auditLogging) {
        console.log(`Intercom MCP tool executed: ${toolName}`, { args, result })
      }

      return result.content
    } catch (error) {
      console.error(`Intercom MCP tool execution failed: ${toolName}`, error)
      throw error
    }
  }

  // Conversation Methods

  async getConversations(options: IntercomQueryOptions = {}): Promise<IntercomConversation[]> {
    const args = {
      timeRange: options.timeRange || 'last_30_days',
      status: options.status,
      limit: this.config.maxResults,
      offset: options.offset || 0
    }

    const result = await this.executeTool('get_conversations', args)
    
    // In mock mode, always return mock data
    if (process.env.NODE_ENV === 'development' || !this.config.accessToken || this.config.accessToken === 'mock_token') {
      return this.getMockConversations()
    }
    
    return result[0]?.text ? JSON.parse(result[0].text) : this.getMockConversations()
  }

  async getConversationById(conversationId: string): Promise<IntercomConversation | null> {
    const args = { conversationId }
    const result = await this.executeTool('get_conversation', args)
    
    if (process.env.NODE_ENV === 'development' || !this.config.accessToken || this.config.accessToken === 'mock_token') {
      return this.getMockConversation(conversationId)
    }
    
    return result[0]?.text ? JSON.parse(result[0].text) : this.getMockConversation(conversationId)
  }

  // Contact Methods

  async getContacts(options: IntercomQueryOptions = {}): Promise<IntercomContact[]> {
    const args = {
      timeRange: options.timeRange || 'last_30_days',
      companyId: options.companyId,
      limit: this.config.maxResults,
      offset: options.offset || 0
    }

    const result = await this.executeTool('get_contacts', args)
    
    if (process.env.NODE_ENV === 'development' || !this.config.accessToken || this.config.accessToken === 'mock_token') {
      return this.getMockContacts()
    }
    
    return result[0]?.text ? JSON.parse(result[0].text) : this.getMockContacts()
  }

  async getContactById(contactId: string): Promise<IntercomContact | null> {
    const args = { contactId }
    const result = await this.executeTool('get_contact', args)
    
    if (process.env.NODE_ENV === 'development' || !this.config.accessToken || this.config.accessToken === 'mock_token') {
      return this.getMockContact(contactId)
    }
    
    return result[0]?.text ? JSON.parse(result[0].text) : this.getMockContact(contactId)
  }

  // Company Methods

  async getCompanies(options: IntercomQueryOptions = {}): Promise<IntercomCompany[]> {
    const args = {
      timeRange: options.timeRange || 'last_30_days',
      limit: this.config.maxResults,
      offset: options.offset || 0
    }

    const result = await this.executeTool('get_companies', args)
    
    if (process.env.NODE_ENV === 'development' || !this.config.accessToken || this.config.accessToken === 'mock_token') {
      return this.getMockCompanies()
    }
    
    return result[0]?.text ? JSON.parse(result[0].text) : this.getMockCompanies()
  }

  async getCompanyById(companyId: string): Promise<IntercomCompany | null> {
    const args = { companyId }
    const result = await this.executeTool('get_company', args)
    
    if (process.env.NODE_ENV === 'development' || !this.config.accessToken || this.config.accessToken === 'mock_token') {
      return this.getMockCompany(companyId)
    }
    
    return result[0]?.text ? JSON.parse(result[0].text) : this.getMockCompany(companyId)
  }

  // Ticket Methods

  async getTickets(options: IntercomQueryOptions = {}): Promise<IntercomTicket[]> {
    const args = {
      timeRange: options.timeRange || 'last_30_days',
      status: options.status,
      limit: this.config.maxResults,
      offset: options.offset || 0
    }

    const result = await this.executeTool('get_tickets', args)
    
    if (process.env.NODE_ENV === 'development' || !this.config.accessToken || this.config.accessToken === 'mock_token') {
      return this.getMockTickets()
    }
    
    return result[0]?.text ? JSON.parse(result[0].text) : this.getMockTickets()
  }

  async getTicketById(ticketId: string): Promise<IntercomTicket | null> {
    const args = { ticketId }
    const result = await this.executeTool('get_ticket', args)
    
    if (process.env.NODE_ENV === 'development' || !this.config.accessToken || this.config.accessToken === 'mock_token') {
      return this.getMockTicket(ticketId)
    }
    
    return result[0]?.text ? JSON.parse(result[0].text) : this.getMockTicket(ticketId)
  }

  // Mock Data Methods (for development)

  private getMockConversations(): IntercomConversation[] {
    return [
      {
        id: 'conv_1',
        topic: 'Pricing inquiry',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        contact_id: 'contact_1',
        status: 'open',
        message_count: 5,
        last_message_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        assignee_id: 'user_1',
        tags: ['pricing', 'enterprise']
      },
      {
        id: 'conv_2',
        topic: 'Technical support',
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        contact_id: 'contact_2',
        status: 'closed',
        message_count: 8,
        last_message_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        assignee_id: 'user_2',
        tags: ['technical', 'bug']
      }
    ]
  }

  private getMockConversation(conversationId: string): IntercomConversation | null {
    const conversations = this.getMockConversations()
    return conversations.find(c => c.id === conversationId) || null
  }

  private getMockContacts(): IntercomContact[] {
    return [
      {
        id: 'contact_1',
        name: 'John Smith',
        email: 'john@acme.com',
        phone: '+1-555-0123',
        company_id: 'company_1',
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        last_seen_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ['vip', 'enterprise'],
        custom_attributes: {
          plan: 'enterprise',
          monthly_spend: 5000
        }
      },
      {
        id: 'contact_2',
        name: 'Sarah Johnson',
        email: 'sarah@beta.com',
        company_id: 'company_2',
        created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        last_seen_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ['technical', 'support'],
        custom_attributes: {
          plan: 'professional',
          monthly_spend: 2000
        }
      }
    ]
  }

  private getMockContact(contactId: string): IntercomContact | null {
    const contacts = this.getMockContacts()
    return contacts.find(c => c.id === contactId) || null
  }

  private getMockCompanies(): IntercomCompany[] {
    return [
      {
        id: 'company_1',
        name: 'Acme Corp',
        website: 'https://acme.com',
        industry: 'Technology',
        size: '201-500',
        created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        plan: 'enterprise',
        monthly_spend: 5000,
        tags: ['enterprise', 'vip'],
        custom_attributes: {
          annual_revenue: 10000000,
          employee_count: 350
        }
      },
      {
        id: 'company_2',
        name: 'Beta Inc',
        website: 'https://beta.com',
        industry: 'Healthcare',
        size: '51-200',
        created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        plan: 'professional',
        monthly_spend: 2000,
        tags: ['healthcare', 'growing'],
        custom_attributes: {
          annual_revenue: 5000000,
          employee_count: 120
        }
      }
    ]
  }

  private getMockCompany(companyId: string): IntercomCompany | null {
    const companies = this.getMockCompanies()
    return companies.find(c => c.id === companyId) || null
  }

  private getMockTickets(): IntercomTicket[] {
    return [
      {
        id: 'ticket_1',
        title: 'Login issues with SSO',
        description: 'Users are unable to login using SSO integration',
        status: 'open',
        priority: 'high',
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        contact_id: 'contact_1',
        assignee_id: 'user_1',
        tags: ['sso', 'login', 'urgent']
      },
      {
        id: 'ticket_2',
        title: 'Feature request: Export functionality',
        description: 'Need ability to export data in CSV format',
        status: 'pending',
        priority: 'normal',
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        contact_id: 'contact_2',
        assignee_id: 'user_2',
        tags: ['feature-request', 'export']
      }
    ]
  }

  private getMockTicket(ticketId: string): IntercomTicket | null {
    const tickets = this.getMockTickets()
    return tickets.find(t => t.id === ticketId) || null
  }
}

// Factory function to create Intercom MCP client
export function createIntercomMCPClient(config?: Partial<IntercomMCPConfig>): IntercomMCPClient {
  const defaultConfig: IntercomMCPConfig = {
    accessToken: process.env.INTERCOM_ACCESS_TOKEN || '',
    readOnly: process.env.INTERCOM_MCP_READ_ONLY === 'true',
    maxResults: parseInt(process.env.INTERCOM_MCP_MAX_RESULTS || '100'),
    timeout: parseInt(process.env.INTERCOM_MCP_TIMEOUT || '300'),
    auditLogging: process.env.INTERCOM_MCP_AUDIT_LOGGING === 'true'
  }

  const finalConfig = { ...defaultConfig, ...config }
  return new IntercomMCPClient(finalConfig)
}

// Export types for use in other modules
export type {
  IntercomMCPConfig,
  IntercomQueryOptions,
  IntercomConversation,
  IntercomContact,
  IntercomCompany,
  IntercomTicket
}
