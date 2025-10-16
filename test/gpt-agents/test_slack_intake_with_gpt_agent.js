// Test the slack-intake function with GPT agent URL
const testData = {
  "title": "Test GPT Agent Request",
  "submitter_username": "juliana.reyes",
  "jtbd": "I need help with content creation using GPT agents",
  "category": "content",
  "links": "https://chatgpt.com/g/g-3TfXg9het-workleap-content-assistant",
  "current_process": "Manual content creation",
  "pain_points": "Time consuming",
  "frequency": "daily",
  "time_friendly": "2 hours",
  "systems": ["slack", "notion"],
  "sensitivity": "low",
  "urgency": "medium"
}

async function testSlackIntake() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/slack-intake`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify(testData)
    })

    const result = await response.json()
    console.log('Response status:', response.status)
    console.log('Response:', JSON.stringify(result, null, 2))
  } catch (error) {
    console.error('Error:', error)
  }
}

testSlackIntake()
