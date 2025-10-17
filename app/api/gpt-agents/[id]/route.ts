import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 GPT Agent API: Starting PUT request')
    
    const agentId = params.id
    const body = await request.json()

    console.log('🔍 Updating agent:', agentId, 'with data:', body)
    console.log('🔍 Environment check:', {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    })

    // Try service role key first, fallback to anon key
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      serviceRoleKey ? {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      } : {}
    )

    console.log('🔍 Using service role key:', !!serviceRoleKey)

    // Update the agent directly
    const { data: updatedAgent, error: updateError } = await supabase
      .from('gpt_agent')
      .update({
        name: body.name,
        description: body.description,
        category: body.category,
        updated_at: new Date().toISOString()
      })
      .eq('id', agentId)
      .select()
      .single()

    if (updateError) {
      console.error('❌ Error updating GPT agent:', updateError)
      console.error('❌ Error details:', JSON.stringify(updateError, null, 2))
      return NextResponse.json({ 
        error: 'Failed to update agent', 
        details: updateError.message,
        code: updateError.code 
      }, { status: 500 })
    }

    console.log('✅ Successfully updated agent:', updatedAgent)

    return NextResponse.json({ 
      success: true, 
      data: updatedAgent 
    })

  } catch (error) {
    console.error('❌ Error in GPT agent update:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}