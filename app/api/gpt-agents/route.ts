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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const client = createGPTAgentClient()
    
    const agent = await client.createAgent(body)
    
    return NextResponse.json({ success: true, data: agent })
  } catch (error) {
    console.error('Error creating GPT agent:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create GPT agent' },
      { status: 500 }
    )
  }
}
