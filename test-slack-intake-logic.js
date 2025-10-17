// Test script to verify the new Slack intake logic
// This tests the checkForAdditionalInformation function logic

// Mock SlackIntakeData interface
const mockSlackData = {
  event_type: 'form_submission',
  submitter_id: 'U123456',
  submitter_username: 'john.doe',
  team_id: 'T123456',
  team: 'Test Team',
  title: '',
  jtbd: '',
  category: 'other',
  current_process: '',
  pain_points: '',
  frequency: 'adhoc',
  time_friendly: 'Unknown',
  systems: [],
  sensitivity: 'low',
  urgency: '',
  links: '',
  gpt_agent_url: 'https://chatgpt.com/g/g-test-agent',
  request_type: 'request',
  view_id: 'V123456',
  callback_id: 'C123456'
}

// Test cases
const testCases = [
  {
    name: 'Only GPT URL - should NOT create intake request',
    data: { ...mockSlackData },
    gptUrl: 'https://chatgpt.com/g/g-test-agent',
    expected: false
  },
  {
    name: 'GPT URL + meaningful title - should create intake request',
    data: { ...mockSlackData, title: 'Content Strategy Assistant' },
    gptUrl: 'https://chatgpt.com/g/g-test-agent',
    expected: true
  },
  {
    name: 'GPT URL + job to be done - should create intake request',
    data: { ...mockSlackData, jtbd: 'Need help with content creation' },
    gptUrl: 'https://chatgpt.com/g/g-test-agent',
    expected: true
  },
  {
    name: 'GPT URL + current process - should create intake request',
    data: { ...mockSlackData, current_process: 'Manual content creation process' },
    gptUrl: 'https://chatgpt.com/g/g-test-agent',
    expected: true
  },
  {
    name: 'GPT URL + pain points - should create intake request',
    data: { ...mockSlackData, pain_points: 'Takes too long to create content' },
    gptUrl: 'https://chatgpt.com/g/g-test-agent',
    expected: true
  },
  {
    name: 'GPT URL + specific category - should create intake request',
    data: { ...mockSlackData, category: 'content' },
    gptUrl: 'https://chatgpt.com/g/g-test-agent',
    expected: true
  },
  {
    name: 'GPT URL + frequency - should create intake request',
    data: { ...mockSlackData, frequency: 'daily' },
    gptUrl: 'https://chatgpt.com/g/g-test-agent',
    expected: true
  },
  {
    name: 'GPT URL + systems - should create intake request',
    data: { ...mockSlackData, systems: ['HubSpot', 'WordPress'] },
    gptUrl: 'https://chatgpt.com/g/g-test-agent',
    expected: true
  },
  {
    name: 'GPT URL + sensitivity - should create intake request',
    data: { ...mockSlackData, sensitivity: 'high' },
    gptUrl: 'https://chatgpt.com/g/g-test-agent',
    expected: true
  },
  {
    name: 'GPT URL + urgency - should create intake request',
    data: { ...mockSlackData, urgency: 'urgent' },
    gptUrl: 'https://chatgpt.com/g/g-test-agent',
    expected: true
  },
  {
    name: 'GPT URL + other links - should create intake request',
    data: { ...mockSlackData, links: 'https://example.com, https://chatgpt.com/g/g-test-agent' },
    gptUrl: 'https://chatgpt.com/g/g-test-agent',
    expected: true
  },
  {
    name: 'No GPT URL - should create intake request',
    data: { ...mockSlackData, gpt_agent_url: undefined },
    gptUrl: null,
    expected: true
  },
  {
    name: 'GPT URL + default values only - should NOT create intake request',
    data: { 
      ...mockSlackData, 
      title: 'GPT Agent Request',
      jtbd: 'No description provided',
      current_process: 'No current process described',
      pain_points: 'No pain points described'
    },
    gptUrl: 'https://chatgpt.com/g/g-test-agent',
    expected: false
  }
]

// Mock the checkForAdditionalInformation function
function checkForAdditionalInformation(slackData, gptAgentUrl) {
  console.log('Checking for additional information beyond GPT URL...')
  
  // If no GPT URL, we definitely need an intake request
  if (!gptAgentUrl) {
    console.log('No GPT URL found - will create intake request')
    return true
  }
  
  // Check for meaningful content in key fields
  const hasTitle = slackData.title && slackData.title.trim() !== '' && slackData.title !== 'GPT Agent Request'
  const hasJobToBeDone = slackData.jtbd && slackData.jtbd.trim() !== '' && slackData.jtbd !== 'No description provided'
  const hasCurrentProcess = slackData.current_process && slackData.current_process.trim() !== '' && slackData.current_process !== 'No current process described'
  const hasPainPoints = slackData.pain_points && slackData.pain_points.trim() !== '' && slackData.pain_points !== 'No pain points described'
  const hasCategory = slackData.category && slackData.category !== 'other'
  const hasFrequency = slackData.frequency && slackData.frequency !== 'adhoc'
  const hasSystems = slackData.systems && slackData.systems.length > 0
  const hasSensitivity = slackData.sensitivity && slackData.sensitivity !== 'low'
  const hasUrgency = slackData.urgency && slackData.urgency.trim() !== ''
  const hasOtherLinks = slackData.links && slackData.links.trim() !== '' && !slackData.links.includes(gptAgentUrl)
  
  const additionalInfo = {
    hasTitle,
    hasJobToBeDone,
    hasCurrentProcess,
    hasPainPoints,
    hasCategory,
    hasFrequency,
    hasSystems,
    hasSensitivity,
    hasUrgency,
    hasOtherLinks
  }
  
  console.log('Additional information check:', additionalInfo)
  
  // Return true if any meaningful additional information is present
  const hasAdditionalInfo = Object.values(additionalInfo).some(Boolean)
  console.log(`Has additional information: ${hasAdditionalInfo}`)
  
  return hasAdditionalInfo
}

// Run tests
console.log('🧪 Testing Slack Intake Logic\n')

let passed = 0
let failed = 0

testCases.forEach((testCase, index) => {
  console.log(`\n--- Test ${index + 1}: ${testCase.name} ---`)
  const result = checkForAdditionalInformation(testCase.data, testCase.gptUrl)
  
  if (result === testCase.expected) {
    console.log(`✅ PASS - Expected: ${testCase.expected}, Got: ${result}`)
    passed++
  } else {
    console.log(`❌ FAIL - Expected: ${testCase.expected}, Got: ${result}`)
    failed++
  }
})

console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`)

if (failed === 0) {
  console.log('🎉 All tests passed!')
} else {
  console.log('⚠️  Some tests failed. Please review the logic.')
}
