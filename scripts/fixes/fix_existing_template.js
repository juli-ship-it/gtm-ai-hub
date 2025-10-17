// Fix existing template by removing credential variables and re-analyzing with new security rules
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {

  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixExistingTemplate() {

  try {
    // 1. Find the HubSpot template
    const { data: templates, error: templatesError } = await supabase
      .from('template')
      .select('*')
      .ilike('name', '%hubspot%')
      .limit(1)

    if (templatesError) {

      return
    }

    if (templates.length === 0) {

      return
    }

    const template = templates[0]

    // 2. Get current variables
    const { data: variables, error: variablesError } = await supabase
      .from('template_variable')
      .select('*')
      .eq('template_id', template.id)

    if (variablesError) {

      return
    })

    // 3. Delete ALL existing variables (we'll re-analyze)

    const { error: deleteError } = await supabase
      .from('template_variable')
      .delete()
      .eq('template_id', template.id)

    if (deleteError) {

      return
    }

    // 4. Re-analyze the workflow with new security rules

    const workflowJson = JSON.parse(template.n8n_workflow_json)

    // Call the AI analysis API
    const response = await fetch('http://localhost:3000/api/analyze-workflow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workflowJson: workflowJson,
        prompt: 'Analyze this n8n workflow and extract business-relevant variables. Use generic names like "HubSpot List A", "HubSpot List B", "Excel Sheet A", etc. DO NOT extract credentials, tokens, or API keys.'
      })
    })

    if (!response.ok) {

      return
    }

    const analysis = await response.json()

    // 5. Save new variables
    if (analysis.variables && analysis.variables.length > 0) {

      const variablesToInsert = analysis.variables.map((variable, index) => ({
        template_id: template.id,
        name: variable.name,
        type: variable.type,
        required: variable.required || false,
        description: variable.description,
        default_value: variable.default_value,
        validation_rules: variable.validation_rules,
        order_index: index,
        n8n_enum: variable.n8n_enum,
        excel_config: variable.excel_config,
        category: variable.category,
        business_context: variable.business_context,
        ai_reasoning: variable.ai_reasoning,
        validation: variable.validation
      }))

      const { error: insertError } = await supabase
        .from('template_variable')
        .insert(variablesToInsert)

      if (insertError) {

        return
      })
    }

    // 6. Update template with new analysis

    const { error: updateError } = await supabase
      .from('template')
      .update({
        workflow_analysis: analysis,
        last_modified_at: new Date().toISOString()
      })
      .eq('id', template.id)

    if (updateError) {

      return
    }

  } catch (error) {

  }
}

fixExistingTemplate()
