import { NextRequest, NextResponse } from 'next/server'
import { createSnowflakeMCPClient } from '@/lib/integrations/snowflake-mcp'

export async function POST(request: NextRequest) {
  try {
    const { action, ...params } = await request.json()
    const client = createSnowflakeMCPClient()

    let result

    switch (action) {
      case 'executeQuery':
        result = await client.executeQuery(params.query, params.options)
        break
      case 'getTableSchema':
        result = await client.getTableSchema(params.database, params.schema, params.table)
        break
      case 'listDatabases':
        result = await client.listDatabases()
        break
      case 'listSchemas':
        result = await client.listSchemas(params.database)
        break
      case 'listTables':
        result = await client.listTables(params.database, params.schema)
        break
      case 'getConnectionStatus':
        result = await client.getConnectionStatus()
        break
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Snowflake MCP API error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
