// Test the Next.js API route directly
const fetch = require('node-fetch')

async function testAPIRoute() {

  const testWorkflow = {
    name: "Test Workflow",
    nodes: [
      {
        type: "n8n-nodes-base.scheduleTrigger",
        parameters: {
          rule: {
            interval: "Days",
            intervalValue: 1
          }
        }
      }
    ]
  }

  try {

    const response = await fetch('http://localhost:3000/api/analyze-workflow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workflowJson: JSON.stringify(testWorkflow)
      })
    })))

    const data = await response.text()

  } catch (err) {

  }
}

testAPIRoute()
