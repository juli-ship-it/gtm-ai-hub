// Debug script to check template variables and their fields
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {

  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugTemplateVariables() {

  try {
    // First, let's check what columns exist in template_variable table

    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'template_variable')
      .eq('table_schema', 'public')
      .order('column_name')

    if (columnsError) {

    } else {

      columns.forEach(col => {

      })
    }

    // Now let's check if we have any template variables

    const { data: variables, error: variablesError } = await supabase
      .from('template_variable')
      .select('*')
      .limit(3)

    if (variablesError) {

    } else {

      if (variables.length > 0) {)
      }
    }

    // Check if we have templates with variables

    const { data: templates, error: templatesError } = await supabase
      .from('template')
      .select(`
        id,
        name,
        template_variables:template_variable(
          id,
          name,
          type,
          n8n_enum,
          excel_config,
          category
        )
      `)
      .limit(1)

    if (templatesError) {

    } else {

      if (templates.length > 0) {)
      }
    }

  } catch (error) {

  }
}

debugTemplateVariables()
