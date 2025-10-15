// Test with a very simple prompt
const { createClient } = require('@supabase/supabase-js')
const https = require('https')
require('dotenv').config({ path: '.env.local' })

// Fix TLS certificate issue
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

async function testSimplePrompt() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

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

  const testWorkflow = {
    name: "Test Workflow",
    nodes: [
      {
        name: "Start",
        type: "n8n-nodes-base.start",
        parameters: {}
      }
    ],
    connections: {}
  }

  const simplePrompt = `Analyze this n8n workflow and return ONLY a JSON object with this exact structure:

{
  "workflowName": "string",
  "workflowDescription": "string", 
  "businessLogic": "string",
  "detectedVariables": [],
  "systems": [],
  "complexity": "simple",
  "estimatedDuration": 5,
  "hasFileUpload": false,
  "hasEmailNotification": false,
  "hasSlackNotification": false,
  "errorHandling": false,
  "webhookNodes": [],
  "aiInsights": []
}

Workflow: ${testWorkflow.name}
Nodes: ${testWorkflow.nodes.length}

Node Details:
${testWorkflow.nodes.map(node => `
- ${node.name} (${node.type})
  Parameters: ${JSON.stringify(node.parameters, null, 2)}
`).join('\n')}

Connections:
${JSON.stringify(testWorkflow.connections, null, 2)}`

  try {
    console.log('📤 Testing with simple prompt...')
    const { data, error } = await supabase.functions.invoke('analyze-workflow', {
      body: {
        prompt: simplePrompt,
        workflow: testWorkflow
      }
    })

    if (error) {
      console.log('❌ Error:', error)
    } else {
      console.log('✅ Success:', JSON.stringify(data, null, 2))
    }
  } catch (err) {
    console.log('❌ Exception:', err.message)
  }
}

testSimplePrompt()
