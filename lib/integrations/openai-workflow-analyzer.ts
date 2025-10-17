// Real OpenAI Integration for Workflow Analysis
import { N8NWorkflow } from './n8n-workflow-parser'

export async function analyzeWorkflowWithOpenAI(workflowJson: string): Promise<any> {
  const workflow: N8NWorkflow = JSON.parse(workflowJson)

  const prompt = createOpenAIPrompt(workflow)

  try {
    const response = await fetch('/api/analyze-workflow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt,
        workflow: workflow
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error('OpenAI analysis failed:', error)
    throw error
  }
}

function createOpenAIPrompt(workflow: N8NWorkflow): string {
  const nodes = workflow.nodes || []
  const connections = workflow.connections || {}

  return `
You are an expert workflow analyst. Analyze this n8n workflow and extract business-relevant variables that users would need to configure.

Workflow: ${workflow.name}
Nodes: ${nodes.length}

Node Details:
${nodes.map(node => `
- ${node.name} (${node.type})
  Parameters: ${JSON.stringify(node.parameters, null, 2)}
`).join('\n')}

Connections:
${JSON.stringify(connections, null, 2)}

Analyze this workflow and identify business-relevant variables that users would need to configure for their specific use case.

Focus on:
- Schedule settings (when to run)
- Data source identifiers (list IDs, API endpoints)
- Data destination settings (file paths, sheet names)
- Filtering criteria (what data to include)
- Mapping settings (how to transform data)
- Notification settings (who to notify)

Return your analysis in this JSON format:
{
  "workflowDescription": "Clear description of what this workflow does",
  "businessLogic": "Step-by-step explanation of the business process",
  "variables": [
    {
      "name": "variableName",
      "type": "string|number|boolean|file|select|multiselect|date|email|url",
      "required": true,
      "description": "What this variable controls",
      "defaultValue": "sensible default",
      "category": "schedule|data_source|data_destination|configuration|notification|filter|mapping",
      "businessContext": "Why the user needs to configure this",
      "aiReasoning": "Why I identified this as a variable",
      "options": ["option1", "option2"]
    }
  ],
  "systems": ["system1", "system2"],
  "complexity": "simple|intermediate|advanced",
  "estimatedDuration": 15,
  "aiInsights": ["insight1", "insight2"]
}
`
}
