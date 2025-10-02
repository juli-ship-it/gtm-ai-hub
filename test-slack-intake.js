// Test script for Slack intake edge function
// Run with: node test-slack-intake.js

const testData = {
  "event_type": "view_submission",
  "submitter_id": "U09F5QBUEF5",
  "submitter_username": "juliana.reyes",
  "team_id": "T03TLTNDW",
  "team": "workleap",
  "title": "testing",
  "jtbd": "test",
  "category": "campaign_execution",
  "current_process": "test",
  "pain_points": "test",
  "frequency": "daily",
  "time_friendly": "45 minutes",
  "systems": ["hubspot"],
  "sensitivity": "low",
  "urgency": "p0",
  "links": "test",
  "view_id": "V09HZHB0PTR",
  "callback_id": "gtm_intake_modal"
}

async function testSlackIntake() {
  try {
    const response = await fetch('http://localhost:54321/functions/v1/slack-intake', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify(testData)
    })

    const result = await response.json()
    console.log('Response status:', response.status)
    console.log('Response body:', JSON.stringify(result, null, 2))
  } catch (error) {
    console.error('Error testing Slack intake:', error)
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  testSlackIntake()
}

module.exports = { testSlackIntake, testData }
