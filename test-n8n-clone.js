// Test script for n8n workflow cloning functionality
const { cloneWorkflowToN8N, generateN8NImportUrl } = require('./lib/integrations/n8n-workflow-cloner.ts')

// Sample n8n workflow JSON
const sampleWorkflow = {
  name: "HubSpot to Excel Export",
  nodes: [
    {
      id: "webhook-1",
      name: "Webhook",
      type: "n8n-nodes-base.webhook",
      parameters: {
        path: "/webhook/hubspot-export",
        httpMethod: "POST"
      }
    },
    {
      id: "hubspot-1",
      name: "Get HubSpot Contacts",
      type: "n8n-nodes-base.hubspot",
      parameters: {
        resource: "contact",
        operation: "getAll",
        segmentId: "12345",
        filters: {
          property: [
            { property: "email" },
            { property: "firstname" },
            { property: "lastname" }
          ]
        }
      }
    },
    {
      id: "excel-1",
      name: "Create Excel File",
      type: "n8n-nodes-base.excel",
      parameters: {
        fileName: "hubspot-contacts.xlsx",
        sheetName: "Contacts"
      }
    }
  ],
  connections: {
    "webhook-1": {
      "main": [
        [
          {
            "node": "hubspot-1",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "hubspot-1": {
      "main": [
        [
          {
            "node": "excel-1",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}

// Sample variables to inject
const sampleVariables = {
  hubspot_segment_id: "12345",
  hubspot_property_1: "email",
  hubspot_property_2: "firstname",
  hubspot_property_3: "lastname",
  excel_filename: "hubspot-contacts.xlsx",
  excel_sheet_name: "Contacts"
}

async function testN8NClone() {

  try {
    // Test the clone functionality
    const result = await cloneWorkflowToN8N(sampleWorkflow, sampleVariables)

    // Test URL generation
    const importUrl = generateN8NImportUrl(sampleWorkflow, sampleVariables)

  } catch (error) {

  }
}

// Run the test
testN8NClone()
