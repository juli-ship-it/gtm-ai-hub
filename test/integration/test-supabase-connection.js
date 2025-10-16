// Test Supabase connection with the same configuration as the API route
const { createClient } = require('@supabase/supabase-js')
const https = require('https')
require('dotenv').config({ path: '.env.local' })

// Fix TLS certificate issue
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

async function testSupabaseConnection() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.log('❌ Missing environment variables')
    return
  }

  console.log('🔗 Testing Supabase connection...')
  console.log('Supabase URL:', supabaseUrl)

  // Create Supabase client with the same configuration as the API route
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    global: {
      fetch: (url, options = {}) => {
        // In development, bypass TLS certificate verification
        if (process.env.NODE_ENV === 'development') {
          const agent = new https.Agent({
            rejectUnauthorized: false
          })
          return fetch(url, {
            ...options,
            agent
          })
        }
        return fetch(url, options)
      }
    }
  })

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
      console.log('Response type:', typeof data)
      console.log('Response keys:', Object.keys(data))
    }
  } catch (err) {
    console.log('❌ Exception:', err.message)
    console.log('Error details:', err)
  }
}

testSupabaseConnection()