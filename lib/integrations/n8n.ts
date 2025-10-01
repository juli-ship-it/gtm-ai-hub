// n8n integration client
export interface N8NClient {
  triggerWorkflow: (webhookUrl: string, data: any) => Promise<N8NResponse>
  getWorkflowStatus: (executionId: string) => Promise<N8NExecutionStatus>
}

export interface N8NResponse {
  executionId: string
  status: 'queued' | 'running' | 'succeeded' | 'failed'
  webhookUrl: string
  data: any
}

export interface N8NExecutionStatus {
  executionId: string
  status: 'queued' | 'running' | 'succeeded' | 'failed'
  startedAt: string
  finishedAt?: string
  logs?: string
  result?: any
  error?: string
}

class MockN8NClient implements N8NClient {
  private isDevelopment = process.env.NODE_ENV === 'development'

  async triggerWorkflow(webhookUrl: string, data: any): Promise<N8NResponse> {
    if (!this.isDevelopment) {
      throw new Error('n8n integration not configured. Set NODE_ENV=development for mock mode.')
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))

    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Simulate async processing
    setTimeout(async () => {
      await this.simulateWorkflowExecution(executionId)
    }, 1000)

    return {
      executionId,
      status: 'queued',
      webhookUrl,
      data
    }
  }

  async getWorkflowStatus(executionId: string): Promise<N8NExecutionStatus> {
    if (!this.isDevelopment) {
      throw new Error('n8n integration not configured. Set NODE_ENV=development for mock mode.')
    }

    await new Promise(resolve => setTimeout(resolve, 200))

    // Simulate different statuses based on execution time
    const startTime = parseInt(executionId.split('_')[1])
    const elapsed = Date.now() - startTime

    if (elapsed < 2000) {
      return {
        executionId,
        status: 'running',
        startedAt: new Date(startTime).toISOString(),
        logs: 'Processing workflow...'
      }
    } else if (elapsed < 5000) {
      return {
        executionId,
        status: 'succeeded',
        startedAt: new Date(startTime).toISOString(),
        finishedAt: new Date(startTime + 3000).toISOString(),
        logs: 'Workflow completed successfully',
        result: {
          success: true,
          artifacts: {
            blog_post_id: 'blog_123',
            hubspot_draft_id: 'draft_456'
          }
        }
      }
    } else {
      return {
        executionId,
        status: 'failed',
        startedAt: new Date(startTime).toISOString(),
        finishedAt: new Date(startTime + 2000).toISOString(),
        logs: 'Workflow failed due to validation error',
        error: 'Invalid input data provided'
      }
    }
  }

  private async simulateWorkflowExecution(executionId: string): Promise<void> {
    // This would typically update the database via a webhook callback
    // For now, we'll just log it
    console.log(`Simulating workflow execution: ${executionId}`)
  }
}

class RealN8NClient implements N8NClient {
  private baseUrl: string
  private username: string
  private password: string

  constructor(baseUrl: string, username: string, password: string) {
    this.baseUrl = baseUrl
    this.username = username
    this.password = password
  }

  async triggerWorkflow(webhookUrl: string, data: any): Promise<N8NResponse> {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${this.username}:${this.password}`).toString('base64')}`
      },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      throw new Error(`Failed to trigger workflow: ${response.statusText}`)
    }

    const result = await response.json()
    return {
      executionId: result.executionId || `exec_${Date.now()}`,
      status: 'queued',
      webhookUrl,
      data
    }
  }

  async getWorkflowStatus(executionId: string): Promise<N8NExecutionStatus> {
    const response = await fetch(`${this.baseUrl}/api/v1/executions/${executionId}`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${this.username}:${this.password}`).toString('base64')}`
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to get workflow status: ${response.statusText}`)
    }

    const result = await response.json()
    return {
      executionId: result.id,
      status: result.status,
      startedAt: result.startedAt,
      finishedAt: result.finishedAt,
      logs: result.logs,
      result: result.result,
      error: result.error
    }
  }
}

export function createN8NClient(): N8NClient {
  const isDevelopment = process.env.NODE_ENV === 'development'
  const baseUrl = process.env.N8N_BASE_URL
  const username = process.env.N8N_BASIC_USER
  const password = process.env.N8N_BASIC_PASS

  if (isDevelopment || !baseUrl || !username || !password) {
    return new MockN8NClient()
  }

  return new RealN8NClient(baseUrl, username, password)
}
