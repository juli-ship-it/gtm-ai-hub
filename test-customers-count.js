#!/usr/bin/env node

/**
 * Test script to execute SELECT COUNT(*) FROM customers
 */

// Set environment variables for development
process.env.NODE_ENV = 'development'
process.env.SNOWFLAKE_MCP_ENABLED = 'true'

async function testCustomersCount() {FROM customers...\n')

  try {
    // Dynamic import for ES modules
    const { createSnowflakeMCPClient } = await import('./lib/integrations/snowflake-mcp.ts')

    // Create MCP client
    const client = createSnowflakeMCPClient()

    // Execute the specific queryFROM customers')
    const result = await client.executeQuery('SELECT COUNT(*) FROM customers')

    console.table(result.data)

  } catch (error) {

    process.exit(1)
  }
}

// Run the test
testCustomersCount().catch(console.error)
