import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

    const supabase = createClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Create or get app_user record
    const { data: appUser, error: userError } = await supabase
      .from('app_user')
      .select('id')
      .eq('id', user.id)
      .single()

    if (userError && userError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching app_user:', userError)
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Create app_user if it doesn't exist
    if (!appUser) {
      const { error: createUserError } = await supabase
        .from('app_user')
        .insert({
          id: user.id,
          email: user.email!,
          role: 'runner'
        })

      if (createUserError) {
        console.error('Error creating app_user:', createUserError)
        return NextResponse.json(
          { success: false, error: 'Failed to create user record' },
          { status: 500 }
        )
      }
    }

    // Create the intake request
    const { data: intakeRequest, error: intakeError } = await supabase
      .from('intake_request')
      .insert({
        title: body.title,
        problem_statement: body.problem_statement,
        automation_idea: body.automation_idea,
        category: body.category || 'other',
        current_process: body.current_process || '',
        pain_points: body.pain_points || '',
        frequency: body.frequency || 'ad_hoc',
        time_friendly: body.time_friendly || '',
        systems: body.systems || [],
        sensitivity: body.sensitivity || 'low',
        links: body.links || '',
        priority: body.priority || 'medium',
        ethics_considerations: body.ethics_considerations || '',
        request_type: body.request_type,
        requester: user.id,
        status: 'new'
      })
      .select()
      .single()

    if (intakeError) {
      console.error('Error creating intake request:', intakeError)
      return NextResponse.json(
        { success: false, error: `Failed to create intake request: ${intakeError.message}` },
        { status: 500 }
      )
    }

    // Log the creation activity
    await supabase
      .from('intake_activity_log')
      .insert({
        intake_request_id: intakeRequest.id,
        user_id: user.id,
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
    console.error('Error in intake API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
