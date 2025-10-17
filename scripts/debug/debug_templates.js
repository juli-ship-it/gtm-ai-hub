// Debug script to check why templates aren't showing
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {

  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugTemplates() {

  try {
    // Check 1: Basic template count

    const { data: allTemplates, error: allError } = await supabase
      .from('template')
      .select('id, name, enabled, created_at')
      .order('created_at', { ascending: false })

    if (allError) {

    } else {

      allTemplates.forEach(t => {

      })
    }

    // Check 2: Enabled templates only

    const { data: enabledTemplates, error: enabledError } = await supabase
      .from('template')
      .select('id, name, enabled')
      .eq('enabled', true)

    if (enabledError) {

    } else {

    }

    // Check 3: Test the full query (without the new columns first)

    const { data: basicTemplates, error: basicError } = await supabase
      .from('template')
      .select(`
        id,
        name,
        enabled,
        created_at,
        template_variables:template_variable(
          id,
          name,
          type
        )
      `)
      .eq('enabled', true)

    if (basicError) {

    } else {

    }

    // Check 4: Test with new columns

    const { data: fullTemplates, error: fullError } = await supabase
      .from('template')
      .select(`
        id,
        name,
        enabled,
        template_variables:template_variable(
          id,
          name,
          type,
          n8n_enum,
          excel_config,
          category
        )
      `)
      .eq('enabled', true)

    if (fullError) {:', fullError)

    } else {

    }

    // Check 5: Check if template_variable table has the new columns

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

      const hasNewColumns = columns.some(col =>
        ['n8n_enum', 'excel_config', 'category'].includes(col.column_name)
      )

      if (!hasNewColumns) {

      } else {

      }
    }

    // Check 6: Authentication

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError) {

    } else if (user) {

    } else {')
    }

  } catch (error) {

  }
}

debugTemplates()
