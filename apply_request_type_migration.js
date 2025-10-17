// Script to apply the request_type column migration
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function applyRequestTypeMigration() {
  try {
    console.log('Adding request_type column to intake_request table...')
    
    // Add request_type column
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE intake_request 
        ADD COLUMN IF NOT EXISTS request_type text check (request_type in ('real', 'showcase')) default 'real';
      `
    })
    
    if (alterError) {
      console.error('Error adding column:', alterError)
      return
    }
    
    // Add index
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_intake_request_type ON intake_request(request_type);
      `
    })
    
    if (indexError) {
      console.error('Error adding index:', indexError)
      return
    }
    
    // Add comment
    const { error: commentError } = await supabase.rpc('exec_sql', {
      sql: `
        COMMENT ON COLUMN intake_request.request_type IS 'Type of request: real (actual automation request) or showcase (example/demo)';
      `
    })
    
    if (commentError) {
      console.error('Error adding comment:', commentError)
      return
    }
    
    console.log('✅ Successfully added request_type column to intake_request table')
    
  } catch (error) {
    console.error('Error applying migration:', error)
  }
}

applyRequestTypeMigration()
