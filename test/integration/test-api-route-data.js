// Test with the same data that the API route sends
const { createClient } = require('@supabase/supabase-js')
const https = require('https')
require('dotenv').config({ path: '.env.local' })

// Fix TLS certificate issue
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

async function testAPIRouteData() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  console.log('Environment check:')
  console.log('Supabase URL:', supabaseUrl)
  console.log('Service Key exists:', !!supabaseServiceKey)

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    global: {
      fetch: (url, options = {}) => {
        const agent = new https.Agent({
          rejectUnauthorized: false
        })
        return fetch(url, {
          ...options,
          agent
        })
      }
    }
  })

  // Use the same data structure as the API route
  const workflow = {
    name: "Test",
    nodes: []
  }

  const analysisPrompt = `Analyze this n8n workflow and return ONLY a JSON object with this exact structure:

{
  "workflowName": "string",
  "workflowDescription": "string", 
  "businessLogic": "string",
  "detectedVariables": [],
  "systems": [],
  "complexity": "simple|intermediate|advanced",
  "estimatedDuration": 5,
  "hasFileUpload": false,
  "hasEmailNotification": false,
  "hasSlackNotification": false,
  "errorHandling": false,
  "webhookNodes": [],
  "aiInsights": []
}

Workflow: ${workflow.name}
Nodes: ${workflow.nodes.length}

Node Details:
${workflow.nodes.map(node => `
- ${node.name} (${node.type})
  Parameters: ${JSON.stringify(node.parameters, null, 2)}
`).join('\n')}

Connections:
${JSON.stringify(workflow.connections || {}, null, 2)}

Extract business-relevant variables that users need to configure. Use generic names like "Data Source A", "Output Destination B", etc. Do not extract API keys or credentials.`

  try {
    console.log('📤 Testing with API route data...')
    console.log('Prompt length:', analysisPrompt.length)
    
    const { data, error } = await supabase.functions.invoke('analyze-workflow', {
      body: {
        prompt: analysisPrompt,
        workflow: workflow
      }
    })

    if (error) {
      console.log('❌ Error:', error)
      if (error.context && error.context.body) {
        try {
          const errorText = await error.context.text()
          console.log('Error response body:', errorText)
        } catch (e) {
          console.log('Could not read error response body')
        }
      }
    } else {
      console.log('✅ Success:', JSON.stringify(data, null, 2))
    }
  } catch (err) {
    console.log('❌ Exception:', err.message)
    console.log('Error details:', err)
  }
}

testAPIRouteData()
