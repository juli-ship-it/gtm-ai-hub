#!/usr/bin/env node

/**
 * Script to apply migration 004_update_intake_constraints.sql
 * This script updates the database constraints to match the new Slack modal values
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  console.error('\nPlease check your .env.local file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  try {
    console.log('🔄 Applying migration 004_update_intake_constraints.sql...');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, 'supabase', 'migrations', '004_update_intake_constraints.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Split the migration into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`\n🔧 Executing statement ${i + 1}/${statements.length}...`);
        console.log(`   ${statement.substring(0, 100)}${statement.length > 100 ? '...' : ''}`);
        
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          console.error(`❌ Error executing statement ${i + 1}:`, error.message);
          throw error;
        }
        
        console.log(`✅ Statement ${i + 1} executed successfully`);
      }
    }
    
    console.log('\n🎉 Migration 004 applied successfully!');
    console.log('\n📋 Summary of changes:');
    console.log('   • Updated category constraint to include all new namespaced categories');
    console.log('   • Updated frequency constraint: daily, weekly, monthly, adhoc');
    console.log('   • Updated sensitivity constraint: low, med, high');
    console.log('\n✅ Your Slack modal should now work without constraint violations!');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\n🔍 Troubleshooting:');
    console.error('   1. Check your database connection');
    console.error('   2. Ensure you have the correct permissions');
    console.error('   3. Verify the migration file exists');
    process.exit(1);
  }
}

// Check if we need to create the exec_sql function first
async function ensureExecSqlFunction() {
  const createFunctionSQL = `
    CREATE OR REPLACE FUNCTION exec_sql(sql text)
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      EXECUTE sql;
    END;
    $$;
  `;
  
  try {
    await supabase.rpc('exec_sql', { sql: 'SELECT 1' });
    console.log('✅ exec_sql function already exists');
  } catch (error) {
    console.log('🔧 Creating exec_sql function...');
    const { error: createError } = await supabase.rpc('exec_sql', { sql: createFunctionSQL });
    if (createError) {
      console.log('⚠️  Could not create exec_sql function, trying direct execution...');
      return false;
    }
    console.log('✅ exec_sql function created');
  }
  return true;
}

async function main() {
  console.log('🚀 Starting migration application...');
  
  // Try to use exec_sql function, fallback to direct execution
  const hasExecSql = await ensureExecSqlFunction();
  
  if (!hasExecSql) {
    console.log('⚠️  Using direct SQL execution (may require manual application)');
    console.log('\n📄 Please run the following SQL manually in your Supabase SQL editor:');
    console.log('─'.repeat(60));
    
    const migrationPath = path.join(__dirname, 'supabase', 'migrations', '004_update_intake_constraints.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    console.log(migrationSQL);
    console.log('─'.repeat(60));
    return;
  }
  
  await applyMigration();
}

main().catch(console.error);
