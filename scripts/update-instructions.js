// Script to update execution instructions for all templates
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function updateExecutionInstructions() {
  console.log('🔄 Updating execution instructions for all templates...')
  
  try {
    // First, let's see what we have
    const { data: templates, error: fetchError } = await supabase
      .from('template')
      .select('id, name, execution_instructions')
    
    if (fetchError) throw fetchError
    
    console.log(`📊 Found ${templates.length} templates to update`)
    
    // Update each template
    for (const template of templates) {
      const newInstructions = `Step-by-Step Instructions:

1. Initial Setup
• Review the workflow requirements and variables
• Ensure you have access to all required systems
• Gather necessary credentials and API keys

2. Configuration
• Configure schedule settings (if applicable)
• Set up data source connections
• Configure data destination settings (Excel, Google Sheets, etc.)
• Set up notification preferences

3. Variable Configuration
• Fill in all required template variables
• Test connections to external systems
• Verify data mapping and transformations

4. Testing & Deployment
• Run the workflow in test mode
• Verify data output and format
• Set up monitoring and alerts
• Deploy to production environment

5. Maintenance
• Monitor workflow performance
• Update credentials as needed
• Review and optimize data processing
• Keep documentation up to date

${template.execution_instructions ? `\nOriginal Instructions:\n${template.execution_instructions}` : ''}`

      const { error: updateError } = await supabase
        .from('template')
        .update({ execution_instructions: newInstructions })
        .eq('id', template.id)
      
      if (updateError) {
        console.error(`❌ Failed to update template ${template.name}:`, updateError)
      } else {
        console.log(`✅ Updated template: ${template.name}`)
      }
    }
    
    console.log('🎉 All templates updated successfully!')
    
  } catch (error) {
    console.error('❌ Error updating templates:', error)
  }
}

updateExecutionInstructions()
