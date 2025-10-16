# Snowflake MCP Setup Guide

## Overview

This guide will help you set up Snowflake MCP (Model Context Protocol) integration in your GTM Hub application. The integration allows you to securely query and explore your Snowflake data warehouse using AI agents.

## 🚀 Quick Start

### 1. Environment Configuration

Add the following environment variables to your `.env.local` file:

```bash
# Snowflake MCP Configuration
SNOWFLAKE_MCP_ENABLED=true
SNOWFLAKE_MCP_READ_ONLY=true
SNOWFLAKE_MCP_MAX_ROWS=1000
SNOWFLAKE_MCP_TIMEOUT=300
SNOWFLAKE_MCP_AUDIT_LOGGING=true

# Snowflake OAuth Configuration (for production)
SNOWFLAKE_MCP_OAUTH_CLIENT_ID=your_oauth_client_id
SNOWFLAKE_MCP_OAUTH_CLIENT_SECRET=your_oauth_client_secret
SNOWFLAKE_MCP_OAUTH_REDIRECT_URI=http://localhost:3000/auth/snowflake/callback

# Basic Snowflake Configuration
SNOWFLAKE_ACCOUNT=your_snowflake_account
SNOWFLAKE_USER=your_snowflake_user
SNOWFLAKE_ROLE=your_snowflake_role
SNOWFLAKE_WAREHOUSE=your_snowflake_warehouse
SNOWFLAKE_DB=your_snowflake_database
SNOWFLAKE_PRIVATE_KEY=your_snowflake_private_key
```

### 2. Development Mode

For development and testing, the integration uses mock data. Simply set:

```bash
NODE_ENV=development
SNOWFLAKE_MCP_ENABLED=true
```

### 3. Production Setup

For production use with real Snowflake data:

1. **Enable Snowflake Managed MCP Server** in your Snowflake account
2. **Configure OAuth** for secure authentication
3. **Set up proper permissions** for the MCP role

## 🔧 Configuration Options

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `SNOWFLAKE_MCP_ENABLED` | Enable/disable MCP integration | `false` | Yes |
| `SNOWFLAKE_MCP_READ_ONLY` | Restrict to read-only operations | `true` | No |
| `SNOWFLAKE_MCP_MAX_ROWS` | Maximum rows per query | `1000` | No |
| `SNOWFLAKE_MCP_TIMEOUT` | Query timeout in seconds | `300` | No |
| `SNOWFLAKE_MCP_AUDIT_LOGGING` | Enable audit logging | `false` | No |

### Security Settings

```bash
# Security configuration
SNOWFLAKE_MCP_READ_ONLY=true
SNOWFLAKE_MCP_MAX_ROWS=1000
SNOWFLAKE_MCP_TIMEOUT=300
SNOWFLAKE_MCP_AUDIT_LOGGING=true
```

## 🛠️ Features

### Available Operations

1. **Database Exploration**
   - List all accessible databases
   - Browse schemas within databases
   - Explore tables within schemas

2. **Query Execution**
   - Execute SQL queries safely
   - Built-in SQL injection protection
   - Query timeout and row limits

3. **Schema Information**
   - Get detailed table schemas
   - View column types and constraints
   - Check table statistics

4. **Connection Management**
   - Monitor connection status
   - View current user and role
   - Track warehouse and database

### Security Features

- **SQL Injection Protection**: Validates and sanitizes all queries
- **Read-Only Mode**: Prevents data modification operations
- **Query Timeout**: Prevents long-running queries
- **Row Limits**: Controls data exposure
- **Audit Logging**: Tracks all operations

## 📱 Usage

### Access the Interface

Navigate to `/snowflake-mcp` in your application to access the Snowflake MCP interface.

### Key Features

1. **Connection Status**: View your current Snowflake connection
2. **Database Explorer**: Browse databases, schemas, and tables
3. **Query Interface**: Execute SQL queries with real-time results
4. **Results Display**: View query results in a formatted table

### Example Queries

```sql
-- Count records
SELECT COUNT(*) FROM customers

-- Show tables
SHOW TABLES

-- Get table information
DESCRIBE TABLE customers

-- Simple data query
SELECT * FROM customers LIMIT 10
```

## 🔒 Security Best Practices

### 1. Role-Based Access Control

Create a dedicated role for MCP operations:

```sql
-- Create MCP role
CREATE ROLE mcp_reader;

-- Grant minimal permissions
GRANT USAGE ON DATABASE prod_db TO ROLE mcp_reader;
GRANT USAGE ON SCHEMA prod_db.public TO ROLE mcp_reader;
GRANT SELECT ON ALL TABLES IN SCHEMA prod_db.public TO ROLE mcp_reader;

-- Grant to user
GRANT ROLE mcp_reader TO USER mcp_user;
```

### 2. Query Validation

The system automatically blocks dangerous operations:

```sql
-- ❌ Blocked operations
DROP TABLE customers
DELETE FROM customers
INSERT INTO customers VALUES (...)
UPDATE customers SET name = 'test'
TRUNCATE TABLE customers
ALTER TABLE customers ADD COLUMN test
```

### 3. Audit Logging

Enable audit logging to track all operations:

```bash
SNOWFLAKE_MCP_AUDIT_LOGGING=true
```

## 🧪 Testing

### Run the Test Suite

```bash
# Test the MCP integration
node test-snowflake-mcp-integration.js
```

### Test Features

- ✅ Client creation and initialization
- ✅ Connection status verification
- ✅ Database listing
- ✅ Schema and table exploration
- ✅ Query execution
- ✅ Schema retrieval
- ✅ Error handling

## 🚨 Troubleshooting

### Common Issues

1. **Connection Failed**
   - Check Snowflake credentials
   - Verify network connectivity
   - Ensure proper permissions

2. **Query Timeout**
   - Increase `SNOWFLAKE_MCP_TIMEOUT`
   - Optimize query performance
   - Check warehouse status

3. **Permission Denied**
   - Verify role permissions
   - Check database/schema access
   - Review table-level permissions

### Debug Mode

Enable debug logging:

```bash
NODE_ENV=development
SNOWFLAKE_MCP_DEBUG=true
```

## 📚 API Reference

### SnowflakeMCPClient Interface

```typescript
interface SnowflakeMCPClient {
  executeQuery(query: string, options?: QueryOptions): Promise<SnowflakeQueryResult>
  getTableSchema(database: string, schema: string, table: string): Promise<TableSchema>
  listDatabases(): Promise<string[]>
  listSchemas(database: string): Promise<string[]>
  listTables(database: string, schema: string): Promise<string[]>
  getConnectionStatus(): Promise<ConnectionStatus>
}
```

### Query Options

```typescript
interface QueryOptions {
  timeout?: number
  maxRows?: number
  warehouse?: string
  role?: string
}
```

## 🔄 Updates and Maintenance

### Regular Tasks

1. **Monthly**: Review access logs and permissions
2. **Quarterly**: Update credentials and rotate keys
3. **Annually**: Security audit and penetration testing

### Monitoring

- Monitor query performance
- Track usage patterns
- Review security logs
- Update dependencies

## 📞 Support

For issues or questions:

- **Documentation**: Check this guide and inline comments
- **Security**: Review `SNOWFLAKE_MCP_SECURITY.md`
- **Testing**: Run the test suite for diagnostics

---

**Last Updated**: January 15, 2024  
**Version**: 1.0.0  
**Next Review**: February 15, 2024
