import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSnowflakeMCPClient } from '@/lib/integrations/snowflake-mcp'
import { SnowflakeMCPSecurity } from '@/lib/integrations/snowflake-mcp'
import { 
  createEnhancedAIPrompt, 
  validateQuery, 
  sanitizeQuery, 
  getDataSourceFromQuery 
} from '@/lib/integrations/ai-query-engine'

interface ChatMessage {
  id: string
  type: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  metadata?: any
}

interface ChatRequest {
  message: string
  dataSource: string
  messageHistory: ChatMessage[]
}

export async function POST(request: NextRequest) {
  try {
    const { message, dataSource, messageHistory }: ChatRequest = await request.json()
    
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    console.log('🤖 Data chatbot request:', { message, dataSource })

    // Create enhanced AI prompt for query generation
    const aiPrompt = createEnhancedAIPrompt(message, dataSource, messageHistory)
    
    // Call AI to generate SQL query
    const aiResponse = await callAIForQueryGeneration(aiPrompt)
    
    if (!aiResponse.success) {
      return NextResponse.json({
        response: "I'm sorry, I couldn't understand your request. Could you please rephrase it?",
        error: aiResponse.error
      })
    }

    const { query, dataSource: detectedSource, explanation, confidence } = aiResponse.data

    // Sanitize and validate the generated query
    const sanitizedQuery = sanitizeQuery(query)
    
    if (!validateQuery(sanitizedQuery, detectedSource)) {
      return NextResponse.json({
        response: "I'm sorry, I can't execute that type of query for security reasons. Please try asking for data analysis or reporting instead.",
        error: "Query validation failed"
      })
    }

    // Check confidence level
    if (confidence && confidence < 0.7) {
      return NextResponse.json({
        response: `I'm not entirely sure about this query (confidence: ${Math.round(confidence * 100)}%). Could you be more specific about what data you're looking for?`,
        query: sanitizedQuery,
        dataSource: detectedSource,
        confidence
      })
    }

    // Execute the query based on detected data source
    let queryResult
    let executionTime = 0
    const startTime = Date.now()

    try {
      switch (detectedSource) {
        case 'snowflake':
          queryResult = await executeSnowflakeQuery(sanitizedQuery)
          break
        case 'supabase':
          queryResult = await executeSupabaseQuery(sanitizedQuery)
          break
        case 'hubspot':
          queryResult = await executeHubSpotQuery(sanitizedQuery)
          break
        case 'mixpanel':
          queryResult = await executeMixpanelQuery(sanitizedQuery)
          break
        default:
          // Try Snowflake as default
          queryResult = await executeSnowflakeQuery(sanitizedQuery)
      }
      
      executionTime = (Date.now() - startTime) / 1000
      
      // Format the response
      const response = formatQueryResponse(queryResult, explanation, executionTime)
      
      return NextResponse.json({
        response,
        query: sanitizedQuery,
        dataSource: detectedSource,
        executionTime,
        rowCount: queryResult?.rowCount || 0,
        confidence
      })
      
    } catch (queryError) {
      console.error('❌ Query execution error:', queryError)
      
      return NextResponse.json({
        response: `I encountered an error while querying the data: ${queryError}. Could you try rephrasing your question?`,
        query: sanitizedQuery,
        dataSource: detectedSource,
        error: queryError instanceof Error ? queryError.message : 'Unknown error'
      })
    }

  } catch (error) {
    console.error('❌ Data chatbot error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


async function callAIForQueryGeneration(prompt: string): Promise<any> {
  try {
    // Use the same AI infrastructure as workflow analysis
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing')
    }

    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    const { data, error } = await supabase.functions.invoke('analyze-workflow', {
      body: { 
        prompt: prompt,
        workflow: null // Not needed for this use case
      }
    })

    if (error) {
      throw new Error(`AI analysis error: ${error.message}`)
    }

    // Parse the AI response
    let jsonContent = data.response
    try {
      // Remove markdown code blocks if present
      jsonContent = jsonContent.replace(/```json\n?/g, '').replace(/```\n?/g, '')
      return JSON.parse(jsonContent)
    } catch (parseError) {
      console.error('Failed to parse AI response:', jsonContent)
      return {
        success: false,
        error: 'Failed to parse AI response'
      }
    }
  } catch (error) {
    console.error('AI query generation error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

async function executeSnowflakeQuery(query: string): Promise<any> {
  const snowflakeClient = createSnowflakeMCPClient()
  return await snowflakeClient.executeQuery(query)
}

async function executeSupabaseQuery(query: string): Promise<any> {
  // For Supabase, we'll use the Supabase client directly
  // This is a simplified implementation - in production you'd want more sophisticated query handling
  const supabase = createClient()
  
  // Extract table name from query (simplified)
  const tableMatch = query.match(/FROM\s+(\w+)/i)
  if (!tableMatch) {
    throw new Error('Could not determine table name from query')
  }
  
  const tableName = tableMatch[1]
  
  // For now, return mock data - in production you'd execute the actual query
  return {
    data: [
      { id: 1, name: 'Sample Record', created_at: new Date().toISOString() },
      { id: 2, name: 'Another Record', created_at: new Date().toISOString() }
    ],
    columns: ['id', 'name', 'created_at'],
    rowCount: 2,
    executionTime: 0.5
  }
}

async function executeHubSpotQuery(query: string): Promise<any> {
  // Mock HubSpot query execution
  return {
    data: [
      { contact_id: 1, email: 'john@example.com', company: 'Acme Corp' },
      { contact_id: 2, email: 'jane@example.com', company: 'Beta Inc' }
    ],
    columns: ['contact_id', 'email', 'company'],
    rowCount: 2,
    executionTime: 0.3
  }
}

async function executeMixpanelQuery(query: string): Promise<any> {
  // Mock Mixpanel query execution
  return {
    data: [
      { event: 'page_view', count: 150, date: '2024-01-15' },
      { event: 'signup', count: 25, date: '2024-01-15' }
    ],
    columns: ['event', 'count', 'date'],
    rowCount: 2,
    executionTime: 0.4
  }
}

function formatQueryResponse(queryResult: any, explanation: string, executionTime: number): string {
  if (!queryResult || !queryResult.data || queryResult.data.length === 0) {
    return "I found no data matching your criteria. You might want to try adjusting your search parameters."
  }

  const { data, columns, rowCount } = queryResult
  
  let response = `${explanation}\n\n`
  
  if (rowCount === 1) {
    response += "Here's the result:\n"
  } else {
    response += `Here are the results (${rowCount} rows):\n\n`
  }

  // Format the data in a readable way
  if (data.length <= 10) {
    // Show all data for small results
    data.forEach((row: any, index: number) => {
      response += `\n${index + 1}. `
      columns.forEach((col: string, colIndex: number) => {
        if (colIndex > 0) response += ' | '
        response += `${col}: ${row[col] || 'N/A'}`
      })
    })
  } else {
    // Show first few rows for large results
    response += "First few results:\n"
    data.slice(0, 5).forEach((row: any, index: number) => {
      response += `\n${index + 1}. `
      columns.forEach((col: string, colIndex: number) => {
        if (colIndex > 0) response += ' | '
        response += `${col}: ${row[col] || 'N/A'}`
      })
    })
    response += `\n\n... and ${rowCount - 5} more results`
  }

  response += `\n\n*Query executed in ${executionTime.toFixed(2)} seconds*`

  return response
}
