// Test Edge Function directly
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Fix TLS certificate issue
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

async function testEdgeFunction() {
  // You'll need to set these environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qvfvylflnfxrhyzwlhpm.supabase.co'
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseServiceKey) {
    console.log('❌ SUPABASE_SERVICE_ROLE_KEY not set')
    console.log('Please set the environment variable:')
    console.log('export SUPABASE_SERVICE_ROLE_KEY=your_service_role_key')
    return
  }

  console.log('🔗 Testing Edge Function connection...')
  console.log('Supabase URL:', supabaseUrl)

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // Test with a simple workflow
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

  const testPrompt = "Analyze this simple workflow and extract variables."

  try {
    console.log('📤 Calling Edge Function...')
    const { data, error } = await supabase.functions.invoke('analyze-workflow', {
      body: {
        prompt: testPrompt,
        workflow: testWorkflow
      }
    })

    if (error) {
      console.log('❌ Edge Function error:', error)
      if (error.context && error.context.body) {
        try {
          const errorText = await error.context.text()
          console.log('Error response body:', errorText)
        } catch (e) {
          console.log('Could not read error response body')
        }
      }
    } else {
      console.log('✅ Edge Function success:', data)
    }
  } catch (err) {
    console.log('❌ Exception:', err.message)
  }
}

testEdgeFunction()
