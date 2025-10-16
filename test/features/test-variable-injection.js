// Test script to verify variable injection is working
const { cloneWorkflowToN8N } = require('./lib/integrations/n8n-workflow-cloner.ts')

// Sample workflow JSON (simplified)
const sampleWorkflow = {
  name: "Test Workflow",
  nodes: [
    {
      id: "schedule-trigger",
      name: "Schedule Trigger",
      type: "n8n-nodes-base.scheduleTrigger",
      parameters: {
        rule: {
          interval: "Days",
          intervalValue: 1,
          hour: 9,
          minute: 0
        }
      }
    },
    {
      id: "hubspot-node",
      name: "HubSpot",
      type: "n8n-nodes-base.hubspot",
      parameters: {
        listId: "12345"
      }
    },
    {
      id: "excel-node",
      name: "Excel",
      type: "n8n-nodes-base.excel",
      parameters: {
        fileName: "/path/to/file.xlsx",
        sheetName: "Sheet1"
      }
    }
  ]
}

// Test variables
const testVariables = {
  'Trigger Interval': 'Days',
  'Days Between Triggers': 2,
  'Trigger at Hour': 10,
  'Trigger at Minute': 30,
  'hubspotListId': '67890',
  'excelFilePath': '/new/path/to/file.xlsx',
  'excelSheetName': 'NewSheet'
}

async function testVariableInjection() {
  try {)

    const result = await cloneWorkflowToN8N(sampleWorkflow, testVariables)

    // Parse the cloned workflow to verify changes
    const clonedWorkflow = JSON.parse(result.workflowJson)))

  } catch (error) {

  }
}

// Run the test
testVariableInjection()
