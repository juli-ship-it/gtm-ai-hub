// Test GPT agent query directly
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://qvfvylflnfxrhyzwlhpm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2ZnZ5bGZsbWZ4cnJoeXp3bGhwbSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzM1OTQ0NDQwLCJleHAiOjIwNTE1MjA0NDB9.8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testGPTAgentQuery() {
  try {
    console.log('🔍 Testing GPT agent query...')
    
    const { data, error } = await supabase
      .from('gpt_agent')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
    } else {
      console.log('✅ Success!')
      console.log(`📊 Found ${data?.length || 0} agents`)
      console.log('Agents:', data?.map(a => ({ id: a.id, name: a.name, created_at: a.created_at })))
    }
  } catch (error) {
    console.error('❌ Exception:', error)
  }
}

testGPTAgentQuery()
