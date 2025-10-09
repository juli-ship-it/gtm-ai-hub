import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import https from 'https'

export async function POST(request: NextRequest) {
  try {
    const { workflowJson } = await request.json()
    
    if (!workflowJson) {
      return NextResponse.json({ error: 'Workflow JSON is required' }, { status: 400 })
    }

    console.log('🤖 Starting AI analysis via API route...')

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

    // Create Supabase client with TLS configuration for development
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      global: {
        fetch: (url, options = {}) => {
          // In development, bypass TLS certificate verification
          if (process.env.NODE_ENV === 'development') {
            const agent = new https.Agent({
              rejectUnauthorized: false
            })
            return fetch(url, {
              ...options,
              agent
            })
          }
          return fetch(url, options)
        }
      }
    })
    
    // Create the analysis prompt
    const analysisPrompt = `Analyze this n8n workflow and extract business-relevant variables that users need to configure:

Workflow Name: ${workflow.name || 'Unnamed Workflow'}
Number of Nodes: ${workflow.nodes?.length || 0}

Workflow JSON:
${JSON.stringify(workflow, null, 2)}

Please analyze this workflow and return a JSON response with the following structure:
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

Focus on business-relevant variables that users need to configure, not technical implementation details.`
    
    console.log('📤 Calling Supabase Edge Function for AI analysis...')
    
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

    console.log('✅ AI analysis successful via Edge Function')
    return NextResponse.json(data)

  } catch (error) {
    console.error('❌ AI analysis failed:', error)
    return NextResponse.json(
      { error: 'AI analysis failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}