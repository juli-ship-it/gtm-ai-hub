// Test the Slack intake function to see if it's working correctly
// This simulates what happens when you submit a GPT agent via Slack

async function testSlackIntakeFunction() {
  console.log('🧪 Testing Slack Intake Function...')
  
  try {
    // Simulate the Slack data that would be sent
    const slackData = {
      submitter_username: 'juliana.reyes',
      submitter_id: 'U1234567890',
      team_id: 'T03TLTNDW',
      gpt_agent_url: 'https://chatgpt.com/g/g-test-agent',
      jtbd: 'Test Agent',
      category: 'content'
    }
    
    console.log('📤 Sending test data:', slackData)
    
    // Call the Slack intake function
    const response = await fetch('/api/slack-intake', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(slackData),
    })
    
    console.log('📥 Response status:', response.status)
    
    if (response.ok) {
      const result = await response.json()
      console.log('✅ Slack intake successful:', result)
      
      // Check if the agent was created with correct ownership
      if (result.gpt_agent_id) {
        console.log('🔍 Checking created agent...')
        
        // Get the created agent
        const agentResponse = await fetch(`/api/gpt-agents/${result.gpt_agent_id}`)
        if (agentResponse.ok) {
          const agentData = await agentResponse.json()
          console.log('📋 Created agent data:', agentData)
          
          // Check ownership
          if (agentData.created_by) {
            console.log('✅ Agent has created_by field:', agentData.created_by)
          } else {
            console.log('❌ Agent missing created_by field')
          }
        }
      }
    } else {
      const errorData = await response.json()
      console.error('❌ Slack intake failed:', errorData)
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testSlackIntakeFunction()
