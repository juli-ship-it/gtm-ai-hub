import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

interface SlackHRIntakeData {
  event_type: string
  submitter_id: string
  submitter_username: string
  team_id: string
  team: string
  jtbd: string
  desired_module?: string
  notes?: string
  view_id: string
  callback_id: string
}

export default async function handler(req: Request) {
  console.log(`[${new Date().toISOString()}] HR University intake request received: ${req.method} ${req.url}`)
  
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Supabase-Service-Role',
      },
    })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    console.log('Parsing HR University intake request body...')
    const slackData = await req.json()
    console.log('HR University request data received:', JSON.stringify(slackData, null, 2))
    
    // Simple validation
    if (!slackData.jtbd || !slackData.submitter_username) {
      console.log('Missing required fields for HR University intake')
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Missing required fields: jtbd and submitter_username are required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    console.log('Creating HR University intake request...')
    
    // Find or create user
    const userId = await findOrCreateUser(slackData)
    
    // Create HR University intake request
    const { data, error } = await supabase
      .from('hr_intake_request')
      .insert({
        user_id: userId,
        jtbd: slackData.jtbd,
        desired_module: slackData.desired_module || null,
        notes: slackData.notes || null,
        status: 'new',
        slack_team_id: slackData.team_id || '',
        slack_team_name: slackData.team || '',
        slack_user_id: slackData.submitter_id || '',
        slack_username: slackData.submitter_username
      })
      .select()
      .single()

    if (error) {
      console.error('Database error creating HR University intake request:', error)
      return new Response(JSON.stringify({ 
        success: false, 
        error: `Database error: ${error.message}` 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    console.log(`Created HR University intake request ${data.id}`)

    // Send notification to Slack channel (optional)
    await notifySlackChannel(data, slackData)

    return new Response(JSON.stringify({ 
      success: true, 
      hr_intake_request_id: data.id,
      message: 'HR University intake request created successfully'
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })

  } catch (error) {
    console.error('Error processing HR University Slack intake:', error)
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
  }
}

async function findOrCreateUser(slackData: SlackHRIntakeData): Promise<string> {
  const email = `${slackData.submitter_username}@workleap.com`
  
  console.log(`Looking for user: ${email}`)
  
  // First, try to find existing user in app_user table
  const { data: existingAppUser, error: findError } = await supabase
    .from('app_user')
    .select('id')
    .eq('email', email)
    .maybeSingle()

  if (existingAppUser && !findError) {
    console.log(`Found existing app_user: ${existingAppUser.id}`)
    return existingAppUser.id
  }

  console.log(`User not found in app_user table, creating new user`)
  
  // Create new user directly in app_user table
  const { data: newUser, error: createError } = await supabase
    .from('app_user')
    .insert({
      email: email,
      role: 'runner'
    })
    .select()
    .single()

  if (createError) {
    console.error('Error creating user:', createError)
    throw new Error(`Failed to create user: ${createError.message}`)
  }

  console.log(`Created new user: ${newUser.id}`)
  return newUser.id
}

async function notifySlackChannel(hrIntakeData: any, slackData: SlackHRIntakeData) {
  // This would integrate with Slack API to send a notification
  // For now, we'll just log the notification
  console.log('Would send Slack notification:', {
    channel: '#hr-university-intake',
    text: `New HR University module request from @${slackData.submitter_username}`,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*New HR University Module Request*\n\n*Requested by:* @${slackData.submitter_username}\n*Job to be done:* ${slackData.jtbd}\n*Desired module:* ${slackData.desired_module || 'Not specified'}\n*Additional notes:* ${slackData.notes || 'None'}`
        }
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'View in Admin Panel'
            },
            url: `${process.env.SUPABASE_URL}/admin/hr-university/intake`
          }
        ]
      }
    ]
  })
}
