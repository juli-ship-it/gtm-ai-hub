import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { Database } from '@/types/database'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    // 1. Delete credential variables
    console.log('🗑️ Removing credential variables...')
    const { error: deleteError } = await supabase
      .from('template_variable')
      .delete()
      .or('name.ilike.%token%,name.ilike.%key%,name.ilike.%credential%,name.ilike.%password%,name.ilike.%secret%,name.ilike.%auth%')

    if (deleteError) {
      console.error('❌ Error deleting credentials:', deleteError)
      return NextResponse.json({ error: 'Failed to delete credential variables' }, { status: 500 })
    }

    console.log('✅ Credential variables removed')

    // 2. Update specific names to generic ones
    console.log('🔄 Updating variable names to generic...')

    const updates = [
      { from: 'listIdDemoRequest', to: 'HubSpot List A' },
      { from: 'listIdSignup', to: 'HubSpot List B' },
      { from: 'excelWorkbookId', to: 'Excel Workbook' },
      { from: 'excelWorksheetDemos', to: 'Excel Sheet A' },
      { from: 'excelWorksheetSignups', to: 'Excel Sheet B' }
    ]

    for (const update of updates) {
      const { error } = await (supabase as any)
        .from('template_variable')
        .update({ name: update.to })
        .eq('name', update.from)

      if (error) {
        console.log(`⚠️ Could not update ${update.from}:`, error.message)
      } else {
        console.log(`✅ Updated ${update.from} → ${update.to}`)
      }
    }

    // 3. Update descriptions to be generic
    const descriptionUpdates = [
      { name: 'HubSpot List A', description: 'The ID of the first HubSpot list to extract contacts from' },
      { name: 'HubSpot List B', description: 'The ID of the second HubSpot list to extract contacts from' },
      { name: 'Excel Workbook', description: 'The ID of the Excel workbook to append data to' },
      { name: 'Excel Sheet A', description: 'The name of the first worksheet in the Excel workbook' },
      { name: 'Excel Sheet B', description: 'The name of the second worksheet in the Excel workbook' }
    ]

    for (const update of descriptionUpdates) {
      await (supabase as any)
        .from('template_variable')
        .update({ description: update.description })
        .eq('name', update.name)
    }

    // 4. Get final result
    const { data: variables } = await supabase
      .from('template_variable')
      .select('name, type, description')
      .order('name')

    return NextResponse.json({
      success: true,
      message: 'Template variables fixed successfully!',
      variables: variables || []
    })

  } catch (error) {
    console.error('❌ Fix failed:', error)
    return NextResponse.json({ error: 'Failed to fix template variables' }, { status: 500 })
  }
}
