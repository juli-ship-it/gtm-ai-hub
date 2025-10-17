import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabase } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.title || !body.problem_statement || !body.automation_idea) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: title, problem_statement, and automation_idea are required' },
        { status: 400 }
      )
    }

    // Validate request_type
    if (!['real', 'showcase', 'demo'].includes(body.request_type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid request_type. Must be real, showcase, or demo' },
        { status: 400 }
      )
    }

    // Use service role for intake requests
    const supabase = createServiceSupabase()

    console.log('🔍 Using service role for intake requests')

    // Get the current user from the request headers (if available)
    // For now, we'll use a default user ID or extract from request
    const userId = body.user_id || '00000000-0000-0000-0000-000000000000' // fallback user ID

    console.log('🔍 Using user ID for intake:', userId)

    // For now, skip the app_user creation since we're using service role
    // We'll use the provided user_id or fallback
    console.log('🔍 Skipping app_user check with service role')

    // Create the intake request
    console.log('🔍 Creating intake request with data:', {
      title: body.title,
      requester: userId,
      request_type: body.request_type
    })

    const { data: intakeRequest, error: intakeError } = await (supabase as any)
      .from('intake_request')
      .insert({
        title: body.title,
        problem_statement: body.problem_statement,
        automation_idea: body.automation_idea,
        category: body.category || 'mkt_other',
        current_process: body.current_process || '',
        pain_points: body.pain_points || '',
        frequency: body.frequency || 'adhoc',
        time_friendly: body.time_friendly || '',
        systems: body.systems || [],
        sensitivity: body.sensitivity === 'low' ? 'low' : body.sensitivity === 'medium' ? 'med' : body.sensitivity || 'low',
        links: body.links || '',
        priority: body.priority || 'medium',
        ethics_considerations: body.ethics_considerations || '',
        request_type: body.request_type,
        requester: userId,
        status: 'new'
      })
      .select()
      .single()

    if (intakeError) {
      console.error('❌ Error creating intake request:', intakeError)
      console.error('❌ Intake error details:', JSON.stringify(intakeError, null, 2))
      return NextResponse.json(
        { success: false, error: `Failed to create intake request: ${intakeError.message}` },
        { status: 500 }
      )
    }

    console.log('✅ Successfully created intake request:', intakeRequest)

    // Log the creation activity
    await (supabase as any)
      .from('intake_activity_log')
      .insert({
        intake_request_id: intakeRequest.id,
        user_id: userId,
        action_type: 'created',
        description: `${body.request_type === 'real' ? 'Intake request' : 'Showcase example'} created`,
        metadata: {
          request_type: body.request_type,
          category: body.category
        }
      })

    return NextResponse.json({
      success: true,
      intake_request_id: intakeRequest.id,
      message: `${body.request_type === 'real' ? 'Intake request' : 'Showcase example'} created successfully`
    })

  } catch (error) {
    console.error('❌ Error in intake API:', error)
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
