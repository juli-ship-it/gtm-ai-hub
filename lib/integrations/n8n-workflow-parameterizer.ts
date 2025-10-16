// n8n Workflow Parameterizer
// This module identifies hardcoded values in n8n workflows and converts them to variables

export interface HardcodedValue {
  path: string // JSONPath to the value in the workflow
  value: any // The hardcoded value
  type: 'string' | 'number' | 'boolean' | 'array' | 'object'
  description: string
  category: 'credential' | 'configuration' | 'data' | 'ui'
  isRequired: boolean
  suggestedName: string
  validation?: {
    min?: number
    max?: number
    pattern?: string
    options?: string[]
    fileTypes?: string[]
  }
  nodeId: string
  nodeName: string
  parameterName: string
}

export interface CredentialInfo {
  name: string
  type: string
  description: string
  required: boolean
  nodeId: string
  nodeName: string
  parameterName: string
}

export interface ParameterizedWorkflow {
  originalWorkflow: any
  parameterizedWorkflow: any
  hardcodedValues: HardcodedValue[]
  credentials: CredentialInfo[]
  variables: HardcodedValue[]
  template: {
    name: string
    description: string
    category: string
    systems: string[]
    estimatedDuration: number
    complexity: 'beginner' | 'intermediate' | 'advanced'
  }
}

export class N8NWorkflowParameterizer {
  private workflow: any
  private hardcodedValues: HardcodedValue[] = []
  private credentials: CredentialInfo[] = []

  constructor(workflow: any) {
    this.workflow = workflow
  }

  /**
   * Analyze workflow and identify all hardcoded values that should be parameterized
   */
  analyzeWorkflow(): ParameterizedWorkflow {
    this.hardcodedValues = []
    this.credentials = []

    // Analyze each node for hardcoded values
    this.workflow.nodes?.forEach((node: any) => {
      this.analyzeNode(node)
    })

    // Categorize values
    const variables = this.hardcodedValues.filter(v => v.category !== 'credential')
    const credentials = this.credentials

    // Create parameterized workflow
    const parameterizedWorkflow = this.createParameterizedWorkflow()

    return {
      originalWorkflow: this.workflow,
      parameterizedWorkflow,
      hardcodedValues: this.hardcodedValues,
      credentials,
      variables,
      template: this.generateTemplateInfo()
    }
  }

  /**
   * Analyze a single node for hardcoded values
   */
  private analyzeNode(node: any): void {
    const nodeType = node.type
    const nodeName = node.name || nodeType

    // Analyze based on node type
    switch (nodeType) {
      case 'n8n-nodes-base.hubspot':
        this.analyzeHubSpotNode(node)
        break
      case 'n8n-nodes-base.slack':
        this.analyzeSlackNode(node)
        break
      case 'n8n-nodes-base.googleSheets':
        this.analyzeGoogleSheetsNode(node)
        break
      case 'n8n-nodes-base.excel':
        this.analyzeExcelNode(node)
        break
      case 'n8n-nodes-base.emailSend':
        this.analyzeEmailNode(node)
        break
      case 'n8n-nodes-base.httpRequest':
        this.analyzeHttpRequestNode(node)
        break
      case 'n8n-nodes-base.webhook':
        this.analyzeWebhookNode(node)
        break
      default:
        this.analyzeGenericNode(node)
    }

    // Check for credentials
    this.analyzeCredentials(node)
  }

  /**
   * Analyze HubSpot node for hardcoded values
   */
  private analyzeHubSpotNode(node: any): void {
    const params = node.parameters || {}

    // Segment ID
    if (params.segmentId && typeof params.segmentId === 'string' && !params.segmentId.includes('{{')) {
      this.addHardcodedValue({
        path: `nodes[${this.getNodeIndex(node.id)}].parameters.segmentId`,
        value: params.segmentId,
        type: 'string',
        description: 'HubSpot segment ID to export contacts from',
        category: 'data',
        isRequired: true,
        suggestedName: 'hubspot_segment_id',
        nodeId: node.id,
        nodeName: node.name,
        parameterName: 'segmentId'
      })
    }

    // Contact properties
    if (params.filters?.property) {
      params.filters.property.forEach((prop: any, index: number) => {
        if (prop.property && typeof prop.property === 'string' && !prop.property.includes('{{')) {
          this.addHardcodedValue({
            path: `nodes[${this.getNodeIndex(node.id)}].parameters.filters.property[${index}].property`,
            value: prop.property,
            type: 'string',
            description: `HubSpot contact property: ${prop.property}`,
            category: 'configuration',
            isRequired: false,
            suggestedName: `hubspot_property_${index + 1}`,
            nodeId: node.id,
            nodeName: node.name,
            parameterName: `filters.property[${index}].property`
          })
        }
      })
    }

    // Object type
    if (params.resource && typeof params.resource === 'string' && !params.resource.includes('{{')) {
      this.addHardcodedValue({
        path: `nodes[${this.getNodeIndex(node.id)}].parameters.resource`,
        value: params.resource,
        type: 'string',
        description: 'HubSpot object type (contact, company, deal, etc.)',
        category: 'configuration',
        isRequired: true,
        suggestedName: 'hubspot_object_type',
        validation: {
          options: ['contact', 'company', 'deal', 'ticket', 'product', 'line_item']
        },
        nodeId: node.id,
        nodeName: node.name,
        parameterName: 'resource'
      })
    }
  }

  /**
   * Analyze Google Sheets node for hardcoded values
   */
  private analyzeGoogleSheetsNode(node: any): void {
    const params = node.parameters || {}

    // Spreadsheet ID
    if (params.spreadsheetId && typeof params.spreadsheetId === 'string' && !params.spreadsheetId.includes('{{')) {
      this.addHardcodedValue({
        path: `nodes[${this.getNodeIndex(node.id)}].parameters.spreadsheetId`,
        value: params.spreadsheetId,
        type: 'string',
        description: 'Google Sheets spreadsheet ID',
        category: 'data',
        isRequired: true,
        suggestedName: 'google_sheets_id',
        nodeId: node.id,
        nodeName: node.name,
        parameterName: 'spreadsheetId'
      })
    }

    // Sheet name
    if (params.sheetName && typeof params.sheetName === 'string' && !params.sheetName.includes('{{')) {
      this.addHardcodedValue({
        path: `nodes[${this.getNodeIndex(node.id)}].parameters.sheetName`,
        value: params.sheetName,
        type: 'string',
        description: 'Google Sheets sheet name',
        category: 'data',
        isRequired: true,
        suggestedName: 'google_sheets_sheet_name',
        nodeId: node.id,
        nodeName: node.name,
        parameterName: 'sheetName'
      })
    }

    // Range
    if (params.range && typeof params.range === 'string' && !params.range.includes('{{')) {
      this.addHardcodedValue({
        path: `nodes[${this.getNodeIndex(node.id)}].parameters.range`,
        value: params.range,
        type: 'string',
        description: 'Google Sheets range (e.g., A1:Z100)',
        category: 'data',
        isRequired: false,
        suggestedName: 'google_sheets_range',
        nodeId: node.id,
        nodeName: node.name,
        parameterName: 'range'
      })
    }
  }

  /**
   * Analyze Excel node for hardcoded values
   */
  private analyzeExcelNode(node: any): void {
    const params = node.parameters || {}

    // File name
    if (params.fileName && typeof params.fileName === 'string' && !params.fileName.includes('{{')) {
      this.addHardcodedValue({
        path: `nodes[${this.getNodeIndex(node.id)}].parameters.fileName`,
        value: params.fileName,
        type: 'string',
        description: 'Excel file name',
        category: 'data',
        isRequired: true,
        suggestedName: 'excel_filename',
        nodeId: node.id,
        nodeName: node.name,
        parameterName: 'fileName'
      })
    }

    // Sheet name
    if (params.sheetName && typeof params.sheetName === 'string' && !params.sheetName.includes('{{')) {
      this.addHardcodedValue({
        path: `nodes[${this.getNodeIndex(node.id)}].parameters.sheetName`,
        value: params.sheetName,
        type: 'string',
        description: 'Excel sheet name',
        category: 'data',
        isRequired: false,
        suggestedName: 'excel_sheet_name',
        nodeId: node.id,
        nodeName: node.name,
        parameterName: 'sheetName'
      })
    }
  }

  /**
   * Analyze Slack node for hardcoded values
   */
  private analyzeSlackNode(node: any): void {
    const params = node.parameters || {}

    // Channel
    if (params.channel && typeof params.channel === 'string' && !params.channel.includes('{{')) {
      this.addHardcodedValue({
        path: `nodes[${this.getNodeIndex(node.id)}].parameters.channel`,
        value: params.channel,
        type: 'string',
        description: 'Slack channel for notifications',
        category: 'configuration',
        isRequired: false,
        suggestedName: 'slack_channel',
        nodeId: node.id,
        nodeName: node.name,
        parameterName: 'channel'
      })
    }

    // Message text
    if (params.text && typeof params.text === 'string' && !params.text.includes('{{')) {
      this.addHardcodedValue({
        path: `nodes[${this.getNodeIndex(node.id)}].parameters.text`,
        value: params.text,
        type: 'string',
        description: 'Slack message text',
        category: 'ui',
        isRequired: false,
        suggestedName: 'slack_message',
        nodeId: node.id,
        nodeName: node.name,
        parameterName: 'text'
      })
    }
  }

  /**
   * Analyze Email node for hardcoded values
   */
  private analyzeEmailNode(node: any): void {
    const params = node.parameters || {}

    // To email
    if (params.toEmail && typeof params.toEmail === 'string' && !params.toEmail.includes('{{')) {
      this.addHardcodedValue({
        path: `nodes[${this.getNodeIndex(node.id)}].parameters.toEmail`,
        value: params.toEmail,
        type: 'string',
        description: 'Email recipient address',
        category: 'data',
        isRequired: true,
        suggestedName: 'email_to',
        validation: {
          pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$'
        },
        nodeId: node.id,
        nodeName: node.name,
        parameterName: 'toEmail'
      })
    }

    // Subject
    if (params.subject && typeof params.subject === 'string' && !params.subject.includes('{{')) {
      this.addHardcodedValue({
        path: `nodes[${this.getNodeIndex(node.id)}].parameters.subject`,
        value: params.subject,
        type: 'string',
        description: 'Email subject line',
        category: 'ui',
        isRequired: false,
        suggestedName: 'email_subject',
        nodeId: node.id,
        nodeName: node.name,
        parameterName: 'subject'
      })
    }
  }

  /**
   * Analyze HTTP Request node for hardcoded values
   */
  private analyzeHttpRequestNode(node: any): void {
    const params = node.parameters || {}

    // URL
    if (params.url && typeof params.url === 'string' && !params.url.includes('{{')) {
      this.addHardcodedValue({
        path: `nodes[${this.getNodeIndex(node.id)}].parameters.url`,
        value: params.url,
        type: 'string',
        description: 'API endpoint URL',
        category: 'data',
        isRequired: true,
        suggestedName: 'api_url',
        validation: {
          pattern: '^https?://.+'
        },
        nodeId: node.id,
        nodeName: node.name,
        parameterName: 'url'
      })
    }

    // Headers
    if (params.headers) {
      Object.entries(params.headers).forEach(([key, value]) => {
        if (typeof value === 'string' && !value.includes('{{')) {
          this.addHardcodedValue({
            path: `nodes[${this.getNodeIndex(node.id)}].parameters.headers.${key}`,
            value: value,
            type: 'string',
            description: `HTTP header: ${key}`,
            category: 'configuration',
            isRequired: false,
            suggestedName: `header_${key.toLowerCase()}`,
            nodeId: node.id,
            nodeName: node.name,
            parameterName: `headers.${key}`
          })
        }
      })
    }
  }

  /**
   * Analyze Webhook node for hardcoded values
   */
  private analyzeWebhookNode(node: any): void {
    const params = node.parameters || {}

    // Path
    if (params.path && typeof params.path === 'string' && !params.path.includes('{{')) {
      this.addHardcodedValue({
        path: `nodes[${this.getNodeIndex(node.id)}].parameters.path`,
        value: params.path,
        type: 'string',
        description: 'Webhook path',
        category: 'configuration',
        isRequired: true,
        suggestedName: 'webhook_path',
        nodeId: node.id,
        nodeName: node.name,
        parameterName: 'path'
      })
    }
  }

  /**
   * Analyze generic node for hardcoded values
   */
  private analyzeGenericNode(node: any): void {
    const params = node.parameters || {}
    
    // Look for common hardcoded patterns
    this.findHardcodedValuesInObject(params, `nodes[${this.getNodeIndex(node.id)}].parameters`, node)
  }

  /**
   * Recursively find hardcoded values in an object
   */
  private findHardcodedValuesInObject(obj: any, path: string, node: any): void {
    if (typeof obj === 'string' && !obj.includes('{{') && obj.length > 0) {
      // Skip very short strings and common n8n expressions
      if (obj.length > 2 && !['true', 'false', 'null'].includes(obj)) {
        this.addHardcodedValue({
          path,
          value: obj,
          type: 'string',
          description: `Hardcoded value: ${obj}`,
          category: 'configuration',
          isRequired: false,
          suggestedName: this.generateVariableName(path, obj),
          nodeId: node.id,
          nodeName: node.name,
          parameterName: path.split('.').pop() || 'value'
        })
      }
    } else if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        this.findHardcodedValuesInObject(item, `${path}[${index}]`, node)
      })
    } else if (typeof obj === 'object' && obj !== null) {
      Object.entries(obj).forEach(([key, value]) => {
        this.findHardcodedValuesInObject(value, `${path}.${key}`, node)
      })
    }
  }

  /**
   * Analyze credentials in a node
   */
  private analyzeCredentials(node: any): void {
    if (node.credentials) {
      Object.entries(node.credentials).forEach(([credType, credName]) => {
        this.credentials.push({
          name: credName as string,
          type: credType,
          description: this.getCredentialDescription(credType as string),
          required: true,
          nodeId: node.id,
          nodeName: node.name,
          parameterName: credType
        })
      })
    }
  }

  /**
   * Get credential description based on type
   */
  private getCredentialDescription(credType: string): string {
    const descriptions: Record<string, string> = {
      'hubspotApi': 'HubSpot API credentials',
      'slackApi': 'Slack API credentials',
      'googleSheetsOAuth2Api': 'Google Sheets OAuth2 credentials',
      'googleApi': 'Google API credentials',
      'emailSend': 'Email service credentials',
      'httpBasicAuth': 'HTTP Basic Authentication',
      'httpHeaderAuth': 'HTTP Header Authentication',
      'httpDigestAuth': 'HTTP Digest Authentication'
    }
    return descriptions[credType] || `${credType} credentials`
  }

  /**
   * Add a hardcoded value to the list
   */
  private addHardcodedValue(value: Omit<HardcodedValue, 'path'> & { path: string }): void {
    // Check if we already have a similar value
    const existing = this.hardcodedValues.find(v => 
      v.nodeId === value.nodeId && 
      v.parameterName === value.parameterName
    )

    if (!existing) {
      this.hardcodedValues.push(value as HardcodedValue)
    }
  }

  /**
   * Generate a variable name from path and value
   */
  private generateVariableName(path: string, value: string): string {
    const parts = path.split('.')
    const lastPart = parts[parts.length - 1]
    
    // Clean up the name
    let name = lastPart
      .replace(/\[.*?\]/g, '') // Remove array indices
      .replace(/([A-Z])/g, '_$1') // Convert camelCase to snake_case
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '_') // Replace special chars with underscores
      .replace(/_+/g, '_') // Replace multiple underscores with single
      .replace(/^_|_$/g, '') // Remove leading/trailing underscores

    // If name is too generic, use value
    if (name.length < 3 || ['value', 'param', 'data'].includes(name)) {
      name = value
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '')
        .substring(0, 20)
    }

    return name || 'variable'
  }

  /**
   * Get node index in the workflow
   */
  private getNodeIndex(nodeId: string): number {
    return this.workflow.nodes?.findIndex((n: any) => n.id === nodeId) || 0
  }

  /**
   * Create parameterized workflow with variables
   */
  private createParameterizedWorkflow(): any {
    const parameterized = JSON.parse(JSON.stringify(this.workflow))

    // Replace hardcoded values with variables
    this.hardcodedValues.forEach(hardcoded => {
      const pathParts = hardcoded.path.split('.')
      let current = parameterized

      // Navigate to the parent object
      for (let i = 0; i < pathParts.length - 1; i++) {
        const part = pathParts[i]
        if (part.includes('[') && part.includes(']')) {
          const [arrayName, index] = part.split('[')
          const arrayIndex = parseInt(index.replace(']', ''))
          current = current[arrayName][arrayIndex]
        } else {
          current = current[part]
        }
      }

      // Set the variable
      const lastPart = pathParts[pathParts.length - 1]
      if (lastPart.includes('[') && lastPart.includes(']')) {
        const [arrayName, index] = lastPart.split('[')
        const arrayIndex = parseInt(index.replace(']', ''))
        current[arrayName][arrayIndex] = `{{ $json.${hardcoded.suggestedName} }}`
      } else {
        current[lastPart] = `{{ $json.${hardcoded.suggestedName} }}`
      }
    })

    return parameterized
  }

  /**
   * Generate template information
   */
  private generateTemplateInfo() {
    const systems = new Set<string>()
    this.workflow.nodes?.forEach((node: any) => {
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
      }
    })

    const nodeCount = this.workflow.nodes?.length || 0
    const complexity: 'beginner' | 'intermediate' | 'advanced' = nodeCount <= 5 ? 'beginner' : nodeCount <= 15 ? 'intermediate' : 'advanced'

    return {
      name: this.workflow.name || 'Parameterized Workflow',
      description: `Automated workflow with ${this.hardcodedValues.length} configurable parameters`,
      category: 'reporting',
      systems: Array.from(systems),
      estimatedDuration: Math.max(nodeCount * 2, 5),
      complexity
    }
  }
}

/**
 * Utility function to parameterize a workflow
 */
export function parameterizeN8NWorkflow(workflow: any): ParameterizedWorkflow {
  const parameterizer = new N8NWorkflowParameterizer(workflow)
  return parameterizer.analyzeWorkflow()
}
