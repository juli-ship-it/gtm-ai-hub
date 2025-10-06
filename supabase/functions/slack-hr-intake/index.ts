// Deno.serve is the Deno way to create HTTP servers
Deno.serve(async (req: Request) => {
  console.log(`[${new Date().toISOString()}] ULTRA SIMPLE HR University intake request received: ${req.method} ${req.url}`)
  
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Supabase-Service-Role',
      },
    })
  }

  // Return immediately without any processing
  return new Response(JSON.stringify({ 
    success: true, 
    message: 'Ultra simple HR University intake request received successfully',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url
  }), {
    status: 200,
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  })
})

