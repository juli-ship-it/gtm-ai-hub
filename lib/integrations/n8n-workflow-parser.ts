// n8n Workflow Parser for Template Variable Detection
// This module parses n8n workflow JSON to automatically detect variables and their types

export interface N8NWorkflow {
  id: string
  name: string
  nodes: N8NNode[]
  connections: Record<string, any>
  settings: Record<string, any>
  active: boolean
  versionId: string
  meta?: {
    templateCredsSetupCompleted?: boolean
    instanceId?: string
  }
}

export interface N8NNode {
  id: string
  name: string
  type: string
  typeVersion: number
  position: [number, number]
  parameters: Record<string, any>
  credentials?: {
    [key: string]: string
  }
  webhookId?: string
  continueOnFail?: boolean
  alwaysOutputData?: boolean
  executeOnce?: boolean
  retryOnFail?: boolean
  maxTries?: number
  waitBetweenTries?: number
  notes?: string
  disabled?: boolean
}

export interface DetectedVariable {
  name: string
  type: 'string' | 'number' | 'boolean' | 'file' | 'select' | 'multiselect' | 'date' | 'email' | 'url' | 'object'
  required: boolean
  description: string
  defaultValue?: any
  options?: string[]
  validation?: {
    min?: number
    max?: number
    pattern?: string
    fileTypes?: string[]
  }
  source: 'webhook' | 'expression' | 'parameter' | 'inferred'
  nodeId?: string
  nodeName?: string
}

export interface WorkflowAnalysis {
  variables: DetectedVariable[]
  systems: string[]
  estimatedDuration: number
  complexity: 'beginner' | 'intermediate' | 'advanced'
  hasFileUpload: boolean
  hasEmailNotification: boolean
  hasSlackNotification: boolean
  webhookNodes: N8NNode[]
  errorHandling: boolean
}

export class N8NWorkflowParser {
  private workflow: N8NWorkflow
  private detectedVariables: Map<string, DetectedVariable> = new Map()

  constructor(workflowJson: string | N8NWorkflow) {
    if (typeof workflowJson === 'string') {
      this.workflow = JSON.parse(workflowJson)
    } else {
      this.workflow = workflowJson
    }
  }

  /**
   * Analyze the workflow and detect all variables
   */
  analyzeWorkflow(): WorkflowAnalysis {
    this.detectedVariables.clear()

    // Find webhook nodes (entry points)
    const webhookNodes = this.findWebhookNodes()

    // Extract variables from webhook parameters
    webhookNodes.forEach((node: any) => this.extractWebhookVariables(node))

    // Scan all nodes for variable expressions
    this.workflow.nodes.forEach((node: any) => this.scanNodeForVariables(node))

    // Analyze workflow complexity and systems
    const systems = this.detectSystems()
    const complexity = this.assessComplexity()
    const hasFileUpload = this.detectFileUpload()
    const hasEmailNotification = this.detectEmailNotification()
    const hasSlackNotification = this.detectSlackNotification()
    const errorHandling = this.detectErrorHandling()

    return {
      variables: Array.from(this.detectedVariables.values()),
      systems,
      estimatedDuration: this.estimateDuration(),
      complexity,
      hasFileUpload,
      hasEmailNotification,
      hasSlackNotification,
      webhookNodes,
      errorHandling
    }
  }

  /**
   * Find all webhook nodes in the workflow
   */
  private findWebhookNodes(): N8NNode[] {
    return this.workflow.nodes.filter(node =>
      node.type === 'n8n-nodes-base.webhook' ||
      node.type === 'n8n-nodes-base.webhookResponse'
    )
  }

  /**
   * Extract variables from webhook node parameters
   */
  private extractWebhookVariables(node: N8NNode): void {
    if (node.parameters.path) {
      // Extract path parameters like /webhook/:id
      const pathParams = node.parameters.path.match(/:(\w+)/g)
      if (pathParams) {
        pathParams.forEach((param: string) => {
          const name = param.substring(1) // Remove the :
          this.addVariable(name, 'string', true, `Path parameter: ${name}`, 'webhook', node)
        })
      }
    }

    // Check for query parameters or body parameters
    if (node.parameters.options?.queryParameters) {
      node.parameters.options.queryParameters.forEach((param: any) => {
        this.addVariable(param.name, 'string', false, `Query parameter: ${param.name}`, 'webhook', node)
      })
    }
  }

  /**
   * Scan a node for variable expressions like {{ $json.variableName }}
   */
  private scanNodeForVariables(node: N8NNode): void {
    const nodeParams = JSON.stringify(node.parameters)
    const variableMatches = nodeParams.match(/\{\{\s*\$json\.(\w+)\s*\}\}/g)

    if (variableMatches) {
      variableMatches.forEach((match: string) => {
        const variableName = match.match(/\{\{\s*\$json\.(\w+)\s*\}\}/)?.[1]
        if (variableName && !this.detectedVariables.has(variableName)) {
          const type = this.inferVariableType(variableName, node)
          const required = this.isVariableRequired(variableName, node)
          const description = this.generateVariableDescription(variableName, node)

          this.addVariable(variableName, type, required, description, 'expression', node)
        }
      })
    }

    // Check for specific node types that might have special variable patterns
    this.checkNodeSpecificVariables(node)
  }

  /**
   * Check for node-specific variable patterns
   */
  private checkNodeSpecificVariables(node: N8NNode): void {
    switch (node.type) {
      case 'n8n-nodes-base.hubspot':
        this.checkHubSpotVariables(node)
        break
      case 'n8n-nodes-base.slack':
        this.checkSlackVariables(node)
        break
      case 'n8n-nodes-base.emailSend':
        this.checkEmailVariables(node)
        break
      case 'n8n-nodes-base.googleSheets':
        this.checkGoogleSheetsVariables(node)
        break
      case 'n8n-nodes-base.excel':
        this.checkExcelVariables(node)
        break
      case 'n8n-nodes-base.httpRequest':
        this.checkHttpRequestVariables(node)
        break
    }
  }

  /**
   * Check for HubSpot-specific variables
   */
  private checkHubSpotVariables(node: N8NNode): void {
    if (node.parameters.resource === 'contact' && node.parameters.operation === 'getAll') {
      if (node.parameters.filters?.property) {
        node.parameters.filters.property.forEach((prop: any) => {
          this.addVariable(prop.property, 'string', false, `HubSpot contact property: ${prop.property}`, 'parameter', node)
        })
      }
    }

    if (node.parameters.resource === 'segment') {
      this.addVariable('segment_id', 'string', true, 'HubSpot segment ID', 'parameter', node)
    }
  }

  /**
   * Check for Slack-specific variables
   */
  private checkSlackVariables(node: N8NNode): void {
    if (node.parameters.resource === 'message' && node.parameters.operation === 'post') {
      this.addVariable('slack_channel', 'string', false, 'Slack channel for notifications', 'parameter', node)
      this.addVariable('slack_message', 'string', false, 'Slack message content', 'parameter', node)
    }
  }

  /**
   * Check for email-specific variables
   */
  private checkEmailVariables(node: N8NNode): void {
    this.addVariable('email_to', 'email', true, 'Email recipient address', 'parameter', node)
    this.addVariable('email_subject', 'string', false, 'Email subject line', 'parameter', node)
    this.addVariable('email_body', 'string', false, 'Email body content', 'parameter', node)
  }

  /**
   * Check for Google Sheets variables
   */
  private checkGoogleSheetsVariables(node: N8NNode): void {
    this.addVariable('spreadsheet_id', 'string', true, 'Google Sheets spreadsheet ID', 'parameter', node)
    this.addVariable('sheet_name', 'string', false, 'Sheet name within the spreadsheet', 'parameter', node)
  }

  /**
   * Check for Excel variables
   */
  private checkExcelVariables(node: N8NNode): void {
    this.addVariable('excel_filename', 'string', false, 'Excel file name', 'parameter', node)
    this.addVariable('excel_sheet_name', 'string', false, 'Excel sheet name', 'parameter', node)
  }

  /**
   * Check for HTTP request variables
   */
  private checkHttpRequestVariables(node: N8NNode): void {
    if (node.parameters.url && node.parameters.url.includes('{{')) {
      const urlMatches = node.parameters.url.match(/\{\{\s*\$json\.(\w+)\s*\}\}/g)
      if (urlMatches) {
        urlMatches.forEach((match: string) => {
          const variableName = match.match(/\{\{\s*\$json\.(\w+)\s*\}\}/)?.[1]
          if (variableName) {
            this.addVariable(variableName, 'url', true, `URL parameter: ${variableName}`, 'parameter', node)
          }
        })
      }
    }
  }

  /**
   * Infer variable type based on name and context
   */
  private inferVariableType(variableName: string, node: N8NNode): DetectedVariable['type'] {
    const name = variableName.toLowerCase()

    // Email patterns
    if (name.includes('email') || name.includes('mail')) {
      return 'email'
    }

    // URL patterns
    if (name.includes('url') || name.includes('link') || name.includes('endpoint')) {
      return 'url'
    }

    // Date patterns
    if (name.includes('date') || name.includes('time') || name.includes('timestamp')) {
      return 'date'
    }

    // Boolean patterns
    if (name.includes('enabled') || name.includes('active') || name.includes('notify') || name.includes('send')) {
      return 'boolean'
    }

    // Number patterns
    if (name.includes('count') || name.includes('limit') || name.includes('size') || name.includes('number')) {
      return 'number'
    }

    // File patterns
    if (name.includes('file') || name.includes('upload') || name.includes('attachment')) {
      return 'file'
    }

    // Default to string
    return 'string'
  }

  /**
   * Check if a variable is required based on context
   */
  private isVariableRequired(variableName: string, node: N8NNode): boolean {
    // Check if variable is used in required fields
    const requiredFields = ['id', 'segment_id', 'email_to', 'spreadsheet_id']
    return requiredFields.some(field => variableName.toLowerCase().includes(field))
  }

  /**
   * Generate a description for a variable
   */
  private generateVariableDescription(variableName: string, node: N8NNode): string {
    const nodeName = node.name || node.type
    return `Variable used in ${nodeName}: ${variableName}`
  }

  /**
   * Add a variable to the detected variables map
   */
  private addVariable(
    name: string,
    type: DetectedVariable['type'],
    required: boolean,
    description: string,
    source: DetectedVariable['source'],
    node: N8NNode
  ): void {
    // Don't override existing variables with better information
    if (this.detectedVariables.has(name)) {
      const existing = this.detectedVariables.get(name)!
      if (existing.source === 'webhook' && source !== 'webhook') {
        return // Keep webhook source as it's more reliable
      }
    }

    this.detectedVariables.set(name, {
      name,
      type,
      required,
      description,
      source,
      nodeId: node.id,
      nodeName: node.name
    })
  }

  /**
   * Detect systems used in the workflow
   */
  private detectSystems(): string[] {
    const systems = new Set<string>()

    this.workflow.nodes.forEach((node: any) => {
      switch (node.type) {
        case 'n8n-nodes-base.hubspot':
          systems.add('hubspot')
          break
        case 'n8n-nodes-base.slack':
          systems.add('slack')
          break
        case 'n8n-nodes-base.googleSheets':
          systems.add('google-sheets')
          break
        case 'n8n-nodes-base.excel':
          systems.add('excel')
          break
        case 'n8n-nodes-base.emailSend':
          systems.add('email')
          break
        case 'n8n-nodes-base.httpRequest':
          systems.add('http-api')
          break
        case 'n8n-nodes-base.salesforce':
          systems.add('salesforce')
          break
        case 'n8n-nodes-base.pipedrive':
          systems.add('pipedrive')
          break
        case 'n8n-nodes-base.zendesk':
          systems.add('zendesk')
          break
      }
    })

    return Array.from(systems)
  }

  /**
   * Assess workflow complexity
   */
  private assessComplexity(): 'beginner' | 'intermediate' | 'advanced' {
    const nodeCount = this.workflow.nodes.length
    const hasConditionals = this.workflow.nodes.some(node =>
      node.type === 'n8n-nodes-base.if' ||
      node.type === 'n8n-nodes-base.switch'
    )
    const hasLoops = this.workflow.nodes.some(node =>
      node.type === 'n8n-nodes-base.splitInBatches' ||
      node.type === 'n8n-nodes-base.merge'
    )
    const hasErrorHandling = this.detectErrorHandling()
    const systemCount = this.detectSystems().length

    if (nodeCount <= 5 && !hasConditionals && !hasLoops && systemCount <= 2) {
      return 'beginner'
    } else if (nodeCount <= 15 && systemCount <= 4) {
      return 'intermediate'
    } else {
      return 'advanced'
    }
  }

  /**
   * Detect if workflow has file upload capabilities
   */
  private detectFileUpload(): boolean {
    return this.workflow.nodes.some(node =>
      node.type === 'n8n-nodes-base.readBinaryFile' ||
      node.type === 'n8n-nodes-base.readBinaryFiles' ||
      node.type === 'n8n-nodes-base.googleDrive' ||
      node.type === 'n8n-nodes-base.dropbox'
    )
  }

  /**
   * Detect if workflow has email notification
   */
  private detectEmailNotification(): boolean {
    return this.workflow.nodes.some(node =>
      node.type === 'n8n-nodes-base.emailSend' ||
      node.type === 'n8n-nodes-base.gmail'
    )
  }

  /**
   * Detect if workflow has Slack notification
   */
  private detectSlackNotification(): boolean {
    return this.workflow.nodes.some(node =>
      node.type === 'n8n-nodes-base.slack'
    )
  }

  /**
   * Detect if workflow has error handling
   */
  private detectErrorHandling(): boolean {
    return this.workflow.nodes.some(node =>
      node.type === 'n8n-nodes-base.if' ||
      node.type === 'n8n-nodes-base.switch' ||
      node.continueOnFail === true ||
      node.retryOnFail === true
    )
  }

  /**
   * Estimate workflow duration in minutes
   */
  private estimateDuration(): number {
    const nodeCount = this.workflow.nodes.length
    const hasExternalAPIs = this.workflow.nodes.some(node =>
      node.type.includes('httpRequest') ||
      node.type.includes('hubspot') ||
      node.type.includes('slack')
    )

    // Base time: 1 minute per node
    let duration = nodeCount

    // Add time for external API calls
    if (hasExternalAPIs) {
      duration += 2
    }

    // Add time for file operations
    if (this.detectFileUpload()) {
      duration += 3
    }

    return Math.max(duration, 1) // Minimum 1 minute
  }

  /**
   * Get the original workflow
   */
  getWorkflow(): N8NWorkflow {
    return this.workflow
  }

  /**
   * Get detected variables
   */
  getDetectedVariables(): DetectedVariable[] {
    return Array.from(this.detectedVariables.values())
  }

  /**
   * Validate workflow structure
   */
  validateWorkflow(): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!this.workflow.nodes || !Array.isArray(this.workflow.nodes)) {
      errors.push('Workflow must have a nodes array')
    }

    if (!this.workflow.connections) {
      errors.push('Workflow must have connections')
    }

    const webhookNodes = this.findWebhookNodes()
    if (webhookNodes.length === 0) {
      errors.push('Workflow must have at least one webhook node')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }
}

/**
 * Utility function to parse n8n workflow and return analysis
 */
export function parseN8NWorkflow(workflowJson: string | N8NWorkflow): WorkflowAnalysis {
  const parser = new N8NWorkflowParser(workflowJson)
  return parser.analyzeWorkflow()
}

/**
 * Utility function to extract variables from workflow
 */
export function extractWorkflowVariables(workflowJson: string | N8NWorkflow): DetectedVariable[] {
  const parser = new N8NWorkflowParser(workflowJson)
  return parser.getDetectedVariables()
}
