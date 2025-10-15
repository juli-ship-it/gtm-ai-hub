// Test OpenAI directly to see what response format we get
// REQUIRES: OPENAI_API_KEY environment variable to be set in .env.local
const https = require('https')

// Fix TLS certificate issue
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

async function testOpenAIDirect() {
  const openaiApiKey = process.env.OPENAI_API_KEY
  if (!openaiApiKey) {
    console.log('❌ No OpenAI API key found in environment variables')
    console.log('Please set OPENAI_API_KEY in your .env.local file')
    return
  }
  
  const testPrompt = `Analyze this n8n workflow and extract business-relevant variables that users would need to configure.

Workflow: Test Workflow
Nodes: 1

Node Details:
- Start (n8n-nodes-base.start)
  Parameters: {}
  Position: [100, 100]

Connections:
{}

Please analyze this workflow and identify:

1. **What this workflow does** (business purpose)
2. **What variables users would need to configure** for their specific use case
3. **Business context** for each variable
4. **Appropriate variable types** and default values
5. **Required vs optional** variables

Focus on business-relevant variables like:
- Trigger settings (when/how to run the workflow)
- Data source identifiers (list IDs, API endpoints, database connections) - use generic names like "Data Source A", "Data Source B", etc.
- Data destination settings (file paths, sheet names, output locations) - use generic names like "Output Destination A", "Output Destination B", etc.
- Configuration settings (worksheets, sheets, columns, filters)
- Filtering criteria (what data to include/exclude)
- Mapping settings (how to transform or route data)
- Notification settings (who to notify, how to notify)
- Integration settings (API endpoints, webhook URLs, service connections)

IMPORTANT: Use GENERIC variable names that work for any use case:
- Instead of specific business context names → use generic names like "Data Source A", "Data Source B", etc.
- Instead of specific output names → use "Output Destination A", "Output Destination B", etc.
- Instead of specific configuration names → use "Configuration A", "Configuration B", etc.
- Count the number of similar nodes and create variables accordingly (e.g., if 2 data sources, create "Data Source A" and "Data Source B")

CRITICAL SECURITY: DO NOT extract these as variables (they will be handled separately):
- API keys, tokens, passwords, credentials
- Authentication tokens (Bearer tokens, OAuth tokens, etc.)
- Database connection strings
- Private keys or certificates
- Any sensitive authentication data

These will be set to empty placeholders and users must manually configure them in n8n for security.

IMPORTANT: For any trigger or scheduling nodes, extract the relevant configuration parameters that users would need to customize for their specific use case.

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
}`

  try {
    console.log('🤖 Testing OpenAI directly...')
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert n8n workflow analyst specializing in extracting business-relevant configuration variables. Your role is to analyze any n8n workflow and identify variables that users need to configure for their specific use case.\n\nKEY PRINCIPLES:\n- Extract ONLY business-relevant variables that users need to customize\n- Use GENERIC variable names (e.g., "Data Source A", "Output Destination B") that work for any business context\n- NEVER extract sensitive data (API keys, passwords, tokens, credentials)\n- Focus on configuration that makes workflows reusable across different use cases\n- Identify trigger settings, data sources, destinations, filters, mappings, and notifications\n- Always respond with valid JSON in the exact structure specified\n\nSECURITY: Never extract authentication credentials, API keys, or sensitive connection data. These should be handled separately by users.\n\nGENERIC NAMING: Use generic names like "Data Source A/B", "Output Destination A/B", "Configuration A/B" instead of specific business context names.\n\nAlways respond with valid JSON following the exact structure provided in the user prompt.'
          },
          {
            role: 'user',
            content: testPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      })
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.log('❌ OpenAI API error:', response.status, errorText)
      return
    }
    
    const data = await response.json()
    const aiResponse = data.choices[0].message.content
    
    console.log('✅ OpenAI Response received')
    console.log('Response length:', aiResponse.length)
    console.log('First 500 chars:', aiResponse.substring(0, 500))
    console.log('Last 500 chars:', aiResponse.substring(aiResponse.length - 500))
    
    // Try to parse as JSON
    try {
      const parsed = JSON.parse(aiResponse)
      console.log('✅ JSON parsing successful')
      console.log('Parsed result:', JSON.stringify(parsed, null, 2))
    } catch (parseError) {
      console.log('❌ JSON parsing failed:', parseError.message)
      console.log('Raw response:', aiResponse)
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message)
  }
}

testOpenAIDirect()
