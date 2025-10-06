// Test script to verify GPT agent creation
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

console.log('Testing GPT agent creation with data:')
console.log(JSON.stringify(testData, null, 2))

// Test the regex
const links = testData.links
const gptAgentRegex = /https:\/\/chatgpt\.com\/g\/g-[a-zA-Z0-9-]+/g
const matches = links.match(gptAgentRegex)

console.log('\nRegex test:')
console.log('Links:', links)
console.log('Matches:', matches)
console.log('Should find GPT agent URL:', matches && matches.length > 0)
