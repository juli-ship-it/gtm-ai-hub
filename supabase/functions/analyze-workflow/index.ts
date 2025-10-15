// Supabase Edge Function for AI Workflow Analysis
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const requestId = Math.random().toString(36).substring(7)
  const startTime = Date.now()
  
  console.log(`[${requestId}] 🚀 Edge Function: AI Workflow Analysis Started`)
  
  try {
    const { prompt, workflow } = await req.json()
    
    console.log(`[${requestId}] 📝 Workflow Info:`, {
      name: workflow?.name || 'Unknown',
      nodeCount: workflow?.nodes?.length || 0,
      promptLength: prompt?.length || 0
    })
    
    console.log(`[${requestId}] 🔍 Request body received successfully`)
    console.log(`[${requestId}] 🔍 Prompt preview:`, prompt?.substring(0, 200) + '...')
    
    // Check OpenAI API key
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      console.log(`[${requestId}] ❌ OpenAI API key not configured in Edge Function`)
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
    console.log(`[${requestId}] ✅ OpenAI API key found in Edge Function`)
    
    // Call OpenAI API
    console.log(`[${requestId}] 🤖 Calling OpenAI API from Edge Function...`)
    const openaiStartTime = Date.now()
    
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: `You are an expert n8n workflow analyst. Analyze the provided n8n workflow and return ONLY a valid JSON object with the exact structure specified in the user prompt. Do not include any text before or after the JSON. Do not use markdown code blocks. Return only the raw JSON object.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      })
    })
    
    const openaiDuration = Date.now() - openaiStartTime
    console.log(`[${requestId}] ⏱️ OpenAI API call took ${openaiDuration}ms`)
    
    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text()
      console.log(`[${requestId}] ❌ OpenAI API error:`, {
        status: openaiResponse.status,
        statusText: openaiResponse.statusText,
        error: errorText
      })
      throw new Error(`OpenAI API error: ${openaiResponse.status} - ${errorText}`)
    }
    
    const openaiData = await openaiResponse.json()
    const aiResponse = openaiData.choices[0].message.content
    
    console.log(`[${requestId}] 📊 OpenAI Response:`, {
      usage: openaiData.usage,
      responseLength: aiResponse.length,
      finishReason: openaiData.choices[0].finish_reason
    })
    
    console.log(`[${requestId}] 🔍 Raw AI Response:`, aiResponse.substring(0, 1000) + '...')
    
    // Parse the AI response - handle markdown code blocks
    let jsonContent = aiResponse
    try {
      console.log(`[${requestId}] 🔍 Parsing AI response...`)
      
      // Extract JSON from markdown code blocks if present
      if (aiResponse.includes('```json')) {
        const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/)
        if (jsonMatch && jsonMatch[1]) {
          jsonContent = jsonMatch[1].trim()
          console.log(`[${requestId}] 📝 Extracted JSON from markdown code block`)
        }
      } else if (aiResponse.includes('```')) {
        // Handle generic code blocks
        const codeMatch = aiResponse.match(/```\s*([\s\S]*?)\s*```/)
        if (codeMatch && codeMatch[1]) {
          jsonContent = codeMatch[1].trim()
          console.log(`[${requestId}] 📝 Extracted content from generic code block`)
        }
      }
      
      // If still no JSON content extracted, try to find JSON object in the response
      if (jsonContent === aiResponse) {
        const jsonObjectMatch = aiResponse.match(/\{[\s\S]*\}/)
        if (jsonObjectMatch && jsonObjectMatch[0]) {
          jsonContent = jsonObjectMatch[0].trim()
          console.log(`[${requestId}] 📝 Extracted JSON object from response`)
        }
      }
      
      console.log(`[${requestId}] 🔍 JSON content to parse:`, jsonContent.substring(0, 200) + '...')
      
      const parsed = JSON.parse(jsonContent)
      
      console.log(`[${requestId}] ✅ AI Analysis Complete:`, {
        variablesFound: parsed.variables?.length || 0,
        systems: parsed.systems || [],
        complexity: parsed.complexity,
        duration: parsed.estimatedDuration
      })
      
      const totalDuration = Date.now() - startTime
      console.log(`[${requestId}] 🎉 Total Edge Function time: ${totalDuration}ms`)
      
      return new Response(
        JSON.stringify(parsed),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    } catch (parseError) {
      console.log(`[${requestId}] ❌ Failed to parse AI response:`, {
        error: parseError.message,
        response: aiResponse.substring(0, 500) + '...',
        jsonContent: jsonContent ? jsonContent.substring(0, 500) + '...' : 'undefined'
      })
      console.log(`[${requestId}] 🔍 Full AI response:`, aiResponse)
      console.log(`[${requestId}] 🔍 Extracted JSON content:`, jsonContent)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to parse AI response',
          details: parseError.message,
          response: aiResponse.substring(0, 1000)
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
  } catch (error) {
    const totalDuration = Date.now() - startTime
    console.log(`[${requestId}] ❌ Edge Function error after ${totalDuration}ms:`, {
      error: error.message,
      stack: error.stack
    })
    
    return new Response(
      JSON.stringify({ error: 'Failed to analyze workflow' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
