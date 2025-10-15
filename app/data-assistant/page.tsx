import { Metadata } from 'next'
import DataChatbot from '@/components/data-chatbot'
import { PageHeader } from '@/components/page-header'
import { Sidebar } from '@/components/sidebar'

export const metadata: Metadata = {
  title: 'Data Assistant - AI-Powered Data Query',
  description: 'Query and analyze your data using natural language with AI-powered assistance across Snowflake, Supabase, HubSpot, and Mixpanel',
}

export default function DataAssistantPage() {
  return (
    <div className="min-h-screen bg-wl-bg">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-8">
          <PageHeader
            title="Data Assistant"
            description="Ask questions about your data in natural language. I can query Snowflake, Supabase, HubSpot, Mixpanel, and other connected data sources."
          />
          
          <div className="h-[calc(100vh-200px)]">
            <DataChatbot />
          </div>
        </div>
      </div>
    </div>
  )
}
