#!/usr/bin/env node

/**
 * Simple test script for Snowflake MCP integration
 * This script tests the Snowflake MCP client functionality in development mode
 */

// Set environment variables for development
process.env.NODE_ENV = 'development'
process.env.SNOWFLAKE_MCP_ENABLED = 'true'

async function testSnowflakeMCP() {

  try {
    // Dynamic import for ES modules
    const { createSnowflakeMCPClient } = await import('./lib/integrations/snowflake-mcp.ts')

    // Create MCP client

    const client = createSnowflakeMCPClient()

    // Test connection status

    const status = await client.getConnectionStatus()

    // Test database listing

    const databases = await client.listDatabases()

    if (databases.length > 0) {
      const testDb = databases[0]

      // Test schema listing

      const schemas = await client.listSchemas(testDb)

      if (schemas.length > 0) {
        const testSchema = schemas[0]

        // Test table listing

        const tables = await client.listTables(testDb, testSchema)

      }
    }

    // Test query execution

    const testQueries = [
      'SELECT COUNT(*) as total_count',
      'SHOW TABLES',
      'SELECT 1 as test_value, CURRENT_TIMESTAMP as current_time'
    ]

    for (const query of testQueries) {

      try {
        const result = await client.executeQuery(query)

        if (result.data.length > 0) {)
        }

      } catch (error) {

      }
    }

    // Test table schema
    if (databases.length > 0) {

      try {
        const schemas = await client.listSchemas(databases[0])
        if (schemas.length > 0) {
          const tables = await client.listTables(databases[0], schemas[0])
          if (tables.length > 0) {
            const schema = await client.getTableSchema(databases[0], schemas[0], tables[0])

          }
        }
      } catch (error) {

      }
    }

  } catch (error) {

    process.exit(1)
  }
}

// Run the test
testSnowflakeMCP().catch(console.error)
