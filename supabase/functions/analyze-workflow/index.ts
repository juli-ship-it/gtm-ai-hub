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
  
  try {
    const { prompt, workflow } = await req.json()
    
    // Check OpenAI API key
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
    // Call OpenAI API
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
    
    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text()
      throw new Error(`OpenAI API error: ${openaiResponse.status} - ${errorText}`)
    }
    
    const openaiData = await openaiResponse.json()
    const aiResponse = openaiData.choices[0].message.content
    
    // Parse the AI response - handle markdown code blocks
    let jsonContent = aiResponse
    try {
      // Extract JSON from markdown code blocks if present
      if (aiResponse.includes('```json')) {
        const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/)
        if (jsonMatch && jsonMatch[1]) {
          jsonContent = jsonMatch[1].trim()
        }
      } else if (aiResponse.includes('```')) {
        // Handle generic code blocks
        const codeMatch = aiResponse.match(/```\s*([\s\S]*?)\s*```/)
        if (codeMatch && codeMatch[1]) {
          jsonContent = codeMatch[1].trim()
        }
      }
      
      // If still no JSON content extracted, try to find JSON object in the response
      if (jsonContent === aiResponse) {
        const jsonObjectMatch = aiResponse.match(/\{[\s\S]*\}/)
        if (jsonObjectMatch && jsonObjectMatch[0]) {
          jsonContent = jsonObjectMatch[0].trim()
        }
      }
      
      const parsed = JSON.parse(jsonContent)
      
      return new Response(
        JSON.stringify(parsed),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    } catch (parseError) {
      return new Response(
        JSON.stringify({ 
          error: 'Failed to parse AI response',
          details: parseError.message
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to analyze workflow' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
