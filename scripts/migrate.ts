#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  console.error('')
  console.error('Create a .env.local file with:')
  console.error('NEXT_PUBLIC_SUPABASE_URL=your_supabase_url')
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key')
  console.error('SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
  try {
    console.log('🚀 Starting database migration...')
    console.log('')
    console.log('⚠️  Note: This script will create the database tables.')
    console.log('   Make sure you have a Supabase project set up first.')
    console.log('   You can run the SQL files manually in the Supabase SQL editor if needed.')
    console.log('')
    
    // Read migration files
    const migration1 = readFileSync(join(process.cwd(), 'supabase/migrations/001_initial_schema.sql'), 'utf8')
    const migration2 = readFileSync(join(process.cwd(), 'supabase/migrations/002_rls_policies.sql'), 'utf8')
    
    console.log('📄 Migration files found:')
    console.log('   - 001_initial_schema.sql')
    console.log('   - 002_rls_policies.sql')
    console.log('')
    
    console.log('📋 To complete the migration:')
    console.log('1. Go to your Supabase project dashboard')
    console.log('2. Navigate to the SQL Editor')
    console.log('3. Copy and paste the contents of supabase/migrations/001_initial_schema.sql')
    console.log('4. Run the SQL to create the tables')
    console.log('5. Copy and paste the contents of supabase/migrations/002_rls_policies.sql')
    console.log('6. Run the SQL to apply RLS policies')
    console.log('')
    
    console.log('📊 Tables that will be created:')
    console.log('   - app_user (user management with roles)')
    console.log('   - template (AI automation templates)')
    console.log('   - template_run (execution history and monitoring)')
    console.log('   - intake_request (automation requests from Slack/Jira)')
    console.log('   - prompt (versioned AI prompts for governance)')
    console.log('   - playbook (multi-step automation workflows)')
    console.log('   - intake_comment (collaboration on requests)')
    console.log('')
    
    console.log('🔒 Row Level Security policies will be applied for:')
    console.log('   - Role-based access control (admin/editor/runner)')
    console.log('   - Users can only see their own data where appropriate')
    console.log('   - Admins have full access to all resources')
    console.log('')
    
    console.log('✅ Migration instructions provided!')
    console.log('   After running the SQL in Supabase, you can run: npm run db:seed')
    
  } catch (error) {
    console.error('❌ Error reading migration files:', error)
    process.exit(1)
  }
}

// Check if we can connect to Supabase first
async function checkConnection() {
  try {
    console.log('🔍 Testing Supabase connection...')
    const { data, error } = await supabase.from('pg_tables').select('*').limit(1)
    if (error) {
      console.error('❌ Cannot connect to Supabase:', error.message)
      console.error('Please check your Supabase URL and service role key')
      process.exit(1)
    }
    console.log('✅ Connected to Supabase successfully')
  } catch (error) {
    console.error('❌ Connection test failed:', error)
    console.error('Please check your Supabase credentials')
    process.exit(1)
  }
}

async function main() {
  await checkConnection()
  await runMigration()
}

main()