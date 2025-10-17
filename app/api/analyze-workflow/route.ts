import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import https from 'https'

// Fix TLS certificate issues in development
if (process.env.NODE_ENV === 'development') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
}

// Helper function to create structured analysis prompt
function createAnalysisPrompt(workflow: any): string {
  const nodes = workflow.nodes || []
  const connections = workflow.connections || {}

  return `You are an expert n8n workflow analyst. Analyze this n8n workflow and extract ALL configurable business variables that users need to set up. Return ONLY a JSON object with this exact structure:

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
4. Extract the current value as defaultValue if present - THIS IS CRITICAL for proper variable injection
5. Determine the appropriate type based on the parameter value
6. Identify which n8n system each variable belongs to (HubSpot, Excel, Schedule, etc.)

VALUE EXTRACTION REQUIREMENTS:
- ALWAYS extract the current hardcoded value as the defaultValue
- For HubSpot list IDs: extract the actual numeric ID (e.g., "76841")
- For Excel workbooks/worksheets: extract the actual names (e.g., "DEMO sheet")
- For schedule triggers: extract the actual time values (e.g., 11 for 11 AM)
- The defaultValue must match the exact value in the workflow for proper injection

BUSINESS LOGIC REQUIREMENTS:
- Provide a clear, detailed explanation of what this workflow accomplishes
- Explain the business purpose and value
- Describe the data flow from start to finish
- Include timing/scheduling information
- Mention key systems and integrations involved
- Explain the end result or output
- Use bullet points or numbered steps for clarity

EXAMPLE BUSINESS LOGIC:
"This workflow automatically exports demo request leads from a HubSpot email campaign list to an Excel spreadsheet. It runs daily at 11 AM to capture new demo requests, enriches the contact data with additional details, and exports the information to a Microsoft Excel sheet for further processing by the sales team."

Workflow: ${workflow.name}
Nodes: ${nodes.length}

Node Details:
${nodes.map((node: any) => `
- ${node.name} (${node.type})
  Parameters: ${JSON.stringify(node.parameters, null, 2)}
`).join('\n')}

Connections:
${JSON.stringify(connections, null, 2)}

Extract ALL configurable variables that users need to set up. Use the actual parameter names and values from the workflow. Do not extract API keys, passwords, or other credentials.`
}

export async function POST(request: NextRequest) {
  try {
    const { workflowJson } = await request.json()

    if (!workflowJson) {
      return NextResponse.json({ error: 'Workflow JSON is required' }, { status: 400 })
    }


    // Parse the workflow JSON to get the workflow object
    let workflow
    try {
      workflow = typeof workflowJson === 'string' ? JSON.parse(workflowJson) : workflowJson
    } catch (parseError) {
      console.error('❌ Failed to parse workflow JSON:', parseError)
      return NextResponse.json({ error: 'Invalid workflow JSON format' }, { status: 400 })
    }

    // Check Supabase configuration
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Supabase configuration missing')
      return NextResponse.json({ error: 'Supabase configuration missing' }, { status: 500 })
    }

    // Create Supabase client - try without custom fetch first
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Create the analysis prompt using structured approach
    const analysisPrompt = createAnalysisPrompt(workflow)


    const { data, error } = await supabase.functions.invoke('analyze-workflow', {
      body: {
        prompt: analysisPrompt,
        workflow: workflow
      }
    })

    if (error) {
      console.error('❌ Edge Function error:', error)
      throw new Error(`Edge Function error: ${error.message}`)
    }

    return NextResponse.json(data)

  } catch (error) {
    console.error('❌ AI analysis failed:', error)
    return NextResponse.json(
      { error: 'AI analysis failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}