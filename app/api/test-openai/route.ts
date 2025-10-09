import { NextResponse } from 'next/server'
import fetch from 'node-fetch'

export async function POST() {
  try {
    const openaiApiKey = process.env.OPENAI_API_KEY
    if (!openaiApiKey) {
      return NextResponse.json({ error: 'No OpenAI API key' }, { status: 500 })
    }

    console.log('🤖 Testing OpenAI API...')
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: 'Say "Hello, this is a test"'
          }
        ],
        max_tokens: 10
      }),
      // Add agent to handle TLS issues in development
      agent: process.env.NODE_ENV === 'development' ? new (require('https').Agent)({
        rejectUnauthorized: false
      }) : undefined
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json({ 
        error: 'OpenAI API error', 
        status: response.status,
        details: errorText 
      }, { status: 500 })
    }
    
    const data = await response.json()
    return NextResponse.json({ 
      success: true, 
      response: data.choices[0].message.content 
    })
    
  } catch (error) {
    console.error('OpenAI test error:', error)
    return NextResponse.json({ 
      error: 'OpenAI test failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
