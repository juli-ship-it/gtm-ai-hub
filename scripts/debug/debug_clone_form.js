// Debug script to check template variables in clone form
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {

  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugCloneForm() {

  try {
    // Get a template with variables
    const { data: templates, error } = await supabase
      .from('template')
      .select(`
        id,
        name,
        template_variables:template_variable(
          id,
          name,
          type,
          required,
          description,
          default_value,
          category,
          n8n_enum,
          excel_config
        )
      `)
      .limit(1)

    if (error) {

      return
    }

    if (templates.length === 0) {

      return
    }

    const template = templates[0]

    if (template.template_variables && template.template_variables.length > 0) {

      template.template_variables.forEach((variable, index) => {}`)}`)

      })
    } else {

    }

  } catch (error) {

  }
}

debugCloneForm()
