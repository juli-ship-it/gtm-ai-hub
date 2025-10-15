// Snowflake MCP (Model Context Protocol) integration
// Note: MCP SDK imports are only used in server-side code
// Client-side components use mock implementations

export interface SnowflakeMCPClient {
  executeQuery: (query: string, options?: QueryOptions) => Promise<SnowflakeQueryResult>
  getTableSchema: (database: string, schema: string, table: string) => Promise<TableSchema>
  listDatabases: () => Promise<string[]>
  listSchemas: (database: string) => Promise<string[]>
  listTables: (database: string, schema: string) => Promise<string[]>
  getConnectionStatus: () => Promise<ConnectionStatus>
}

export interface QueryOptions {
  timeout?: number
  maxRows?: number
  warehouse?: string
  role?: string
}

export interface SnowflakeQueryResult {
  data: any[]
  columns: string[]
  rowCount: number
  executionTime: number
  queryId: string
  warehouse?: string
  role?: string
}

export interface TableSchema {
  database: string
  schema: string
  table: string
  columns: ColumnInfo[]
  rowCount?: number
  size?: string
}

export interface ColumnInfo {
  name: string
  type: string
  nullable: boolean
  comment?: string
}

export interface ConnectionStatus {
  connected: boolean
  account: string
  user: string
  role: string
  warehouse: string
  database: string
  lastConnected?: Date
}

class MockSnowflakeMCPClient implements SnowflakeMCPClient {
  private isDevelopment = process.env.NODE_ENV === 'development'

  async executeQuery(query: string, options?: QueryOptions): Promise<SnowflakeQueryResult> {
    if (!this.isDevelopment) {
      throw new Error('Snowflake MCP integration not configured. Set NODE_ENV=development for mock mode.')
    }

    // Simulate query execution time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))

    // Mock data based on query type
    if (query.toLowerCase().includes('select count(*)')) {
      return {
        data: [{ COUNT: Math.floor(Math.random() * 10000) }],
        columns: ['COUNT'],
        rowCount: 1,
        executionTime: 1.2,
        queryId: `mock-${Date.now()}`,
        warehouse: options?.warehouse || 'COMPUTE_WH',
        role: options?.role || 'PUBLIC'
      }
    }

    if (query.toLowerCase().includes('show tables')) {
      return {
        data: [
          { name: 'CUSTOMERS', kind: 'TABLE', comment: 'Customer data' },
          { name: 'ORDERS', kind: 'TABLE', comment: 'Order information' },
          { name: 'PRODUCTS', kind: 'TABLE', comment: 'Product catalog' }
        ],
        columns: ['name', 'kind', 'comment'],
        rowCount: 3,
        executionTime: 0.8,
        queryId: `mock-${Date.now()}`
      }
    }

    // Default mock response
    return {
      data: [
        { id: 1, name: 'Sample Data', value: 42.5, created_at: '2024-01-15T10:30:00Z' },
        { id: 2, name: 'Another Row', value: 78.2, created_at: '2024-01-16T14:20:00Z' }
      ],
      columns: ['id', 'name', 'value', 'created_at'],
      rowCount: 2,
      executionTime: 1.5,
      queryId: `mock-${Date.now()}`
    }
  }

  async getTableSchema(database: string, schema: string, table: string): Promise<TableSchema> {
    if (!this.isDevelopment) {
      throw new Error('Snowflake MCP integration not configured.')
    }

    await new Promise(resolve => setTimeout(resolve, 500))

    return {
      database,
      schema,
      table,
      columns: [
        { name: 'id', type: 'NUMBER', nullable: false, comment: 'Primary key' },
        { name: 'name', type: 'VARCHAR', nullable: false, comment: 'Record name' },
        { name: 'value', type: 'FLOAT', nullable: true, comment: 'Numeric value' },
        { name: 'created_at', type: 'TIMESTAMP', nullable: false, comment: 'Creation timestamp' }
      ],
      rowCount: Math.floor(Math.random() * 1000),
      size: `${Math.floor(Math.random() * 100)}MB`
    }
  }

  async listDatabases(): Promise<string[]> {
    if (!this.isDevelopment) {
      throw new Error('Snowflake MCP integration not configured.')
    }

    await new Promise(resolve => setTimeout(resolve, 300))
    return ['PROD_DB', 'STAGING_DB', 'DEV_DB', 'ANALYTICS_DB']
  }

  async listSchemas(database: string): Promise<string[]> {
    if (!this.isDevelopment) {
      throw new Error('Snowflake MCP integration not configured.')
    }

    await new Promise(resolve => setTimeout(resolve, 200))
    return ['PUBLIC', 'ANALYTICS', 'STAGING', 'RAW']
  }

  async listTables(database: string, schema: string): Promise<string[]> {
    if (!this.isDevelopment) {
      throw new Error('Snowflake MCP integration not configured.')
    }

    await new Promise(resolve => setTimeout(resolve, 400))
    return ['CUSTOMERS', 'ORDERS', 'PRODUCTS', 'INVENTORY', 'SALES']
  }

  async getConnectionStatus(): Promise<ConnectionStatus> {
    if (!this.isDevelopment) {
      throw new Error('Snowflake MCP integration not configured.')
    }

    return {
      connected: true,
      account: 'mock-account.snowflakecomputing.com',
      user: 'MOCK_USER',
      role: 'PUBLIC',
      warehouse: 'COMPUTE_WH',
      database: 'PROD_DB',
      lastConnected: new Date()
    }
  }
}

class RealSnowflakeMCPClient implements SnowflakeMCPClient {
  // Real MCP client implementation would go here
  // For now, we'll use a mock implementation that can be extended
  // when server-side MCP integration is needed

  async executeQuery(query: string, options?: QueryOptions): Promise<SnowflakeQueryResult> {
    // For now, delegate to mock implementation
    // In production, this would make actual MCP calls
    const mockClient = new MockSnowflakeMCPClient()
    return await mockClient.executeQuery(query, options)
  }

  async getTableSchema(database: string, schema: string, table: string): Promise<TableSchema> {
    const mockClient = new MockSnowflakeMCPClient()
    return await mockClient.getTableSchema(database, schema, table)
  }

  async listDatabases(): Promise<string[]> {
    const mockClient = new MockSnowflakeMCPClient()
    return await mockClient.listDatabases()
  }

  async listSchemas(database: string): Promise<string[]> {
    const mockClient = new MockSnowflakeMCPClient()
    return await mockClient.listSchemas(database)
  }

  async listTables(database: string, schema: string): Promise<string[]> {
    const mockClient = new MockSnowflakeMCPClient()
    return await mockClient.listTables(database, schema)
  }

  async getConnectionStatus(): Promise<ConnectionStatus> {
    const mockClient = new MockSnowflakeMCPClient()
    return await mockClient.getConnectionStatus()
  }
}

export function createSnowflakeMCPClient(): SnowflakeMCPClient {
  const isDevelopment = process.env.NODE_ENV === 'development'
  const mcpEnabled = process.env.SNOWFLAKE_MCP_ENABLED === 'true'

  if (isDevelopment || !mcpEnabled) {
    return new MockSnowflakeMCPClient()
  }

  // For production, we'll use Snowflake's managed MCP server
  // This requires OAuth authentication and proper configuration
  return new RealSnowflakeMCPClient()
}

// Security utilities for MCP
export class SnowflakeMCPSecurity {
  static validateQuery(query: string): boolean {
    // Basic SQL injection protection
    const dangerousPatterns = [
      /drop\s+table/i,
      /delete\s+from/i,
      /truncate\s+table/i,
      /alter\s+table/i,
      /create\s+table/i,
      /grant\s+/i,
      /revoke\s+/i
    ]

    return !dangerousPatterns.some(pattern => pattern.test(query))
  }

  static sanitizeQuery(query: string): string {
    // Remove comments and normalize whitespace
    return query
      .replace(/--.*$/gm, '') // Remove SQL comments
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
  }

  static isReadOnlyQuery(query: string): boolean {
    const readOnlyPatterns = [
      /^select\s+/i,
      /^show\s+/i,
      /^describe\s+/i,
      /^explain\s+/i
    ]

    return readOnlyPatterns.some(pattern => pattern.test(query.trim()))
  }
}
