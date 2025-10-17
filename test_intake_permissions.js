#!/usr/bin/env node

/**
 * Test script for intake request permissions
 * This script tests the new permission structure for intake requests
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testIntakePermissions() {
  console.log('🧪 Testing intake request permissions...\n')

  try {
    // 1. Test reading intake requests (should work for all authenticated users)
    console.log('1. Testing read permissions...')
    const { data: requests, error: readError } = await supabase
      .from('intake_request')
      .select('*')
      .limit(5)
    
    if (readError) {
      console.error('❌ Read test failed:', readError.message)
    } else {
      console.log(`✅ Read test passed - found ${requests.length} requests`)
    }

    // 2. Test creating an intake request
    console.log('\n2. Testing create permissions...')
    const testRequest = {
      requester: '00000000-0000-0000-0000-000000000000', // Dummy UUID
      problem_statement: 'Test problem statement',
      automation_idea: 'Test automation idea',
      title: 'Test Request',
      category: 'mkt_content_creation'
    }

    const { data: newRequest, error: createError } = await supabase
      .from('intake_request')
      .insert(testRequest)
      .select()
      .single()

    if (createError) {
      console.error('❌ Create test failed:', createError.message)
    } else {
      console.log('✅ Create test passed - request created with ID:', newRequest.id)
      
      // 3. Test updating content fields (should work for requester)
      console.log('\n3. Testing content field updates...')
      const { error: contentUpdateError } = await supabase
        .from('intake_request')
        .update({
          problem_statement: 'Updated problem statement',
          automation_idea: 'Updated automation idea'
        })
        .eq('id', newRequest.id)

      if (contentUpdateError) {
        console.error('❌ Content update test failed:', contentUpdateError.message)
      } else {
        console.log('✅ Content update test passed')
      }

      // 4. Test updating administrative fields (should fail for non-juliana users)
      console.log('\n4. Testing administrative field updates (should fail)...')
      const { error: adminUpdateError } = await supabase
        .from('intake_request')
        .update({
          status: 'triaged',
          priority: 'high'
        })
        .eq('id', newRequest.id)

      if (adminUpdateError) {
        console.log('✅ Administrative update correctly blocked:', adminUpdateError.message)
      } else {
        console.log('❌ Administrative update should have been blocked!')
      }

      // 5. Test comment creation (should work for anyone)
      console.log('\n5. Testing comment creation...')
      const { data: newComment, error: commentError } = await supabase
        .from('intake_comment')
        .insert({
          intake_request_id: newRequest.id,
          author_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID
          content: 'Test comment from permission test'
        })
        .select()
        .single()

      if (commentError) {
        console.error('❌ Comment creation test failed:', commentError.message)
      } else {
        console.log('✅ Comment creation test passed - comment created with ID:', newComment.id)
      }

      // Clean up test data
      console.log('\n6. Cleaning up test data...')
      await supabase.from('intake_comment').delete().eq('id', newComment.id)
      await supabase.from('intake_request').delete().eq('id', newRequest.id)
      console.log('✅ Test data cleaned up')
    }

    // 6. Test juliana.reyes@workleap.com permissions (if user exists)
    console.log('\n7. Testing juliana.reyes@workleap.com permissions...')
    const { data: julianaUser, error: julianaError } = await supabase
      .from('app_user')
      .select('id, email')
      .eq('email', 'juliana.reyes@workleap.com')
      .single()

    if (julianaError) {
      console.log('ℹ️  juliana.reyes@workleap.com user not found in database')
    } else {
      console.log('✅ juliana.reyes@workleap.com user found:', julianaUser.id)
      console.log('ℹ️  To test juliana\'s permissions, you would need to authenticate as that user')
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error)
  }
}

// Run the tests
testIntakePermissions()
  .then(() => {
    console.log('\n🏁 Permission tests completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Test suite failed:', error)
    process.exit(1)
  })
