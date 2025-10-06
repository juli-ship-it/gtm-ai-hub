import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    db: {
      schema: 'public'
    }
  }
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
  gpt_agent_url?: string  // New field for GPT agent URL
  view_id: string
  callback_id: string
}

// Deno.serve is the Deno way to create HTTP servers
Deno.serve(async (req: Request) => {
  console.log(`[${new Date().toISOString()}] Request received: ${req.method} ${req.url}`)
  
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

  // Set up timeout
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Function timeout after 25 seconds')), 25000)
  })

  try {
    const result = await Promise.race([
      processRequest(req),
      timeoutPromise
    ])
    return result
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
})

async function processRequest(req: Request) {
  try {
    console.log('Parsing request body...')
    const slackData = await req.json()
    console.log('Request data received:', JSON.stringify(slackData, null, 2))
    
    // Simple validation
    if (!slackData.title || !slackData.submitter_username) {
      console.log('Missing required fields')
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Missing required fields: title and submitter_username are required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    console.log('Creating simple intake request...')
    
    // For now, let's create the intake request without a user reference
    // We'll store the user info in the slack fields instead
    console.log(`Creating intake request for: ${slackData.submitter_username}`)
    
    // Create intake request with minimal data
    const { data, error } = await supabase
      .from('intake_request')
      .insert({
        title: slackData.title,
        problem_statement: slackData.jtbd || 'No description provided',
        automation_idea: slackData.current_process || 'No automation idea provided',
        category: slackData.category || 'other',
        current_process: slackData.current_process || 'No current process described',
        pain_points: slackData.pain_points || 'No pain points described',
        frequency: slackData.frequency || 'ad_hoc',
        time_friendly: slackData.time_friendly || 'Unknown',
        systems: slackData.systems || [],
        sensitivity: slackData.sensitivity || 'low',
        links: slackData.links || '',
        priority: 'medium',
        slack_team_id: slackData.team_id || '',
        slack_team_name: slackData.team || '',
        slack_user_id: slackData.submitter_id || '',
        slack_username: slackData.submitter_username,
        requester: null, // We'll set this to null for now
        status: 'new'
      })
      .select()
      .single()

    if (error) {
      console.error('Database error creating intake request:', error)
      return new Response(JSON.stringify({ 
        success: false, 
        error: `Database error: ${error.message}`,
        details: error
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    console.log(`Created intake request ${data.id}`)

    // Check if GPT agent URL is provided and create GPT agent entry
    let gptAgentId: string | null = null
    console.log(`Checking for GPT agent URL...`)
    console.log(`gpt_agent_url field: ${slackData.gpt_agent_url}`)
    console.log(`links field: ${slackData.links}`)
    
    if (slackData.gpt_agent_url || slackData.links) {
      console.log(`Found links data, extracting GPT agent URL...`)
      const gptAgentUrl = slackData.gpt_agent_url || extractGPTAgentUrl(slackData.links)
      console.log(`Extracted GPT agent URL: ${gptAgentUrl}`)
      
      if (gptAgentUrl) {
        console.log(`GPT agent URL found, creating GPT agent...`)
        try {
          gptAgentId = await createGPTAgentFromUrl(gptAgentUrl, slackData, data.id)
          console.log(`✅ Created GPT agent ${gptAgentId} from URL: ${gptAgentUrl}`)
        } catch (error) {
          console.error('❌ Error creating GPT agent:', error)
          // Don't fail the entire request if GPT agent creation fails
        }
      } else {
        console.log(`No GPT agent URL found in links field`)
      }
    } else {
      console.log(`No links data provided`)
    }

    return new Response(JSON.stringify({ 
      success: true, 
      intake_request_id: data.id,
      gpt_agent_id: gptAgentId,
      message: 'Intake request created successfully' + (gptAgentId ? ' with GPT agent' : '')
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })

  } catch (error) {
    console.error('Error processing request:', error)
    throw error // Re-throw to be caught by the outer handler
  }
}


// Helper function to extract GPT agent URL from links field
function extractGPTAgentUrl(links: string): string | null {
  console.log(`Extracting GPT agent URL from: "${links}"`)
  
  if (!links) {
    console.log(`No links provided`)
    return null
  }
  
  // Look for ChatGPT GPT agent URLs
  const gptAgentRegex = /https:\/\/chatgpt\.com\/g\/g-[a-zA-Z0-9-]+/g
  const matches = links.match(gptAgentRegex)
  
  console.log(`Regex matches: ${matches}`)
  
  if (matches && matches.length > 0) {
    console.log(`Found GPT agent URL: ${matches[0]}`)
    return matches[0] // Return the first GPT agent URL found
  }
  
  console.log(`No GPT agent URL found in links`)
  return null
}

// Helper function to create GPT agent from URL
async function createGPTAgentFromUrl(
  gptAgentUrl: string, 
  slackData: SlackIntakeData, 
  intakeRequestId: string
): Promise<string> {
  console.log(`Creating GPT agent from URL: ${gptAgentUrl}`)
  
  // Extract agent ID from URL
  const agentIdMatch = gptAgentUrl.match(/\/g\/(g-[a-zA-Z0-9-]+)/)
  if (!agentIdMatch) {
    throw new Error('Invalid GPT agent URL format')
  }
  
  const agentId = agentIdMatch[1]
  
  // Generate agent name and description from intake data
  const agentName = `${slackData.title} - GPT Agent`
  const agentDescription = `GPT Agent for: ${slackData.jtbd || slackData.title}\n\nCreated from intake request: ${intakeRequestId}\nSubmitted by: ${slackData.submitter_username}`
  
  // Determine category based on intake category
  const categoryMapping: { [key: string]: string } = {
    'content': 'content',
    'reporting': 'analysis',
    'intake': 'support',
    'governance': 'support',
    'automation': 'automation',
    'other': 'support'
  }
  
  const agentCategory = categoryMapping[slackData.category] || 'support'
  
  // Try to find a real user, or use null if none exists
  let userId: string | null = null
  try {
    const { data: anyUser, error: findError } = await supabase
      .from('app_user')
      .select('id')
      .limit(1)
      .maybeSingle()

    if (anyUser && !findError) {
      userId = anyUser.id
      console.log(`Using existing user: ${userId}`)
    } else {
      console.log(`No users found, setting created_by to null`)
    }
  } catch (error) {
    console.log(`Error finding user, setting created_by to null:`, error)
  }
  
  // Create GPT agent entry
  const { data: gptAgent, error: gptAgentError } = await supabase
    .from('gpt_agent')
    .insert({
      name: agentName,
      description: agentDescription,
      iframe_url: gptAgentUrl,
      category: agentCategory,
      status: 'active',
      created_by: userId, // This will be null if no user found
      configuration: {
        source: 'slack_intake',
        intake_request_id: intakeRequestId,
        original_url: gptAgentUrl,
        agent_id: agentId
      },
      permissions: {
        canRead: true,
        canWrite: false,
        canExecute: true
      }
    })
    .select()
    .single()

  if (gptAgentError) {
    console.error('Error creating GPT agent:', gptAgentError)
    throw new Error(`Failed to create GPT agent: ${gptAgentError.message}`)
  }

  console.log(`Successfully created GPT agent: ${gptAgent.id}`)
  return gptAgent.id
}
