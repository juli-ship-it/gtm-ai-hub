// Quick fix for template variables - run this in the browser console or as a simple script
const { createClient } = require('@supabase/supabase-js')

// You'll need to replace these with your actual values
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key-here'

const supabase = createClient(supabaseUrl, supabaseKey)

async function quickFix() {

  try {
    // 1. Delete credential variables

    const { error: deleteError } = await supabase
      .from('template_variable')
      .delete()
      .or('name.ilike.%token%,name.ilike.%key%,name.ilike.%credential%,name.ilike.%password%,name.ilike.%secret%,name.ilike.%auth%')

    if (deleteError) {

    } else {

    }

    // 2. Update specific names to generic ones

    const updates = [
      { from: 'listIdDemoRequest', to: 'HubSpot List A' },
      { from: 'listIdSignup', to: 'HubSpot List B' },
      { from: 'excelWorkbookId', to: 'Excel Workbook' },
      { from: 'excelWorksheetDemos', to: 'Excel Sheet A' },
      { from: 'excelWorksheetSignups', to: 'Excel Sheet B' }
    ]

    for (const update of updates) {
      const { error } = await supabase
        .from('template_variable')
        .update({ name: update.to })
        .eq('name', update.from)

      if (error) {

      } else {

      }
    }

    // 3. Show final result

    const { data: variables } = await supabase
      .from('template_variable')
      .select('name, type, description')
      .order('name')

    if (variables) {
      variables.forEach(v => {: ${v.description}`)
      })
    }

  } catch (error) {

  }
}

// Uncomment the line below to run the fix
// quickFix()
