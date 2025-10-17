// AI-Powered Workflow Analyzer
// Uses AI to understand business logic and extract meaningful variables

import { N8NWorkflow, N8NNode } from './n8n-workflow-parser'

export interface AIWorkflowAnalysis {
  workflowName: string
  workflowDescription: string
  businessLogic: string
  detectedVariables: AIVariable[]
  systems: string[]
  complexity: 'simple' | 'intermediate' | 'advanced'
  estimatedDuration: number
  hasFileUpload: boolean
  hasEmailNotification: boolean
  hasSlackNotification: boolean
  errorHandling: boolean
  webhookNodes: N8NNode[]
  aiInsights: string[]
}

export interface AIVariable {
  name: string
  type: 'string' | 'number' | 'boolean' | 'file' | 'select' | 'multiselect' | 'date' | 'email' | 'url' | 'object'
  required: boolean
  description: string
  defaultValue?: any
  options?: string[]
  category: 'schedule' | 'data_source' | 'data_destination' | 'configuration' | 'notification' | 'filter' | 'mapping' | 'excel_config'
  businessContext: string
  aiReasoning: string
  n8nEnum?: string[] // Valid n8n enum values
  excelConfig?: {
    sheets: string[]
    columns: Record<string, string[]>
    sheetOptions: string[]
  }
  validation?: {
    min?: number
    max?: number
    pattern?: string
    fileTypes?: string[]
  }
}

export async function analyzeWorkflowWithAI(workflowJson: string): Promise<AIWorkflowAnalysis> {
  const workflow: N8NWorkflow = JSON.parse(workflowJson)

  // Create a detailed prompt for AI analysis
  const analysisPrompt = createAnalysisPrompt(workflow)

  try {
    // Call AI service to analyze the workflow
    const aiResponse = await callAIAnalysis(workflowJson)

    return parseAIResponse(aiResponse, workflow)
  } catch (error) {
    console.error('AI analysis failed, falling back to rule-based analysis:', error)
    return fallbackAnalysis(workflow)
  }
}

function createAnalysisPrompt(workflow: N8NWorkflow): string {
  const nodes = workflow.nodes || []
  const connections = workflow.connections || {}

  // Create a detailed prompt for AI analysis
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
${nodes.map(node => `
- ${node.name} (${node.type})
  Parameters: ${JSON.stringify(node.parameters, null, 2)}
`).join('\n')}

Connections:
${JSON.stringify(connections, null, 2)}

Extract ALL configurable variables that users need to set up. Use the actual parameter names and values from the workflow. Do not extract API keys, passwords, or other credentials.`
}

async function callAIAnalysis(workflowJson: string): Promise<string> {
  console.log('🤖 Starting AI analysis...')

  try {
    console.log('📤 Sending request to AI analysis API...')

    const response = await fetch('/api/analyze-workflow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ workflowJson })
    })

    if (response.ok) {
      const result = await response.json()
      console.log('✅ AI analysis successful:', {
        variablesFound: result.detectedVariables?.length || 0,
        systems: result.systems || [],
        complexity: result.complexity
      })
      return JSON.stringify(result)
    } else {
      const errorData = await response.json()
      console.error('❌ AI analysis API error:', response.status, response.statusText, errorData)
      throw new Error(`API error: ${errorData.error || response.statusText}`)
    }
  } catch (error) {
    console.error('❌ AI analysis failed, falling back to mock:', error)
    throw error
  }
}

function parseAIResponse(aiResponse: string, workflow: N8NWorkflow): AIWorkflowAnalysis {
  try {
    const parsed = JSON.parse(aiResponse)

    // Convert the AI response to our expected format
    return {
      workflowName: parsed.workflowName || workflow.name || 'Unnamed Workflow',
      workflowDescription: parsed.workflowDescription || 'No description provided',
      businessLogic: parsed.businessLogic || 'No business logic analysis available',
      detectedVariables: parsed.detectedVariables || parsed.variables || [],
      systems: parsed.systems || [],
      complexity: parsed.complexity || 'simple',
      estimatedDuration: parsed.estimatedDuration || 5,
      hasFileUpload: parsed.hasFileUpload || false,
      hasEmailNotification: parsed.hasEmailNotification || false,
      hasSlackNotification: parsed.hasSlackNotification || false,
      errorHandling: parsed.errorHandling || false,
      webhookNodes: parsed.webhookNodes || [],
      aiInsights: parsed.aiInsights || []
    }
  } catch (error) {
    console.error('Failed to parse AI response:', error)
    throw new Error('Invalid AI response format')
  }
}

function fallbackAnalysis(workflow: N8NWorkflow): AIWorkflowAnalysis {
  console.log('Using fallback analysis for workflow:', workflow.name)

  return {
    workflowName: workflow.name || 'Unnamed Workflow',
    workflowDescription: 'Workflow analysis unavailable',
    businessLogic: 'Unable to analyze workflow structure',
    detectedVariables: [],
    systems: [],
    complexity: 'simple',
    estimatedDuration: 5,
    hasFileUpload: false,
    hasEmailNotification: false,
    hasSlackNotification: false,
    errorHandling: false,
    webhookNodes: [],
    aiInsights: ['AI analysis unavailable - using fallback']
  }
}
