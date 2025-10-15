// Test with a realistic n8n workflow that has actual variables
const { createClient } = require('@supabase/supabase-js')
const https = require('https')
require('dotenv').config({ path: '.env.local' })

// Fix TLS certificate issue
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

async function testRealWorkflow() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    global: {
      fetch: (url, options = {}) => {
        const agent = new https.Agent({
          rejectUnauthorized: false
        })
        return fetch(url, {
          ...options,
          agent
        })
      }
    }
  })

  // Create a realistic n8n workflow with actual variables
  const realisticWorkflow = {
    name: "HubSpot to Excel Export with Schedule",
    nodes: [
      {
        name: "Schedule Trigger",
        type: "n8n-nodes-base.scheduleTrigger",
        parameters: {
          rule: {
            interval: [
              {
                field: "hours",
                value: 24
              }
            ]
          }
        }
      },
      {
        name: "HubSpot Get Contacts",
        type: "n8n-nodes-base.hubspot",
        parameters: {
          resource: "contact",
          operation: "getAll",
          returnAll: false,
          limit: 100,
          filters: {
            property: "lastmodifieddate",
            operator: "GTE",
            value: "{{$now.minus(7, 'days').toISO()}}"
          },
          properties: ["email", "firstname", "lastname", "company", "phone"]
        }
      },
      {
        name: "Excel Create File",
        type: "n8n-nodes-base.excel",
        parameters: {
          operation: "create",
          fileName: "hubspot_contacts_export.xlsx",
          sheetName: "Contacts",
          columns: {
            values: [
              {
                column: "Email",
                value: "={{$json.email}}"
              },
              {
                column: "First Name", 
                value: "={{$json.firstname}}"
              },
              {
                column: "Last Name",
                value: "={{$json.lastname}}"
              },
              {
                column: "Company",
                value: "={{$json.company}}"
              },
              {
                column: "Phone",
                value: "={{$json.phone}}"
              }
            ]
          }
        }
      },
      {
        name: "Email Send",
        type: "n8n-nodes-base.emailSend",
        parameters: {
          fromEmail: "noreply@company.com",
          toEmail: "admin@company.com",
          subject: "Daily HubSpot Export - {{$now.format('YYYY-MM-DD')}}",
          message: "Please find attached the daily export of HubSpot contacts.",
          attachments: "={{$json.binary}}"
        }
      }
    ],
    connections: {
      "Schedule Trigger": {
        "main": [
          [
            {
              "node": "HubSpot Get Contacts",
              "type": "main",
              "index": 0
            }
          ]
        ]
      },
      "HubSpot Get Contacts": {
        "main": [
          [
            {
              "node": "Excel Create File",
              "type": "main", 
              "index": 0
            }
          ]
        ]
      },
      "Excel Create File": {
        "main": [
          [
            {
              "node": "Email Send",
              "type": "main",
              "index": 0
            }
          ]
        ]
      }
    }
  }

  try {
    console.log('📤 Testing with realistic workflow...')
    console.log('Workflow name:', realisticWorkflow.name)
    console.log('Number of nodes:', realisticWorkflow.nodes.length)
    
    const { data, error } = await supabase.functions.invoke('analyze-workflow', {
      body: {
        prompt: `You are an expert n8n workflow analyst. Analyze this n8n workflow and extract ALL configurable business variables that users need to set up. Return ONLY a JSON object with this exact structure:

{
  "workflowName": "string",
  "workflowDescription": "string", 
  "businessLogic": "string",
  "detectedVariables": [
    {
      "name": "string",
      "type": "string|number|boolean|file|select|multiselect|date|email|url|object",
      "required": true,
      "description": "string",
      "defaultValue": "any",
      "options": ["array of strings for select/multiselect"],
      "category": "schedule|data_source|data_destination|configuration|notification|filter|mapping|excel_config",
      "businessContext": "string",
      "aiReasoning": "string",
      "n8nEnum": ["array of valid n8n enum values"],
      "excelConfig": {
        "sheets": ["array of sheet names"],
        "columns": {"sheetName": ["array of column names"]},
        "sheetOptions": ["array of sheet options"]
      },
      "validation": {
        "min": 0,
        "max": 100,
        "pattern": "string",
        "fileTypes": ["array of file types"]
      }
    }
  ],
  "systems": ["array of system names"],
  "complexity": "simple|intermediate|advanced",
  "estimatedDuration": 5,
  "hasFileUpload": false,
  "hasEmailNotification": false,
  "hasSlackNotification": false,
  "errorHandling": false,
  "webhookNodes": [],
  "aiInsights": ["array of insights"]
}

CRITICAL INSTRUCTIONS:
1. Extract SPECIFIC, REAL variables from the workflow parameters - NOT generic placeholders
2. Look for actual values like:
   - HubSpot list IDs, contact IDs, deal IDs
   - Excel file names, sheet names, column names
   - Schedule trigger times, intervals, cron expressions
   - Email addresses, webhook URLs, API endpoints
   - Filter conditions, field mappings, data transformations
   - Notification settings, Slack channels, email templates

3. For each variable, use the ACTUAL parameter name from the n8n node
4. Extract the current value as defaultValue if present
5. Determine the appropriate type based on the parameter value
6. Identify which n8n system each variable belongs to (HubSpot, Excel, Schedule, etc.)

Workflow: ${realisticWorkflow.name}
Nodes: ${realisticWorkflow.nodes.length}

Node Details:
${realisticWorkflow.nodes.map(node => `
- ${node.name} (${node.type})
  Parameters: ${JSON.stringify(node.parameters, null, 2)}
`).join('\n')}

Connections:
${JSON.stringify(realisticWorkflow.connections, null, 2)}

Extract ALL configurable variables that users need to set up. Use the actual parameter names and values from the workflow. Do not extract API keys, passwords, or other credentials.`,
        workflow: realisticWorkflow
      }
    })

    if (error) {
      console.log('❌ Error:', error)
    } else {
      console.log('✅ Success!')
      console.log('Workflow Name:', data.workflowName)
      console.log('Detected Variables:', data.detectedVariables?.length || 0)
      console.log('Systems:', data.systems)
      console.log('\nVariables:')
      data.detectedVariables?.forEach((variable, index) => {
        console.log(`${index + 1}. ${variable.name} (${variable.type})`)
        console.log(`   Category: ${variable.category}`)
        console.log(`   Description: ${variable.description}`)
        console.log(`   Default Value: ${JSON.stringify(variable.defaultValue)}`)
        console.log('')
      })
    }
  } catch (err) {
    console.log('❌ Exception:', err.message)
  }
}

testRealWorkflow()
