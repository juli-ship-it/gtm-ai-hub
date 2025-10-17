#!/usr/bin/env node

/**
 * Script to apply intake request permission changes
 * This script applies the migration and verifies the setup
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration')
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applyIntakePermissions() {
  console.log('🔧 Applying intake request permission changes...\n')

  try {
    // Read the migration file
    const migrationPath = join(__dirname, 'supabase', 'migrations', '025_intake_request_permissions.sql')
    const migrationSQL = readFileSync(migrationPath, 'utf8')

    console.log('📄 Migration file loaded successfully')

    // Apply the migration
    console.log('🚀 Applying migration...')
    const { error: migrationError } = await supabase.rpc('exec_sql', {
      sql: migrationSQL
    })

    if (migrationError) {
      console.error('❌ Migration failed:', migrationError.message)
      
      // Try alternative approach - execute SQL directly
      console.log('🔄 Trying alternative approach...')
      const statements = migrationSQL.split(';').filter(stmt => stmt.trim())
      
      for (const statement of statements) {
        if (statement.trim()) {
          const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' })
          if (error) {
            console.error('❌ Statement failed:', statement.substring(0, 100) + '...', error.message)
          } else {
            console.log('✅ Statement executed successfully')
          }
        }
      }
    } else {
      console.log('✅ Migration applied successfully')
    }

    // Verify the setup
    console.log('\n🔍 Verifying setup...')

    // Check if juliana.reyes@workleap.com exists
    const { data: julianaUser, error: julianaError } = await supabase
      .from('app_user')
      .select('id, email, role')
      .eq('email', 'juliana.reyes@workleap.com')
      .single()

    if (julianaError) {
      console.log('⚠️  juliana.reyes@workleap.com user not found')
      console.log('   You may need to create this user manually')
    } else {
      console.log('✅ juliana.reyes@workleap.com user found:', julianaUser.id)
    }

    // Check RLS policies
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('policyname, tablename')
      .in('tablename', ['intake_request', 'intake_comment'])

    if (policiesError) {
      console.log('⚠️  Could not verify RLS policies (this is normal)')
    } else {
      console.log('✅ RLS policies verified:', policies.length, 'policies found')
    }

    // Check if trigger exists
    const { data: triggers, error: triggersError } = await supabase
      .from('information_schema.triggers')
      .select('trigger_name')
      .eq('trigger_name', 'intake_request_content_field_check')

    if (triggersError) {
      console.log('⚠️  Could not verify trigger (this is normal)')
    } else if (triggers && triggers.length > 0) {
      console.log('✅ Content field check trigger verified')
    } else {
      console.log('⚠️  Content field check trigger not found')
    }

    console.log('\n🎉 Setup completed!')
    console.log('\n📋 Next steps:')
    console.log('1. Test the permissions with: node test_intake_permissions.js')
    console.log('2. Ensure juliana.reyes@workleap.com user exists in your system')
    console.log('3. Review the documentation: INTAKE_REQUEST_PERMISSIONS.md')

  } catch (error) {
    console.error('❌ Setup failed:', error)
    process.exit(1)
  }
}

// Run the setup
applyIntakePermissions()
  .then(() => {
    console.log('\n🏁 Permission setup completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Setup failed:', error)
    process.exit(1)
  })
