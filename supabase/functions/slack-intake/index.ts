import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface SlackIntakeData {
  event_type: string
  submitter_id: string
  submitter_username: string
  team_id: string
  team: string
  title: string
  jtbd: string
  category: string
  current_process: string
  pain_points: string
  frequency: string
  time_friendly: string
  systems: string[]
  sensitivity: string
  urgency: string
  links: string
  view_id: string
  callback_id: string
}

export default async function handler(req: Request) {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const slackData: SlackIntakeData = await req.json()
    
    // Validate required fields
    if (!slackData.title || !slackData.submitter_username) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Missing required fields: title and submitter_username are required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Map urgency to priority
    const urgencyMap: Record<string, string> = {
      'p0': 'urgent',
      'p1': 'high', 
      'p2': 'medium',
      'p3': 'low'
    }
    
    // Find or create user based on Slack username
    const userId = await findOrCreateUser(slackData)
    
    // Create intake request
    const { data, error } = await supabase
      .from('intake_request')
      .insert({
        title: slackData.title,
        problem_statement: slackData.jtbd,
        automation_idea: slackData.current_process,
        category: slackData.category,
        current_process: slackData.current_process,
        pain_points: slackData.pain_points,
        frequency: slackData.frequency,
        time_friendly: slackData.time_friendly,
        systems: slackData.systems,
        sensitivity: slackData.sensitivity,
        links: slackData.links,
        priority: urgencyMap[slackData.urgency] || 'medium',
        slack_team_id: slackData.team_id,
        slack_team_name: slackData.team,
        slack_user_id: slackData.submitter_id,
        slack_username: slackData.submitter_username,
        requester: userId,
        status: 'new'
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      throw error
    }

    // Log the successful creation
    console.log(`Created intake request ${data.id} for user ${slackData.submitter_username}`)

    return new Response(JSON.stringify({ 
      success: true, 
      intake_request_id: data.id,
      message: 'Intake request created successfully'
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })

  } catch (error) {
    console.error('Error processing Slack intake:', error)
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

async function findOrCreateUser(slackData: SlackIntakeData): Promise<string> {
  // Try to find existing user by email (assuming workleap.com domain)
  const email = `${slackData.submitter_username}@workleap.com`
  
  const { data: existingUser } = await supabase
    .from('app_user')
    .select('id')
    .eq('email', email)
    .single()

  if (existingUser) {
    return existingUser.id
  }

  // Create new user if not found
  const { data: newUser, error } = await supabase
    .from('app_user')
    .insert({
      email: email,
      role: 'runner' // default role for new users
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating user:', error)
    throw new Error(`Failed to create user: ${error.message}`)
  }

  console.log(`Created new user ${email} with ID ${newUser.id}`)
  return newUser.id
}
