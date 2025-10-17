// Test script for Snowflake MCP integration
const { createSnowflakeMCPClient } = require('./lib/integrations/snowflake-mcp.ts')

async function testSnowflakeMCP() {

  try {
    // Create MCP client
    const client = createSnowflakeMCPClient()

    // Test connection status

    const status = await client.getConnectionStatus())

    // Test database listing

    const databases = await client.listDatabases()

    // Test schema listing
    if (databases.length > 0) {

      const schemas = await client.listSchemas(databases[0])

      // Test table listing
      if (schemas.length > 0) {

        const tables = await client.listTables(databases[0], schemas[0])

        // Test table schema
        if (tables.length > 0) {

          const schema = await client.getTableSchema(databases[0], schemas[0], tables[0]))
        }
      }
    }

    // Test query execution

    const queryResult = await client.executeQuery('SELECT COUNT(*) as total FROM customers'))

  } catch (error) {

  }
}

// Run the test
testSnowflakeMCP()
