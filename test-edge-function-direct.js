// Test Supabase Edge Function directly
const { createClient } = require('@supabase/supabase-js')

// Fix TLS certificate issues in development
if (process.env.NODE_ENV === 'development') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
}

async function testEdgeFunction() {
  const supabaseUrl = 'https://qvfvylflnfxrhyzwlhpm.supabase.co'
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  
  console.log('Testing Supabase Edge Function...')
  
  const testPrompt = 'You are an expert n8n workflow analyst. Analyze this n8n workflow and extract ALL configurable business variables that users need to set up. Return ONLY a JSON object with this exact structure: {"workflowName": "string", "workflowDescription": "string", "businessLogic": "string", "detectedVariables": []}'
  const testWorkflow = { name: 'Test Workflow', nodes: [] }
  
  try {
    const { data, error } = await supabase.functions.invoke('analyze-workflow', {
      body: { 
        prompt: testPrompt,
        workflow: testWorkflow
      }
    })
    
    if (error) {
      console.error('❌ Edge Function error:', error)
      if (error.context && error.context.body) {
        try {
          const errorBody = await error.context.text()
          console.error('Error response body:', errorBody)
        } catch (e) {
          console.error('Could not read error body:', e)
        }
      }
    } else {
      console.log('✅ Edge Function success:', data)
    }
  } catch (err) {
    console.error('❌ Edge Function exception:', err)
  }
}

testEdgeFunction()
