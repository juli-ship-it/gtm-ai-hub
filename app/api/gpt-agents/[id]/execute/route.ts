import { NextRequest, NextResponse } from 'next/server'
import { createGPTAgentClient } from '@/lib/integrations/gpt-agents'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const client = createGPTAgentClient()

    const response = await client.executeAgent(params.id, body)

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error executing GPT agent:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to execute GPT agent' },
      { status: 500 }
    )
  }
}
