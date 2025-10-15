// Test the regex pattern for extracting JSON from markdown
const testResponse = `\`\`\`json
{
  "workflowName": "Test Workflow",
  "workflowDescription": "A basic workflow that serves as a starting point for further development.",
  "businessLogic": "This workflow currently does not perform any specific business logic as it only contains a start node.",
  "detectedVariables": [],
  "systems": [],
  "complexity": "simple",
  "estimatedDuration": 0,
  "hasFileUpload": false,
  "hasEmailNotification": false,
  "hasSlackNotification": false,
  "errorHandling": false,
  "webhookNodes": [],
  "aiInsights": []
}
\`\`\``

console.log('Testing regex patterns...')
console.log('Response includes ```json:', testResponse.includes('```json'))

// Test the current regex
const jsonMatch = testResponse.match(/```json\s*([\s\S]*?)\s*```/)
console.log('Current regex match:', jsonMatch)

if (jsonMatch && jsonMatch[1]) {
  console.log('Extracted content:', jsonMatch[1].trim())
  console.log('Length:', jsonMatch[1].trim().length)
  
  // Try to parse as JSON
  try {
    const parsed = JSON.parse(jsonMatch[1].trim())
    console.log('✅ JSON parsing successful:', parsed)
  } catch (e) {
    console.log('❌ JSON parsing failed:', e.message)
  }
} else {
  console.log('❌ No match found')
}

// Test alternative regex
const altMatch = testResponse.match(/```json\s*([\s\S]*?)\s*```/)
console.log('Alternative regex match:', altMatch)
