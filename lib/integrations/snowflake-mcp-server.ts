// Snowflake MCP Server Configuration
// This file contains the server-side MCP implementation for Snowflake

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js'

export interface SnowflakeMCPServerConfig {
  account: string
  user: string
  privateKey: string
  warehouse?: string
  database?: string
  role?: string
  readOnly?: boolean
  maxRows?: number
  timeout?: number
}

export class SnowflakeMCPServer {
  private server: Server
  private config: SnowflakeMCPServerConfig
  private connection: any // Snowflake connection object

  constructor(config: SnowflakeMCPServerConfig) {
    this.config = {
      readOnly: true,
      maxRows: 1000,
      timeout: 300,
      ...config
    }

    this.server = new Server(
      {
        name: 'snowflake-mcp-server',
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
            name: 'execute_sql',
            description: 'Execute a SQL query against Snowflake',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'SQL query to execute'
                },
                timeout: {
                  type: 'number',
                  description: 'Query timeout in seconds',
                  default: this.config.timeout
                },
                max_rows: {
                  type: 'number',
                  description: 'Maximum number of rows to return',
                  default: this.config.maxRows
                },
                warehouse: {
                  type: 'string',
                  description: 'Snowflake warehouse to use'
                },
                role: {
                  type: 'string',
                  description: 'Snowflake role to use'
                }
              },
              required: ['query']
            }
          },
          {
            name: 'describe_table',
            description: 'Get schema information for a table',
            inputSchema: {
              type: 'object',
              properties: {
                database: {
                  type: 'string',
                  description: 'Database name'
                },
                schema: {
                  type: 'string',
                  description: 'Schema name'
                },
                table: {
                  type: 'string',
                  description: 'Table name'
                }
              },
              required: ['database', 'schema', 'table']
            }
          },
          {
            name: 'list_databases',
            description: 'List all accessible databases',
            inputSchema: {
              type: 'object',
              properties: {}
            }
          },
          {
            name: 'list_schemas',
            description: 'List schemas in a database',
            inputSchema: {
              type: 'object',
              properties: {
                database: {
                  type: 'string',
                  description: 'Database name'
                }
              },
              required: ['database']
            }
          },
          {
            name: 'list_tables',
            description: 'List tables in a schema',
            inputSchema: {
              type: 'object',
              properties: {
                database: {
                  type: 'string',
                  description: 'Database name'
                },
                schema: {
                  type: 'string',
                  description: 'Schema name'
                }
              },
              required: ['database', 'schema']
            }
          },
          {
            name: 'connection_status',
            description: 'Get current connection status',
            inputSchema: {
              type: 'object',
              properties: {}
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
          case 'execute_sql':
            return await this.handleExecuteSQL(args)
          case 'describe_table':
            return await this.handleDescribeTable(args)
          case 'list_databases':
            return await this.handleListDatabases()
          case 'list_schemas':
            return await this.handleListSchemas(args)
          case 'list_tables':
            return await this.handleListTables(args)
          case 'connection_status':
            return await this.handleConnectionStatus()
          default:
            throw new Error(`Unknown tool: ${name}`)
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                error: error instanceof Error ? error.message : 'Unknown error',
                success: false
              })
            }
          ]
        }
      }
    })
  }

  private async handleExecuteSQL(args: any) {
    const { query, timeout, max_rows, warehouse, role } = args

    // Security validation
    if (!this.validateQuery(query)) {
      throw new Error('Query contains potentially dangerous operations')
    }

    if (this.config.readOnly && !this.isReadOnlyQuery(query)) {
      throw new Error('Server is configured for read-only operations')
    }

    // Execute query (mock implementation)
    const startTime = Date.now()

    // Simulate query execution
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))

    const executionTime = Date.now() - startTime

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            data: [
              { id: 1, name: 'Sample Result', value: 42.5 },
              { id: 2, name: 'Another Result', value: 78.2 }
            ],
            columns: ['id', 'name', 'value'],
            rowCount: 2,
            executionTime: executionTime / 1000,
            queryId: `query-${Date.now()}`,
            warehouse: warehouse || this.config.warehouse,
            role: role || this.config.role,
            success: true
          })
        }
      ]
    }
  }

  private async handleDescribeTable(args: any) {
    const { database, schema, table } = args

    // Mock table schema
    const schema_info = {
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

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(schema_info)
        }
      ]
    }
  }

  private async handleListDatabases() {
    const databases = ['PROD_DB', 'STAGING_DB', 'DEV_DB', 'ANALYTICS_DB']

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(databases)
        }
      ]
    }
  }

  private async handleListSchemas(args: any) {
    const { database } = args
    const schemas = ['PUBLIC', 'ANALYTICS', 'STAGING', 'RAW']

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(schemas)
        }
      ]
    }
  }

  private async handleListTables(args: any) {
    const { database, schema } = args
    const tables = ['CUSTOMERS', 'ORDERS', 'PRODUCTS', 'INVENTORY', 'SALES']

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(tables)
        }
      ]
    }
  }

  private async handleConnectionStatus() {
    const status = {
      connected: true,
      account: this.config.account,
      user: this.config.user,
      role: this.config.role || 'PUBLIC',
      warehouse: this.config.warehouse || 'COMPUTE_WH',
      database: this.config.database || 'PROD_DB',
      lastConnected: new Date().toISOString()
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(status)
        }
      ]
    }
  }

  private validateQuery(query: string): boolean {
    // Security validation for SQL queries
    const dangerousPatterns = [
      /drop\s+table/i,
      /delete\s+from/i,
      /truncate\s+table/i,
      /alter\s+table/i,
      /create\s+table/i,
      /grant\s+/i,
      /revoke\s+/i,
      /insert\s+into/i,
      /update\s+/i
    ]

    return !dangerousPatterns.some(pattern => pattern.test(query))
  }

  private isReadOnlyQuery(query: string): boolean {
    const readOnlyPatterns = [
      /^select\s+/i,
      /^show\s+/i,
      /^describe\s+/i,
      /^explain\s+/i
    ]

    return readOnlyPatterns.some(pattern => pattern.test(query.trim()))
  }

  async start() {
    const transport = new StdioServerTransport()
    await this.server.connect(transport)
  }

  async stop() {
    await this.server.close()
  }
}

// Security utilities
export class SnowflakeMCPSecurity {
  static createSecureConfig(env: Record<string, string>): SnowflakeMCPServerConfig {
    return {
      account: env.SNOWFLAKE_ACCOUNT || '',
      user: env.SNOWFLAKE_USER || '',
      privateKey: env.SNOWFLAKE_PRIVATE_KEY || '',
      warehouse: env.SNOWFLAKE_WAREHOUSE,
      database: env.SNOWFLAKE_DB,
      role: env.SNOWFLAKE_ROLE,
      readOnly: env.SNOWFLAKE_MCP_READ_ONLY === 'true',
      maxRows: parseInt(env.SNOWFLAKE_MCP_MAX_ROWS || '1000'),
      timeout: parseInt(env.SNOWFLAKE_MCP_TIMEOUT || '300')
    }
  }

  static validateConfig(config: SnowflakeMCPServerConfig): boolean {
    return !!(
      config.account &&
      config.user &&
      config.privateKey
    )
  }
}
