import { Metadata } from 'next'
import DataChatbot from '@/components/data-chatbot'
import { PageHeader } from '@/components/page-header'
import { Sidebar } from '@/components/sidebar'

export const metadata: Metadata = {
  title: 'Data Assistant - AI-Powered Data Query',
  description: 'Query and analyze your data using natural language with AI-powered assistance across Intercom, HubSpot, Gong, Mixpanel, Crayon, Clay, and Snowflake',
}

export default function DataAssistantPage() {
  return (
    <div className="min-h-screen bg-wl-bg">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-8">
          <PageHeader
            title="Data Assistant"
            description="Ask questions about your data in natural language. Query across 8 connected data sources including Intercom, HubSpot, Gong, Mixpanel, Crayon, Clay, and Snowflake."
          />
          
          <div className="h-[calc(100vh-200px)]">
            <DataChatbot />
          </div>
        </div>
      </div>
    </div>
  )
}
