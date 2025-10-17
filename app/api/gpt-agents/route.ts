import { NextRequest, NextResponse } from 'next/server'
import { createGPTAgentClient } from '@/lib/integrations/gpt-agents'

export async function GET(request: NextRequest) {
  try {
    const client = createGPTAgentClient()
    const agents = await client.listAgents()

    return NextResponse.json({ success: true, data: agents })
  } catch (error) {
    console.error('Error fetching GPT agents:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch GPT agents' },
      { status: 500 }
    )
  }
}

// POST route removed - GPT agents are now added through the GTM-intake Slack command
