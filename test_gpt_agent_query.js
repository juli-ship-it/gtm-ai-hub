// Test GPT agent query directly
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

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
