import { NextRequest, NextResponse } from 'next/server'
// import { createCrayonMCPClient } from '@/lib/integrations/crayon-mcp'

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Rate limiting configuration
const RATE_LIMIT = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per window
}

function getRateLimitKey(ip: string): string {
  return `crayon_mcp_${ip}`
}

function checkRateLimit(ip: string): boolean {
  const key = getRateLimitKey(ip)
  const now = Date.now()
  const windowStart = now - RATE_LIMIT.windowMs

  const current = rateLimitStore.get(key)

  if (!current || current.resetTime < windowStart) {
    rateLimitStore.set(key, { count: 1, resetTime: now })
    return true
  }

  if (current.count >= RATE_LIMIT.maxRequests) {
    return false
  }

  current.count++
  return true
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  return forwarded?.split(',')[0] || realIP || 'unknown'
}

// Supported Crayon MCP operations
const SUPPORTED_OPERATIONS = [
  'get_battlecard',
  'get_win_loss_stories',
  'get_competitor_profile',
  'get_objection_handling',
  'get_competitive_positioning',
  'get_deal_intelligence',
  'get_market_alerts',
  'get_competitor_news',
  'get_market_trends'
]

export async function POST(request: NextRequest) {
  try {
    // Check if Crayon MCP is enabled
    if (process.env.CRAYON_MCP_ENABLED !== 'true') {
      return NextResponse.json(
        { error: 'Crayon MCP integration is not enabled' },
        { status: 503 }
      )
    }

    // Rate limiting
    const clientIP = getClientIP(request)
    if (!checkRateLimit(clientIP)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { operation, params = {} } = body

    // Validate operation
    if (!operation || !SUPPORTED_OPERATIONS.includes(operation)) {
      return NextResponse.json(
        {
          error: 'Invalid or unsupported operation',
          supportedOperations: SUPPORTED_OPERATIONS
        },
        { status: 400 }
      )
    }

    // Validate required parameters based on operation
    const validationError = validateOperationParams(operation, params)
    if (validationError) {
      return NextResponse.json(
        { error: validationError },
        { status: 400 }
      )
    }

    // Create Crayon MCP client
    // const crayonClient = createCrayonMCPClient()

    // Execute the requested operation
    // Crayon MCP client temporarily disabled
    const result = {
      message: 'Crayon MCP client temporarily disabled',
      operation,
      params
    }

    // Log successful operation (if audit logging is enabled)
    if (process.env.CRAYON_MCP_AUDIT_LOGGING === 'true') {
      console.log(`Crayon MCP operation: ${operation}`, {
        clientIP,
        params,
        timestamp: new Date().toISOString()
      })
    }

    return NextResponse.json({
      success: true,
      operation,
      data: result,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Crayon MCP API error:', error)

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : 'Something went wrong'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check if Crayon MCP is enabled
    if (process.env.CRAYON_MCP_ENABLED !== 'true') {
      return NextResponse.json(
        { error: 'Crayon MCP integration is not enabled' },
        { status: 503 }
      )
    }

    // Return API information
    return NextResponse.json({
      name: 'Crayon MCP API',
      version: '1.0.0',
      description: 'Competitive intelligence API powered by Crayon MCP',
      enabled: true,
      supportedOperations: SUPPORTED_OPERATIONS,
      rateLimit: {
        windowMs: RATE_LIMIT.windowMs,
        maxRequests: RATE_LIMIT.maxRequests
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Crayon MCP API info error:', error)

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function validateOperationParams(operation: string, params: any): string | null {
  switch (operation) {
    case 'get_battlecard':
      if (!params.competitor || typeof params.competitor !== 'string') {
        return 'competitor parameter is required and must be a string'
      }
      break

    case 'get_competitor_profile':
      if (!params.competitor || typeof params.competitor !== 'string') {
        return 'competitor parameter is required and must be a string'
      }
      break

    case 'get_win_loss_stories':
    case 'get_objection_handling':
    case 'get_competitive_positioning':
    case 'get_deal_intelligence':
    case 'get_market_alerts':
    case 'get_competitor_news':
    case 'get_market_trends':
      // These operations have optional parameters
      break

    default:
      return 'Unknown operation'
  }

  // Validate common parameters
  if (params.options) {
    if (typeof params.options !== 'object') {
      return 'options parameter must be an object'
    }

    // Validate timeRange if provided
    if (params.options.timeRange && typeof params.options.timeRange !== 'string') {
      return 'timeRange must be a string'
    }

    // Validate limit if provided
    if (params.options.limit && (typeof params.options.limit !== 'number' || params.options.limit <= 0)) {
      return 'limit must be a positive number'
    }

    // Validate include array if provided
    if (params.options.include && !Array.isArray(params.options.include)) {
      return 'include must be an array'
    }
  }

  return null
}
