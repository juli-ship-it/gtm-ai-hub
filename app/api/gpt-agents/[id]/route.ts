import { NextRequest, NextResponse } from 'next/server'
import { createGPTAgentClient } from '@/lib/integrations/gpt-agents'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const client = createGPTAgentClient()
    const agent = await client.getAgent(params.id)
    
    if (!agent) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true, data: agent })
  } catch (error) {
    console.error('Error fetching GPT agent:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch GPT agent' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const client = createGPTAgentClient()
    
    const agent = await client.updateAgent(params.id, body)
    
    return NextResponse.json({ success: true, data: agent })
  } catch (error) {
    console.error('Error updating GPT agent:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update GPT agent' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const client = createGPTAgentClient()
    const success = await client.deleteAgent(params.id)
    
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting GPT agent:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete GPT agent' },
      { status: 500 }
    )
  }
}
