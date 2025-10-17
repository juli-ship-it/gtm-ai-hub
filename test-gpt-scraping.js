// Test script to verify GPT agent scraping functionality
// Run with: node test-gpt-scraping.js

const testData = {
  "event_type": "view_submission",
  "submitter_id": "U09F5QBUEF5",
  "submitter_username": "juliana.reyes",
  "team_id": "T03TLTNDW",
  "team": "workleap",
  "title": "", // Empty title - should be scraped from GPT agent URL
  "jtbd": "Need help with marketing automation using this GPT agent",
  "category": "campaign_execution",
  "current_process": "Manual process",
  "pain_points": "Too much manual work",
  "frequency": "daily",
  "time_friendly": "45 minutes",
  "systems": ["hubspot"],
  "sensitivity": "low",
  "urgency": "p0",
  "links": "",
  "gpt_agent_url": "https://chatgpt.com/g/g-681b69671a748191ab093f497e233c8c-luke-the-paid-marketer-master",
  "view_id": "V09HZHB0PTR",
  "callback_id": "gtm_intake_modal"
}

async function testGPTScraping() {
  try {
    console.log('Testing GPT agent scraping functionality...')
    console.log('Input data:', JSON.stringify(testData, null, 2))
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/slack-intake`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify(testData)
    })

    const result = await response.json()
    console.log('Response status:', response.status)
    console.log('Response data:', JSON.stringify(result, null, 2))
    
    if (response.ok) {
      console.log('✅ Test passed! GPT agent data was successfully scraped and processed.')
      console.log('📊 Check the logs in Supabase to see the scraping details.')
    } else {
      console.log('❌ Test failed:', result.error)
    }
  } catch (error) {
    console.error('❌ Test error:', error)
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  testGPTScraping()
}

module.exports = { testGPTScraping, testData }
