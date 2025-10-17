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
  request_type?: string   // New field for request type (request/showcase)
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

// Helper function to check if there's additional information beyond just the GPT URL
function checkForAdditionalInformation(slackData: SlackIntakeData, gptAgentUrl: string | null): boolean {
  console.log('Checking for additional information beyond GPT URL...')
  
  // If no GPT URL, we definitely need an intake request
  if (!gptAgentUrl) {
    console.log('No GPT URL found - will create intake request')
    return true
  }
  
  // Check for meaningful content in key fields
  const hasTitle = slackData.title && slackData.title.trim() !== '' && slackData.title !== 'GPT Agent Request'
  const hasJobToBeDone = slackData.jtbd && slackData.jtbd.trim() !== '' && slackData.jtbd !== 'No description provided'
  const hasCurrentProcess = slackData.current_process && slackData.current_process.trim() !== '' && slackData.current_process !== 'No current process described'
  const hasPainPoints = slackData.pain_points && slackData.pain_points.trim() !== '' && slackData.pain_points !== 'No pain points described'
  const hasCategory = slackData.category && slackData.category !== 'other'
  const hasFrequency = slackData.frequency && slackData.frequency !== 'adhoc'
  const hasSystems = slackData.systems && slackData.systems.length > 0
  const hasSensitivity = slackData.sensitivity && slackData.sensitivity !== 'low'
  const hasUrgency = slackData.urgency && slackData.urgency.trim() !== ''
  const hasOtherLinks = slackData.links && slackData.links.trim() !== '' && !slackData.links.includes(gptAgentUrl)
  
  const additionalInfo = {
    hasTitle,
    hasJobToBeDone,
    hasCurrentProcess,
    hasPainPoints,
    hasCategory,
    hasFrequency,
    hasSystems,
    hasSensitivity,
    hasUrgency,
    hasOtherLinks
  }
  
  console.log('Additional information check:', additionalInfo)
  
  // Return true if any meaningful additional information is present
  const hasAdditionalInfo = Object.values(additionalInfo).some(Boolean)
  console.log(`Has additional information: ${hasAdditionalInfo}`)
  
  return hasAdditionalInfo
}

async function processRequest(req: Request) {
  try {
    console.log('Parsing request body...')
    const slackData = await req.json()
    console.log('Request data received:', JSON.stringify(slackData, null, 2))
    
    // Always try to scrape GPT agent data if URL is available
    let finalTitle = slackData.title
    let scrapedGPTData: GPTAgentData | null = null
    
    const gptAgentUrl = slackData.gpt_agent_url || extractGPTAgentUrl(slackData.links)
    if (gptAgentUrl) {
      console.log('GPT agent URL found, attempting to scrape data...')
      // Try to scrape full GPT agent data
      scrapedGPTData = await scrapeGPTAgentData(gptAgentUrl)
      if (scrapedGPTData) {
        // Use scraped title if we don't have one, or if scraped title is better
        if (!finalTitle || finalTitle.trim() === '' || scrapedGPTData.name.length > finalTitle.length) {
          finalTitle = scrapedGPTData.name
          console.log(`Using scraped title: "${finalTitle}"`)
        } else {
          console.log(`Keeping existing title: "${finalTitle}"`)
        }
      } else {
        // Fallback to simple URL parsing if scraping failed
        if (!finalTitle || finalTitle.trim() === '') {
          finalTitle = extractGPTAgentNameFromUrl(gptAgentUrl)
          console.log(`Fallback: extracted title from GPT agent URL: "${finalTitle}"`)
        }
      }
    } else {
      console.log('No GPT agent URL found, skipping scraping')
    }

    // Simple validation
    if (!finalTitle || !slackData.submitter_username) {
      console.log('Missing required fields')
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Missing required fields: title and submitter_username are required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Check if we have additional information beyond just the GPT URL
    const hasAdditionalInfo = checkForAdditionalInformation(slackData, gptAgentUrl)
    console.log(`Has additional information beyond GPT URL: ${hasAdditionalInfo}`)
    
    let intakeRequestId: string | null = null
    let requestType = 'gpt_only'
    
    if (hasAdditionalInfo) {
      console.log('Creating intake request due to additional information...')
      
      // Determine request type from payload
      requestType = slackData.request_type === 'showcase' ? 'showcase' : 'real'
      console.log(`Request type: ${requestType}`)
      
      // Create intake request with minimal data
      const { data, error } = await supabase
        .from('intake_request')
        .insert({
          title: finalTitle,
          problem_statement: slackData.jtbd || 'No description provided',
          automation_idea: slackData.current_process || 'No automation idea provided',
          category: slackData.category || 'other',
          current_process: slackData.current_process || 'No current process described',
          pain_points: slackData.pain_points || 'No pain points described',
          frequency: slackData.frequency || 'adhoc',
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

      intakeRequestId = data.id
      console.log(`Created intake request ${intakeRequestId}`)
    } else {
      console.log('Skipping intake request creation - only GPT URL provided')
    }

    // Check if GPT agent URL is provided and create GPT agent entry
    let gptAgentId: string | null = null
    console.log(`Checking for GPT agent URL...`)
    console.log(`gpt_agent_url field: ${slackData.gpt_agent_url}`)
    console.log(`links field: ${slackData.links}`)
    console.log(`scrapedGPTData: ${scrapedGPTData ? 'Available' : 'Not available'}`)
    
    if (gptAgentUrl) {
      console.log(`Creating GPT agent from URL: ${gptAgentUrl}`)
      console.log(`Using scraped data: ${scrapedGPTData ? JSON.stringify(scrapedGPTData) : 'None'}`)
      try {
        gptAgentId = await createGPTAgentFromUrl(gptAgentUrl, slackData, intakeRequestId, finalTitle, scrapedGPTData)
        console.log(`✅ Created GPT agent ${gptAgentId} from URL: ${gptAgentUrl}`)
      } catch (error) {
        console.error('❌ Error creating GPT agent:', error)
        console.error('Error details:', JSON.stringify(error, null, 2))
        // Don't fail the entire request if GPT agent creation fails
      }
    } else {
      console.log(`No GPT agent URL found, skipping GPT agent creation`)
    }

    return new Response(JSON.stringify({ 
      success: true, 
      intake_request_id: intakeRequestId,
      gpt_agent_id: gptAgentId,
      request_type: requestType,
      message: requestType === 'gpt_only' 
        ? 'GPT agent created successfully' 
        : `${requestType === 'real' ? 'Intake request' : 'Showcase example'} created successfully` + (gptAgentId ? ' with GPT agent' : '')
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

// Interface for GPT agent data extracted from URL
interface GPTAgentData {
  name: string
  description: string
  instructions: string
  capabilities: string[]
  conversationStarters: string[]
  creator: string
  creatorUsername: string
}

// Helper function to decode HTML entities
function decodeHtmlEntities(text: string): string {
  const entityMap: { [key: string]: string } = {
    '&quot;': '"',
    '&apos;': "'",
    '&#39;': "'",
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&nbsp;': ' ',
    '&copy;': '©',
    '&reg;': '®',
    '&trade;': '™'
  }
  
  return text.replace(/&[a-zA-Z0-9#]+;/g, (entity) => {
    return entityMap[entity] || entity
  })
}

// Helper function to extract GPT agent name from URL (fallback method)
function extractGPTAgentNameFromUrl(gptAgentUrl: string): string {
  console.log(`Extracting GPT agent name from URL: ${gptAgentUrl}`)
  
  try {
    // Extract the agent name from URL like: https://chatgpt.com/g/g-681b69671a748191ab093f497e233c8c-luke-the-paid-marketer-master
    const urlParts = gptAgentUrl.split('/')
    const agentPart = urlParts[urlParts.length - 1] // Get the last part: g-681b69671a748191ab093f497e233c8c-luke-the-paid-marketer-master
    
    console.log(`Agent part: ${agentPart}`)
    
    // Split by the first dash after the ID to get the name part
    // The pattern should match: g-[id]-[name-with-dashes]
    const nameMatch = agentPart.match(/^g-[a-zA-Z0-9-]+-(.+)$/)
    console.log(`Name match result: ${JSON.stringify(nameMatch)}`)
    
    if (nameMatch && nameMatch[1]) {
      const rawName = nameMatch[1]
      console.log(`Raw name from URL: "${rawName}"`)
      
      // Convert dashes to spaces and capitalize
      const agentName = rawName
        .split('-')
        .map(word => {
          // Handle special cases like "the", "paid", "marketer"
          const lowerWord = word.toLowerCase()
          if (lowerWord === 'the' || lowerWord === 'paid' || lowerWord === 'marketer') {
            return word.charAt(0).toUpperCase() + word.slice(1)
          }
          return word.charAt(0).toUpperCase() + word.slice(1)
        })
        .join(' ')
      
      console.log(`Extracted agent name: "${agentName}"`)
      return agentName
    }
    
    // Fallback: if we can't parse the name, use a generic title
    console.log(`Could not parse agent name from URL, using fallback`)
    return 'GPT Agent Request'
    
  } catch (error) {
    console.error(`Error extracting agent name from URL: ${error}`)
    return 'GPT Agent Request'
  }
}

// Helper function to scrape GPT agent data from ChatGPT URL
async function scrapeGPTAgentData(gptAgentUrl: string): Promise<GPTAgentData | null> {
  console.log(`Scraping GPT agent data from URL: ${gptAgentUrl}`)
  
  try {
    // Fetch the HTML content from the GPT agent URL
    const response = await fetch(gptAgentUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      }
    })
    
    if (!response.ok) {
      console.error(`Failed to fetch GPT agent page: ${response.status} ${response.statusText}`)
      console.error(`URL that failed: ${gptAgentUrl}`)
      return null
    }
    
    const html = await response.text()
    console.log(`Successfully fetched HTML content (${html.length} characters)`)
    
    // Extract data from HTML using regex patterns
    const agentData: GPTAgentData = {
      name: extractGPTAgentNameFromUrl(gptAgentUrl), // Fallback to URL parsing
      description: '',
      instructions: '',
      capabilities: [],
      conversationStarters: [],
      creator: '',
      creatorUsername: ''
    }
    
    // Try to extract title from multiple sources
    const titlePatterns = [
      // Page title
      /<title[^>]*>([^<]+)<\/title>/i,
      // Open Graph title
      /<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["'][^>]*>/i,
      // Twitter title
      /<meta[^>]*name=["']twitter:title["'][^>]*content=["']([^"']+)["'][^>]*>/i,
      // JSON-LD title
      /"name"\s*:\s*"([^"]+)"/i,
      // HTML heading patterns
      /<h1[^>]*>([^<]+)<\/h1>/i,
      /<h2[^>]*>([^<]+)<\/h2>/i,
      // Specific GPT agent title patterns
      /class="[^"]*text-2xl[^"]*"[^>]*>([^<]+)<\/div>/i,
      /class="[^"]*font-semibold[^"]*"[^>]*>([^<]+)<\/div>/i
    ]
    
    for (let i = 0; i < titlePatterns.length; i++) {
      const pattern = titlePatterns[i]
      const titleMatch = html.match(pattern)
      if (titleMatch && titleMatch[1]) {
        const title = titleMatch[1].trim()
        console.log(`Title pattern ${i + 1} matched: "${title}"`)
        if (title && !title.includes('ChatGPT') && title.length > 3) {
          agentData.name = decodeHtmlEntities(title.replace(/^ChatGPT - /, '').trim())
          console.log(`✅ Extracted title from pattern ${i + 1}: "${agentData.name}"`)
          break
        } else {
          console.log(`❌ Title pattern ${i + 1} matched but filtered out: "${title}"`)
        }
      } else {
        console.log(`❌ Title pattern ${i + 1} did not match`)
      }
    }
    
    // Try to extract from URL as well (more reliable for GPT agent names)
    const urlName = extractGPTAgentNameFromUrl(gptAgentUrl)
    if (urlName && urlName !== 'GPT Agent Request' && urlName.length > agentData.name.length) {
      agentData.name = urlName
      console.log(`Using URL-extracted name (longer): "${agentData.name}"`)
    }
    
    // Try to extract description from multiple sources
    const descPatterns = [
      // Meta description
      /<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i,
      // Open Graph description
      /<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["'][^>]*>/i,
      // Twitter description
      /<meta[^>]*name=["']twitter:description["'][^>]*content=["']([^"']+)["'][^>]*>/i,
      // JSON-LD description
      /"description"\s*:\s*"([^"]+)"/i,
      // Look for description in paragraph tags
      /<p[^>]*>([^<]{20,200})<\/p>/i,
      // Look for description in div tags with specific classes
      /class="[^"]*description[^"]*"[^>]*>([^<]+)<\/div>/i
    ]
    
    for (const pattern of descPatterns) {
      const descMatch = html.match(pattern)
      if (descMatch && descMatch[1]) {
        const description = descMatch[1].trim()
        if (description && description.length > 10 && description.length < 500) {
          agentData.description = decodeHtmlEntities(description)
          console.log(`Extracted description: "${agentData.description}"`)
          break
        }
      }
    }
    
    // Look for JSON-LD structured data
    const jsonLdMatch = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>(.*?)<\/script>/is)
    if (jsonLdMatch && jsonLdMatch[1]) {
      try {
        const jsonData = JSON.parse(jsonLdMatch[1])
        if (jsonData.name && !jsonData.name.includes('ChatGPT')) {
          agentData.name = decodeHtmlEntities(jsonData.name)
        }
        if (jsonData.description) {
          agentData.description = decodeHtmlEntities(jsonData.description)
        }
        console.log(`Extracted JSON-LD data: name="${agentData.name}", description="${agentData.description}"`)
      } catch (e) {
        console.log(`Failed to parse JSON-LD data: ${e}`)
      }
    }
    
    // Try to extract creator information with more comprehensive patterns
    const creatorPatterns = [
      // Specific GPT agent creator patterns
      /class="[^"]*text-token-text-tertiary[^"]*"[^>]*>By\s+([^<]+)<\/div>/i,
      /class="[^"]*text-sm[^"]*"[^>]*>By\s+([^<]+)<\/div>/i,
      /<div[^>]*>By\s+([^<]+)<\/div>/i,
      // General creator patterns
      /Created by[:\s]+([^<\n]+)/i,
      /Author[:\s]+([^<\n]+)/i,
      /Made by[:\s]+([^<\n]+)/i,
      /Built by[:\s]+([^<\n]+)/i,
      /Creator[:\s]+([^<\n]+)/i,
      /by\s+([A-Za-z0-9._\s-]+)/i,
      /@([A-Za-z0-9._-]+)/i,
      // Look for names after "By" in various contexts
      /By\s+([A-Z][a-z]+\s+[A-Z][a-z]+)/i,
      /By\s+([A-Z][a-z]+)/i
    ]
    
    for (let i = 0; i < creatorPatterns.length; i++) {
      const pattern = creatorPatterns[i]
      const creatorMatch = html.match(pattern)
      if (creatorMatch && creatorMatch[1]) {
        const creator = creatorMatch[1].trim()
        console.log(`Creator pattern ${i + 1} matched: "${creator}"`)
        if (creator && creator.length > 0 && creator.length < 50 && !creator.includes('ChatGPT')) {
          agentData.creator = decodeHtmlEntities(creator)
          agentData.creatorUsername = agentData.creator.replace(/[^A-Za-z0-9._-]/g, '')
          console.log(`✅ Extracted creator from pattern ${i + 1}: "${agentData.creator}"`)
          break
        } else {
          console.log(`❌ Creator pattern ${i + 1} matched but filtered out: "${creator}"`)
        }
      } else {
        console.log(`❌ Creator pattern ${i + 1} did not match`)
      }
    }
    
    // Look for creator in JSON-LD data
    if (!agentData.creator && jsonLdMatch && jsonLdMatch[1]) {
      try {
        const jsonData = JSON.parse(jsonLdMatch[1])
        if (jsonData.author || jsonData.creator) {
          const rawCreator = jsonData.author?.name || jsonData.creator?.name || jsonData.author || jsonData.creator
          agentData.creator = decodeHtmlEntities(rawCreator)
          agentData.creatorUsername = agentData.creator.replace(/[^A-Za-z0-9._-]/g, '')
          console.log(`Extracted creator from JSON-LD: "${agentData.creator}"`)
        }
      } catch (e) {
        console.log(`Failed to parse JSON-LD for creator: ${e}`)
      }
    }
    
    // If we still don't have a description, create one based on the name
    if (!agentData.description) {
      agentData.description = `GPT Agent specialized in ${agentData.name.toLowerCase()}`
    }
    
    // If we still don't have a creator, use a fallback
    if (!agentData.creator) {
      agentData.creator = 'Unknown Creator'
      agentData.creatorUsername = 'unknown'
      console.log(`No creator found, using fallback: "${agentData.creator}"`)
    }
    
    console.log(`Successfully scraped GPT agent data:`, agentData)
    return agentData
    
  } catch (error) {
    console.error(`Error scraping GPT agent data: ${error}`)
    return null
  }
}

// Helper function to create GPT agent from URL
async function createGPTAgentFromUrl(
  gptAgentUrl: string, 
  slackData: SlackIntakeData, 
  intakeRequestId: string | null,
  title: string,
  scrapedData: GPTAgentData | null = null
): Promise<string> {
  console.log(`Creating GPT agent from URL: ${gptAgentUrl}`)
  console.log(`Scraped data available: ${scrapedData ? 'Yes' : 'No'}`)
  if (scrapedData) {
    console.log(`Scraped data: ${JSON.stringify(scrapedData, null, 2)}`)
  }
  
  // Extract agent ID from URL
  const agentIdMatch = gptAgentUrl.match(/\/g\/(g-[a-zA-Z0-9-]+)/)
  if (!agentIdMatch) {
    throw new Error('Invalid GPT agent URL format')
  }
  
  const agentId = agentIdMatch[1]
  console.log(`Extracted agent ID: ${agentId}`)
  
  // Generate agent name and description from scraped data or intake data
  const agentName = scrapedData ? scrapedData.name : `${title} - GPT Agent`
  const actualCreator = scrapedData?.creator || 'Unknown Creator'
  const agentDescription = scrapedData 
    ? `${scrapedData.description}\n\nCreated by: ${actualCreator}\nSubmitted via Slack by: ${slackData.submitter_username}\nOriginal URL: ${gptAgentUrl}`
    : `GPT Agent for: ${slackData.jtbd || title}\n\nCreated by: ${actualCreator}\nSubmitted via Slack by: ${slackData.submitter_username}\nOriginal URL: ${gptAgentUrl}`
  
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
  
  // Try to find the actual submitter by email, or use null if none exists
  let userId: string | null = null
  try {
    // First try to find user by exact email match
    const submitterEmail = `${slackData.submitter_username}@workleap.com`
    const { data: exactUser, error: exactError } = await supabase
      .from('app_user')
      .select('id, email')
      .eq('email', submitterEmail)
      .maybeSingle()

    if (exactUser && !exactError) {
      userId = exactUser.id
      console.log(`Found exact user match: ${exactUser.email} (${userId})`)
    } else {
      // Try to find by username match (juliana.reyes matches juliana.reyes@workleap.com)
      const { data: usernameUser, error: usernameError } = await supabase
        .from('app_user')
        .select('id, email')
        .ilike('email', `${slackData.submitter_username}@%`)
        .maybeSingle()

      if (usernameUser && !usernameError) {
        userId = usernameUser.id
        console.log(`Found username match: ${usernameUser.email} (${userId})`)
      } else {
        console.log(`No user found for submitter: ${slackData.submitter_username}, setting created_by to null`)
      }
    }
  } catch (error) {
    console.log(`Error finding user, setting created_by to null:`, error)
  }
  
  // Create GPT agent entry
  const gptAgentData = {
    name: agentName,
    description: agentDescription,
    iframe_url: gptAgentUrl,
    category: agentCategory,
    status: 'active',
    created_by: userId, // This will be null if no user found
    configuration: {
      source: intakeRequestId ? 'slack_intake' : 'slack_gpt_only',
      intake_request_id: intakeRequestId,
      original_url: gptAgentUrl,
      agent_id: agentId,
        created_by_user: slackData.submitter_username,
        created_by_slack_id: slackData.submitter_id,
        team_id: slackData.team_id,
        actual_creator: actualCreator,
        actual_creator_username: scrapedData?.creatorUsername || 'unknown',
        scraped_data: scrapedData ? {
          name: scrapedData.name,
          description: scrapedData.description,
          instructions: scrapedData.instructions,
          capabilities: scrapedData.capabilities,
          conversation_starters: scrapedData.conversationStarters,
          creator: scrapedData.creator,
          creator_username: scrapedData.creatorUsername
        } : null
    },
    permissions: {
      canRead: true,
      canWrite: false,
      canExecute: true
    }
  }
  
  console.log(`Creating GPT agent with data: ${JSON.stringify(gptAgentData, null, 2)}`)
  
  const { data: gptAgent, error: gptAgentError } = await supabase
    .from('gpt_agent')
    .insert(gptAgentData)
    .select()
    .single()

  if (gptAgentError) {
    console.error('Error creating GPT agent:', gptAgentError)
    throw new Error(`Failed to create GPT agent: ${gptAgentError.message}`)
  }

  console.log(`Successfully created GPT agent: ${gptAgent.id}`)
  return gptAgent.id
}
