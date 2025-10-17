// Smart Workflow Parser - Understands business logic and extracts meaningful variables
import { N8NWorkflow, N8NNode } from './n8n-workflow-parser'

export interface SmartWorkflowAnalysis {
  workflowName: string
  workflowDescription: string
  businessLogic: string
  detectedVariables: SmartVariable[]
  systems: string[]
  complexity: 'simple' | 'intermediate' | 'advanced'
  estimatedDuration: number
  hasFileUpload: boolean
  hasEmailNotification: boolean
  hasSlackNotification: boolean
  errorHandling: boolean
  webhookNodes: N8NNode[]
}

export interface SmartVariable {
  name: string
  type: 'string' | 'number' | 'boolean' | 'file' | 'select' | 'multiselect' | 'date' | 'email' | 'url'
  required: boolean
  description: string
  defaultValue?: any
  options?: string[]
  category: 'schedule' | 'data_source' | 'data_destination' | 'configuration' | 'notification'
  businessContext: string
  validation?: {
    min?: number
    max?: number
    pattern?: string
    fileTypes?: string[]
  }
}

export function parseSmartWorkflow(workflowJson: string): SmartWorkflowAnalysis {
  const workflow: N8NWorkflow = JSON.parse(workflowJson)

  const analysis: SmartWorkflowAnalysis = {
    workflowName: workflow.name || 'Untitled Workflow',
    workflowDescription: '',
    businessLogic: '',
    detectedVariables: [],
    systems: [],
    complexity: 'simple',
    estimatedDuration: 5,
    hasFileUpload: false,
    hasEmailNotification: false,
    hasSlackNotification: false,
    errorHandling: false,
    webhookNodes: []
  }

  // Analyze the workflow structure
  const nodes = workflow.nodes || []
  const connections = workflow.connections || {}

  // Detect systems used
  analysis.systems = detectSystems(nodes)

  // Detect business logic and extract meaningful variables
  analysis.detectedVariables = extractBusinessVariables(nodes, connections)

  // Generate workflow description and business logic
  analysis.workflowDescription = generateWorkflowDescription(analysis)
  analysis.businessLogic = generateBusinessLogic(analysis)

  // Calculate complexity and duration
  analysis.complexity = calculateComplexity(nodes, analysis.detectedVariables.length)
  analysis.estimatedDuration = calculateDuration(nodes, analysis.detectedVariables.length)

  // Detect features
  analysis.hasFileUpload = nodes.some(node =>
    node.type === 'n8n-nodes-base.readBinaryFile' ||
    node.type === 'n8n-nodes-base.readFile'
  )
  analysis.hasEmailNotification = nodes.some(node =>
    node.type === 'n8n-nodes-base.emailSend' ||
    node.type === 'n8n-nodes-base.sendEmail'
  )
  analysis.hasSlackNotification = nodes.some(node =>
    node.type === 'n8n-nodes-base.slack'
  )
  analysis.errorHandling = nodes.some(node =>
    node.continueOnFail || node.retryOnFail
  )

  // Find webhook nodes
  analysis.webhookNodes = nodes.filter(node =>
    node.type === 'n8n-nodes-base.webhook'
  )

  return analysis
}

function detectSystems(nodes: N8NNode[]): string[] {
  const systems = new Set<string>()

  nodes.forEach(node => {
    if (node.type.includes('hubspot')) systems.add('hubspot')
    if (node.type.includes('google')) systems.add('google')
    if (node.type.includes('microsoft')) systems.add('microsoft')
    if (node.type.includes('salesforce')) systems.add('salesforce')
    if (node.type.includes('slack')) systems.add('slack')
    if (node.type.includes('email')) systems.add('email')
    if (node.type.includes('http')) systems.add('http-api')
    if (node.type.includes('excel') || node.type.includes('spreadsheet')) systems.add('excel')
    if (node.type.includes('schedule') || node.type.includes('cron')) systems.add('scheduler')
  })

  return Array.from(systems)
}

function extractBusinessVariables(nodes: N8NNode[], connections: Record<string, any>): SmartVariable[] {
  const variables: SmartVariable[] = []

  // 1. Schedule/Trigger Variables
  const scheduleNode = nodes.find(node =>
    node.type === 'n8n-nodes-base.scheduleTrigger' ||
    node.type === 'n8n-nodes-base.cron'
  )

  if (scheduleNode) {
    variables.push({
      name: 'scheduleInterval',
      type: 'select',
      required: true,
      description: 'How often should this workflow run?',
      category: 'schedule',
      businessContext: 'Controls when the workflow executes automatically',
      options: ['Every hour', 'Daily', 'Weekly', 'Monthly'],
      defaultValue: 'Daily'
    })

    variables.push({
      name: 'scheduleTime',
      type: 'string',
      required: true,
      description: 'What time should it run? (e.g., "09:00")',
      category: 'schedule',
      businessContext: 'Specific time for daily/weekly schedules',
      defaultValue: '09:00'
    })
  }

  // 2. Data Source Variables (HubSpot, APIs, etc.)
  const hubspotNodes = nodes.filter(node =>
    node.type.includes('hubspot') &&
    (node.type.includes('get') || node.type.includes('list'))
  )

  hubspotNodes.forEach((node, index) => {
    // Extract list ID from URL or parameters
    const listId = extractListId(node)
    if (listId) {
      variables.push({
        name: `hubspotListId${index > 0 ? index + 1 : ''}`,
        type: 'string',
        required: true,
        description: `HubSpot list ID for ${node.name}`,
        category: 'data_source',
        businessContext: 'Identifies which HubSpot contact list to export',
        defaultValue: listId
      })
    }
  })

  // 3. Data Destination Variables (Excel, Google Sheets, etc.)
  const excelNodes = nodes.filter(node =>
    node.type.includes('excel') ||
    node.type.includes('spreadsheet') ||
    node.name.toLowerCase().includes('excel')
  )

  excelNodes.forEach((node, index) => {
    // Excel file path
    variables.push({
      name: `excelFilePath${index > 0 ? index + 1 : ''}`,
      type: 'string',
      required: true,
      description: `Path to Excel file for ${node.name}`,
      category: 'data_destination',
      businessContext: 'Where to save the exported data',
      defaultValue: '/path/to/your/file.xlsx'
    })

    // Excel sheet name
    variables.push({
      name: `excelSheetName${index > 0 ? index + 1 : ''}`,
      type: 'string',
      required: true,
      description: `Name of the Excel sheet for ${node.name}`,
      category: 'data_destination',
      businessContext: 'Which sheet to write data to',
      defaultValue: 'Sheet1'
    })

    // Excel columns (this would need to be detected from the workflow)
    const columns = extractExcelColumns(node)
    if (columns.length > 0) {
      variables.push({
        name: `excelColumns${index > 0 ? index + 1 : ''}`,
        type: 'multiselect',
        required: true,
        description: `Columns to include in Excel sheet for ${node.name}`,
        category: 'data_destination',
        businessContext: 'Which contact fields to export',
        options: columns,
        defaultValue: columns.slice(0, 3) // Default to first 3 columns
      })
    }
  })

  // 4. Configuration Variables
  const configNodes = nodes.filter(node =>
    node.type.includes('set') ||
    node.type.includes('function') ||
    node.name.toLowerCase().includes('config')
  )

  // 5. Notification Variables
  const notificationNodes = nodes.filter(node =>
    node.type.includes('email') ||
    node.type.includes('slack') ||
    node.type.includes('notification')
  )

  notificationNodes.forEach((node, index) => {
    variables.push({
      name: `notificationEmail${index > 0 ? index + 1 : ''}`,
      type: 'email',
      required: false,
      description: `Email address for ${node.name}`,
      category: 'notification',
      businessContext: 'Who to notify when the workflow completes',
      defaultValue: 'your-email@company.com'
    })
  })

  return variables
}

function extractListId(node: N8NNode): string | null {
  // Look for list ID in URL parameters
  if (node.parameters?.url) {
    const urlMatch = node.parameters.url.match(/lists\/(\d+)/)
    if (urlMatch) return urlMatch[1]
  }

  // Look for list ID in query parameters
  if (node.parameters?.queryParameters) {
    const listIdParam = node.parameters.queryParameters.find((param: any) =>
      param.name === 'listId' || param.name === 'list_id'
    )
    if (listIdParam) return listIdParam.value
  }

  return null
}

function extractExcelColumns(node: N8NNode): string[] {
  // This would need to be more sophisticated to detect actual columns
  // For now, return common contact fields
  return [
    'Email',
    'First Name',
    'Last Name',
    'Company',
    'Phone',
    'Created Date',
    'Last Modified'
  ]
}

function generateWorkflowDescription(analysis: SmartWorkflowAnalysis): string {
  const systems = analysis.systems.join(', ')
  const variableCount = analysis.detectedVariables.length

  if (analysis.systems.includes('hubspot') && analysis.systems.includes('excel')) {
    return `Exports HubSpot contact data to Excel with ${variableCount} configurable options`
  }

  if (analysis.systems.includes('schedule')) {
    return `Scheduled automation that runs ${analysis.detectedVariables.find(v => v.category === 'schedule')?.defaultValue || 'daily'}`
  }

  return `Workflow automation using ${systems} with ${variableCount} configurable variables`
}

function generateBusinessLogic(analysis: SmartWorkflowAnalysis): string {
  const logic: string[] = []

  if (analysis.systems.includes('schedule')) {
    logic.push('• Runs on a schedule you configure')
  }

  if (analysis.systems.includes('hubspot')) {
    logic.push('• Connects to HubSpot to fetch contact data')
  }

  if (analysis.systems.includes('excel')) {
    logic.push('• Exports data to Excel spreadsheet')
  }

  if (analysis.hasEmailNotification) {
    logic.push('• Sends email notification when complete')
  }

  return logic.join('\n')
}

function calculateComplexity(nodes: N8NNode[], variableCount: number): 'simple' | 'intermediate' | 'advanced' {
  const nodeCount = nodes.length

  if (nodeCount <= 5 && variableCount <= 3) return 'simple'
  if (nodeCount <= 15 && variableCount <= 8) return 'intermediate'
  return 'advanced'
}

function calculateDuration(nodes: N8NNode[], variableCount: number): number {
  // Base duration on number of nodes and variables
  const nodeCount = nodes.length
  const baseMinutes = Math.max(5, nodeCount * 2)
  const variableMinutes = variableCount * 1
  return baseMinutes + variableMinutes
}
