import { Metadata } from 'next'
import SnowflakeMCPDemo from '@/components/snowflake-mcp-demo'
import { PageHeader } from '@/components/page-header'

export const metadata: Metadata = {
  title: 'Snowflake MCP Integration',
  description: 'Query and explore your Snowflake data using Model Context Protocol',
}

export default function SnowflakeMCPPage() {
  return (
    <div className="container mx-auto py-8">
      <PageHeader
        title="Snowflake MCP Integration"
        description="Connect to your Snowflake data warehouse using Model Context Protocol for secure, governed data access"
        className="mb-8"
      />
      
      <SnowflakeMCPDemo />
    </div>
  )
}
