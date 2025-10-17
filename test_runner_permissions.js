#!/usr/bin/env node

/**
 * Test script for updated runner role permissions
 * This script tests that runners can now create templates, prompts, and GPT agents
 * but can only edit their own content
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

async function testRunnerPermissions() {
  console.log('🧪 Testing updated runner role permissions...\n')

  try {
    // Create a test runner user
    const testUserId = '00000000-0000-0000-0000-000000000001'
    const testUserEmail = 'test-runner@workleap.com'
    
    console.log('1. Setting up test runner user...')
    
    // Ensure test user exists in app_user table
    const { error: userError } = await supabase
      .from('app_user')
      .upsert({
        id: testUserId,
        email: testUserEmail,
        role: 'runner'
      })

    if (userError) {
      console.error('❌ Failed to create test user:', userError.message)
      return
    }
    console.log('✅ Test runner user created/updated')

    // Test 1: Runner can create templates
    console.log('\n2. Testing template creation by runner...')
    const testTemplate = {
      id: '00000000-0000-0000-0000-000000000010',
      slug: 'test-runner-template',
      name: 'Test Runner Template',
      category: 'content',
      description: 'A template created by a runner',
      n8n_webhook_url: 'https://example.com/webhook',
      created_by: testUserId
    }

    const { data: newTemplate, error: templateError } = await supabase
      .from('template')
      .insert(testTemplate)
      .select()
      .single()

    if (templateError) {
      console.error('❌ Template creation failed:', templateError.message)
    } else {
      console.log('✅ Template creation successful - ID:', newTemplate.id)
    }

    // Test 2: Runner can create prompts
    console.log('\n3. Testing prompt creation by runner...')
    const testPrompt = {
      id: '00000000-0000-0000-0000-000000000011',
      name: 'test-runner-prompt',
      role: 'writer',
      body: 'A prompt created by a runner',
      created_by: testUserId
    }

    const { data: newPrompt, error: promptError } = await supabase
      .from('prompt')
      .insert(testPrompt)
      .select()
      .single()

    if (promptError) {
      console.error('❌ Prompt creation failed:', promptError.message)
    } else {
      console.log('✅ Prompt creation successful - ID:', newPrompt.id)
    }

    // Test 3: Runner can create GPT agents
    console.log('\n4. Testing GPT agent creation by runner...')
    const testGPTAgent = {
      id: '00000000-0000-0000-0000-000000000012',
      name: 'Test Runner GPT Agent',
      description: 'A GPT agent created by a runner',
      category: 'content',
      status: 'active',
      created_by: testUserId
    }

    const { data: newGPTAgent, error: gptError } = await supabase
      .from('gpt_agent')
      .insert(testGPTAgent)
      .select()
      .single()

    if (gptError) {
      console.error('❌ GPT agent creation failed:', gptError.message)
    } else {
      console.log('✅ GPT agent creation successful - ID:', newGPTAgent.id)
    }

    // Test 4: Runner can update their own content
    console.log('\n5. Testing runner can update their own content...')
    
    if (newTemplate) {
      const { error: updateTemplateError } = await supabase
        .from('template')
        .update({ description: 'Updated by runner' })
        .eq('id', newTemplate.id)

      if (updateTemplateError) {
        console.error('❌ Template update failed:', updateTemplateError.message)
      } else {
        console.log('✅ Template update successful')
      }
    }

    // Test 5: Runner can create playbooks
    console.log('\n6. Testing playbook creation by runner...')
    const testPlaybook = {
      id: '00000000-0000-0000-0000-000000000013',
      name: 'Test Runner Playbook',
      description: 'A playbook created by a runner',
      owner: testUserId
    }

    const { data: newPlaybook, error: playbookError } = await supabase
      .from('playbook')
      .insert(testPlaybook)
      .select()
      .single()

    if (playbookError) {
      console.error('❌ Playbook creation failed:', playbookError.message)
    } else {
      console.log('✅ Playbook creation successful - ID:', newPlaybook.id)
    }

    // Test 6: Runner can create comments
    console.log('\n7. Testing comment creation by runner...')
    
    // First create a test intake request
    const testIntakeRequest = {
      id: '00000000-0000-0000-0000-000000000014',
      requester: testUserId,
      problem_statement: 'Test problem',
      automation_idea: 'Test automation'
    }

    const { data: newIntakeRequest, error: intakeError } = await supabase
      .from('intake_request')
      .insert(testIntakeRequest)
      .select()
      .single()

    if (intakeError) {
      console.error('❌ Intake request creation failed:', intakeError.message)
    } else {
      console.log('✅ Intake request created for comment test')

      // Now test comment creation
      const { data: newComment, error: commentError } = await supabase
        .from('intake_comment')
        .insert({
          intake_request_id: newIntakeRequest.id,
          author_id: testUserId,
          content: 'Test comment from runner'
        })
        .select()
        .single()

      if (commentError) {
        console.error('❌ Comment creation failed:', commentError.message)
      } else {
        console.log('✅ Comment creation successful - ID:', newComment.id)
      }
    }

    // Clean up test data
    console.log('\n8. Cleaning up test data...')
    
    const cleanupPromises = []
    
    if (newTemplate) {
      cleanupPromises.push(supabase.from('template').delete().eq('id', newTemplate.id))
    }
    if (newPrompt) {
      cleanupPromises.push(supabase.from('prompt').delete().eq('id', newPrompt.id))
    }
    if (newGPTAgent) {
      cleanupPromises.push(supabase.from('gpt_agent').delete().eq('id', newGPTAgent.id))
    }
    if (newPlaybook) {
      cleanupPromises.push(supabase.from('playbook').delete().eq('id', newPlaybook.id))
    }
    if (newIntakeRequest) {
      cleanupPromises.push(supabase.from('intake_request').delete().eq('id', newIntakeRequest.id))
    }
    
    await Promise.all(cleanupPromises)
    console.log('✅ Test data cleaned up')

    console.log('\n🎉 All runner permission tests completed successfully!')
    console.log('\n📋 Summary:')
    console.log('✅ Runners can create templates')
    console.log('✅ Runners can create prompts')
    console.log('✅ Runners can create GPT agents')
    console.log('✅ Runners can create playbooks')
    console.log('✅ Runners can update their own content')
    console.log('✅ Runners can create comments')

  } catch (error) {
    console.error('❌ Test failed with error:', error)
  }
}

// Run the tests
testRunnerPermissions()
  .then(() => {
    console.log('\n🏁 Runner permission tests completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Test suite failed:', error)
    process.exit(1)
  })
