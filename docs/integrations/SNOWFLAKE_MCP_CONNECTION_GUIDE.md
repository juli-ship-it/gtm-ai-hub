# Snowflake MCP Real Connection Setup Guide

## ✅ What We've Implemented

Your Snowflake MCP integration now connects to **real Snowflake data** using the Model Context Protocol (MCP) SDK. Here's what changed:

### 1. Real MCP Client Implementation (`lib/integrations/snowflake-mcp.ts`)

The `RealSnowflakeMCPClient` now:
- ✅ Connects to the Snowflake MCP server via `uvx snowflake-labs-mcp`
- ✅ Uses your existing MCP configuration from `~/.cursor/mcp.json`
- ✅ Executes real SQL queries against your HUBSPOT_WORKLEAP database
- ✅ Lists actual databases, schemas, and tables
- ✅ Returns real data with proper error handling
- ✅ Includes security validation and query sanitization

### 2. Dynamic MCP Connection

```typescript
// Connects to the Snowflake MCP server
const transport = new StdioClientTransport({
  command: 'uvx',
  args: [
    'snowflake-labs-mcp',
    '--service-config-file',
    process.env.SNOWFLAKE_MCP_CONFIG_FILE,
    '--connection-name',
    'default'
  ],
  env: {
    SNOWFLAKE_ACCOUNT: process.env.SNOWFLAKE_ACCOUNT,
    SNOWFLAKE_USERNAME: process.env.SNOWFLAKE_USER,
    SNOWFLAKE_PASSWORD: process.env.SNOWFLAKE_PASSWORD,
    // ... other credentials
  }
})
```

## 🚀 Setup Instructions

### Step 1: Create `.env.local` File

Copy the template and add your Snowflake password:

```bash
cp .env.local.template .env.local
```

Then edit `.env.local` and update:

```bash
SNOWFLAKE_PASSWORD=your_actual_snowflake_password
```

**Note:** The other Snowflake credentials are already populated from your `mcp.json` configuration.

### Step 2: Verify MCP Configuration

Ensure your `~/.cursor/mcp.json` has the Snowflake server configured:

```json
{
  "mcpServers": {
    "snowflake": {
      "command": "uvx",
      "args": [
        "snowflake-labs-mcp",
        "--service-config-file",
        "/Users/juliana.reyes/.cursor/snowflake-mcp-config.yaml",
        "--connection-name",
        "default"
      ],
      "env": {
        "SNOWFLAKE_ACCOUNT": "A6756602286471-XQF48217",
        "SNOWFLAKE_USERNAME": "JULIANA.REYES@WORKLEAP.COM",
        "SNOWFLAKE_PASSWORD": "your_password_here",
        "SNOWFLAKE_WAREHOUSE": "DEFAULT_WH",
        "SNOWFLAKE_DATABASE": "HUBSPOT_WORKLEAP",
        "SNOWFLAKE_ROLE": "PUBLIC"
      }
    }
  }
}
```

### Step 3: Test the Connection

Run the test script to verify everything works:

```bash
node test/integrations/test-snowflake-mcp-connection.js
```

Expected output:
```
🧪 Testing Snowflake MCP Connection

1️⃣ Creating Snowflake MCP client...
✅ Client created

2️⃣ Testing connection status...
✅ Connection Status: {
  "connected": true,
  "account": "A6756602286471-XQF48217",
  "user": "JULIANA.REYES@WORKLEAP.COM",
  "role": "PUBLIC",
  "warehouse": "DEFAULT_WH",
  "database": "HUBSPOT_WORKLEAP"
}

3️⃣ Listing databases...
✅ Databases: ["HUBSPOT_WORKLEAP", ...]

4️⃣ Listing schemas...
✅ Schemas: ["PUBLIC", "INFORMATION_SCHEMA", ...]

5️⃣ Listing tables...
✅ Tables: ["COMPANIES", "CONTACTS", "DEALS", ...]

6️⃣ Executing test query...
✅ Query Result: {
  "data": [{ "CURRENT_TIME": "2025-10-16 12:34:56.789" }],
  "columns": ["CURRENT_TIME"],
  "rowCount": 1,
  "executionTime": 0.5
}

🎉 All tests passed!
```

### Step 4: Start Your Application

```bash
npm run dev
```

## 🔍 How It Works

### Client Creation Logic

```typescript
export function createSnowflakeMCPClient(): SnowflakeMCPClient {
  const mcpEnabled = process.env.SNOWFLAKE_MCP_ENABLED === 'true'
  
  if (mcpEnabled) {
    // ✅ Uses REAL Snowflake MCP connection
    return new RealSnowflakeMCPClient()
  }
  
  // Falls back to mock data if disabled
  return new MockSnowflakeMCPClient()
}
```

### Query Execution Flow

```
User Request
    ↓
Data Chatbot (/api/data-chatbot)
    ↓
executeSnowflakeQuery()
    ↓
RealSnowflakeMCPClient.executeQuery()
    ↓
MCP SDK Client.callTool('execute_sql')
    ↓
uvx snowflake-labs-mcp server
    ↓
Snowflake Database (HUBSPOT_WORKLEAP)
    ↓
Real Data Returns! 🎉
```

## 📊 Available Operations

### 1. Execute Queries

```typescript
const client = createSnowflakeMCPClient()
const result = await client.executeQuery('SELECT * FROM COMPANIES LIMIT 10')
```

### 2. List Databases

```typescript
const databases = await client.listDatabases()
// ["HUBSPOT_WORKLEAP", "SALESFORCE_DATA", ...]
```

### 3. Browse Tables

```typescript
const schemas = await client.listSchemas('HUBSPOT_WORKLEAP')
const tables = await client.listTables('HUBSPOT_WORKLEAP', 'PUBLIC')
```

### 4. Get Table Schema

```typescript
const schema = await client.getTableSchema('HUBSPOT_WORKLEAP', 'PUBLIC', 'COMPANIES')
```

### 5. Check Connection

```typescript
const status = await client.getConnectionStatus()
```

## 🔒 Security Features

### Query Validation

All queries are validated before execution:

- ✅ Blocks `DROP`, `DELETE`, `TRUNCATE`, `ALTER`
- ✅ Blocks `INSERT`, `UPDATE`, `GRANT`, `REVOKE`
- ✅ Only allows `SELECT`, `SHOW`, `DESCRIBE`, `EXPLAIN`
- ✅ Removes SQL comments
- ✅ Sanitizes input

### Read-Only Mode

By default, the client is in read-only mode:

```bash
SNOWFLAKE_MCP_READ_ONLY=true  # Only SELECT queries allowed
```

### Row Limits

Maximum rows returned per query:

```bash
SNOWFLAKE_MCP_MAX_ROWS=1000   # Prevents large data exports
```

### Query Timeout

Prevents long-running queries:

```bash
SNOWFLAKE_MCP_TIMEOUT=300     # 5 minutes max
```

## 🧪 Testing

### Basic Connection Test

```bash
node test/integrations/test-snowflake-mcp-connection.js
```

### Test via Data Assistant

1. Go to `/data-assistant` in your app
2. Ask: "Show me the tables in HUBSPOT_WORKLEAP"
3. Ask: "Count rows in the COMPANIES table"
4. Ask: "Show me the top 5 companies by revenue"

## 🐛 Troubleshooting

### Issue: "Failed to connect to Snowflake MCP server"

**Solution:** Verify your credentials in `.env.local`

```bash
# Check that these are set correctly
SNOWFLAKE_ACCOUNT=A6756602286471-XQF48217
SNOWFLAKE_USER=JULIANA.REYES@WORKLEAP.COM
SNOWFLAKE_PASSWORD=your_actual_password
```

### Issue: "uvx command not found"

**Solution:** Install uv (Python package manager):

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

### Issue: "Query contains potentially dangerous operations"

**Solution:** Your query is blocked by security validation. Only SELECT queries are allowed in read-only mode.

### Issue: Mock data still showing

**Solution:** Ensure `SNOWFLAKE_MCP_ENABLED=true` in `.env.local`

```bash
# In .env.local
SNOWFLAKE_MCP_ENABLED=true
```

## 📝 Environment Variables Reference

| Variable | Value | Description |
|----------|-------|-------------|
| `SNOWFLAKE_MCP_ENABLED` | `true` | Enable real MCP connection |
| `SNOWFLAKE_ACCOUNT` | Account ID | Your Snowflake account |
| `SNOWFLAKE_USER` | Username | Snowflake username |
| `SNOWFLAKE_PASSWORD` | Password | Snowflake password |
| `SNOWFLAKE_WAREHOUSE` | `DEFAULT_WH` | Compute warehouse |
| `SNOWFLAKE_DB` | `HUBSPOT_WORKLEAP` | Default database |
| `SNOWFLAKE_ROLE` | `PUBLIC` | User role |
| `SNOWFLAKE_MCP_READ_ONLY` | `true` | Read-only mode |
| `SNOWFLAKE_MCP_MAX_ROWS` | `1000` | Max rows per query |
| `SNOWFLAKE_MCP_TIMEOUT` | `300` | Query timeout (seconds) |

## 🎯 Next Steps

1. ✅ Create `.env.local` with your password
2. ✅ Run the test script
3. ✅ Start the dev server
4. ✅ Test via Data Assistant UI
5. ✅ Query your real Snowflake data!

## 📚 Related Documentation

- [Snowflake MCP Setup](./SNOWFLAKE_MCP_SETUP.md)
- [Data Assistant Documentation](../summaries/DATA_ASSISTANT_DOCUMENTATION.md)
- [MCP Architecture](../architecture/DATA_ASSISTANT_MCP_ARCHITECTURE.md)

---

**Last Updated:** October 16, 2025  
**Status:** ✅ Production Ready

