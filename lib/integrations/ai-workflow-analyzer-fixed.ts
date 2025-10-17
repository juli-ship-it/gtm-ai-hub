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
  return `
Analyze this n8n workflow and extract business-relevant variables that users would need to configure.

Workflow: ${workflow.name}
Nodes: ${nodes.length}

Node Details:
${nodes.map(node => `
- ${node.name} (${node.type})
  Parameters: ${JSON.stringify(node.parameters, null, 2)}
  Position: ${node.position}
`).join('\n')}

Connections:
${JSON.stringify(connections, null, 2)}

Please analyze this workflow and identify:

1. **What this workflow does** (business purpose)
2. **What variables users would need to configure** for their specific use case
3. **Business context** for each variable
4. **Appropriate variable types** and default values
5. **Required vs optional** variables

Focus on business-relevant variables like:
- Schedule settings (when to run) - use correct n8n enums
- Data source identifiers (list IDs, API endpoints)
- Data destination settings (file paths, sheet names)
- Excel configuration (worksheets, sheets, columns)
- Filtering criteria (what data to include)
- Mapping settings (how to transform data)
- Notification settings (who to notify)

IMPORTANT: For n8n schedule triggers, replicate the exact n8n Schedule Trigger node structure:

SCHEDULE TRIGGER STRUCTURE (matching n8n exactly):
- Trigger Interval: ["Seconds", "Minutes", "Hours", "Days", "Weeks", "Months", "Custom (Cron)"]

For each interval type, use n8n's exact parameter names:

1. **Seconds Interval:**
   - "Seconds Between Triggers": number (1-3600)

2. **Minutes Interval:**
   - "Minutes Between Triggers": number (1-1440)
   - "Trigger at Minute": number (0-59)

3. **Hours Interval:**
   - "Hours Between Triggers": number (1-24)
   - "Trigger at Minute": number (0-59)

4. **Days Interval:**
   - "Days Between Triggers": number (1-365)
   - "Trigger at Hour": number (0-23)
   - "Trigger at Minute": number (0-59)

5. **Weeks Interval:**
   - "Weeks Between Triggers": number (1-52)
   - "Trigger on Weekdays": array of weekdays ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
   - "Trigger at Hour": number (0-23)
   - "Trigger at Minute": number (0-59)

6. **Months Interval:**
   - "Months Between Triggers": number (1-12)
   - "Trigger at Day of Month": number (1-31)
   - "Trigger at Hour": number (0-23)
   - "Trigger at Minute": number (0-59)

7. **Custom (Cron) Interval:**
   - "Expression": string (cron expression like "0 9 * * 1-5")

Return your analysis as a JSON object with this exact structure:
{
  "workflowName": "string",
  "workflowDescription": "string",
  "businessLogic": "string",
  "detectedVariables": [
    {
      "name": "string",
      "type": "string|number|boolean|file|select|multiselect|date|email|url|object",
      "required": boolean,
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
        "min": number,
        "max": number,
        "pattern": "string",
        "fileTypes": ["array of file types"]
      }
    }
  ],
  "systems": ["array of system names"],
  "complexity": "simple|intermediate|advanced",
  "estimatedDuration": number,
  "hasFileUpload": boolean,
  "hasEmailNotification": boolean,
  "hasSlackNotification": boolean,
  "errorHandling": boolean,
  "webhookNodes": [],
  "aiInsights": ["array of insights"]
}
`
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
