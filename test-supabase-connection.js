// Test Supabase connection and Edge Function
const { createClient } = require('@supabase/supabase-js')

async function testSupabaseConnection() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    return
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // Test basic connection
  try {
    const { data, error } = await supabase.from('template').select('count').limit(1)

    if (error) {
      // Connection error
    }
  } catch (err) {
    // Connection failed
  }

  // Test Edge Function
  try {
    const { data, error } = await supabase.functions.invoke('analyze-workflow', {
      body: {
        prompt: 'Test prompt',
        workflow: { name: 'Test', nodes: [] }
      }
    })

    if (error) {
      // Edge Function error
    }

  } catch (err) {
    // Edge Function test failed
  }
}

testSupabaseConnection()
