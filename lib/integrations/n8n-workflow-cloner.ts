// n8n Workflow Cloner
// This module handles cloning workflows to n8n with pre-injected variables

export interface N8NCloneOptions {
  workflowJson: any
  variables: Record<string, any>
  n8nInstanceUrl?: string // Optional custom n8n instance URL
}

export interface N8NCloneResult {
  importUrl: string
  alternativeUrl: string
  dataUrl: string
  workflowName: string
  variablesInjected: number
  encodedWorkflow: string
  workflowJson: string
}

export class N8NWorkflowCloner {
  private defaultN8nUrl = 'https://n8n.io'

  /**
   * Clone a workflow to n8n with injected variables
   */
  async cloneWorkflow(options: N8NCloneOptions): Promise<N8NCloneResult> {
    const { workflowJson, variables, n8nInstanceUrl } = options

    // Clone workflow with variable injection

    // Create a deep copy of the workflow
    const clonedWorkflow = JSON.parse(JSON.stringify(workflowJson))

    // Clean credentials and sensitive data for security
    this.cleanCredentials(clonedWorkflow)

    // Inject variables into the workflow
    const variablesInjected = this.injectVariables(clonedWorkflow, variables)

    // Variables injected successfully

    // Update workflow metadata
    this.updateWorkflowMetadata(clonedWorkflow, variables)

    // Generate multiple import options
    const baseUrl = n8nInstanceUrl || this.defaultN8nUrl
    const encodedWorkflow = this.encodeWorkflowForUrl(clonedWorkflow)
    const dataUrl = this.generateDataUrl(clonedWorkflow)

    // Try different URL formats
    const importUrl = `${baseUrl}/workflows/new?import=${encodedWorkflow}`
    const alternativeUrl = `${baseUrl}/workflows/new`

    return {
      importUrl,
      alternativeUrl,
      dataUrl,
      workflowName: clonedWorkflow.name || 'Cloned Workflow',
      variablesInjected,
      encodedWorkflow,
      workflowJson: JSON.stringify(clonedWorkflow, null, 2)
    }
  }

  /**
   * Inject variables into workflow nodes
   */
  private injectVariables(workflow: any, variables: Record<string, any>): number {
    let injectedCount = 0

    // Inject variables into workflow nodes

    if (!workflow.nodes || !Array.isArray(workflow.nodes)) {
      return 0
    }

    // Create dynamic variable mappings based on workflow structure
    const dynamicMappings = this.createDynamicVariableMappings(workflow, variables)
    console.log('🔄 Dynamic mappings created:', dynamicMappings)

    workflow.nodes.forEach((node: any, index: number) => {
      console.log(`\n🔧 Processing node ${index + 1}: ${node.name} (${node.type})`)
      if (node.parameters) {
        const nodeInjected = this.injectVariablesIntoNode(node, variables, dynamicMappings)
        injectedCount += nodeInjected
        console.log(`✅ Node ${node.name}: ${nodeInjected} variables injected`)
      } else {
        console.log(`⚠️ Node ${node.name}: No parameters found`)
      }
    })

    console.log(`\n🎯 Total variables injected: ${injectedCount}`)
    return injectedCount
  }

  /**
   * Clean credentials and sensitive data from workflow for security
   */
  private cleanCredentials(workflow: any): void {
    console.log('🔒 CLEANING CREDENTIALS: Removing sensitive data for security')

    if (!workflow.nodes || !Array.isArray(workflow.nodes)) {
      return
    }

    workflow.nodes.forEach((node: any) => {
      // Remove credentials object
      if (node.credentials) {
        console.log(`🔒 Removing credentials from node: ${node.name}`)
        node.credentials = {}
      }

      // Clean sensitive parameters
      if (node.parameters) {
        this.cleanSensitiveParameters(node.parameters, node.name)
      }
    })

    console.log('✅ Credentials cleaned successfully')
  }

  /**
   * Recursively clean sensitive parameters
   */
  private cleanSensitiveParameters(params: any, nodeName: string): void {
    const sensitiveKeys = [
      'apiKey', 'api_key', 'token', 'password', 'secret', 'key',
      'accessToken', 'access_token', 'refreshToken', 'refresh_token',
      'bearerToken', 'bearer_token', 'authToken', 'auth_token',
      'privateKey', 'private_key', 'clientSecret', 'client_secret',
      'connectionString', 'connection_string', 'credentialId', 'credential_id'
    ]

    Object.keys(params).forEach(key => {
      const lowerKey = key.toLowerCase()

      if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
        console.log(`🔒 Removing sensitive parameter from node: ${nodeName}`)
        params[key] = '[CONFIGURE_MANUALLY_IN_N8N]'
      } else if (typeof params[key] === 'object' && params[key] !== null) {
        this.cleanSensitiveParameters(params[key], nodeName)
      }
    })
  }

  /**
   * Create dynamic variable mappings based on workflow structure
   */
  private createDynamicVariableMappings(workflow: any, variables: Record<string, any>): any {
    const mappings: any = {}

    // Count HubSpot HTTP Request nodes
    const hubspotNodes = workflow.nodes.filter((node: any) =>
      node.type === 'n8n-nodes-base.httpRequest' &&
      node.parameters?.url?.includes('api.hubspot.com')
    )

    // Count Excel nodes
    const excelNodes = workflow.nodes.filter((node: any) =>
      node.type === 'n8n-nodes-base.microsoftExcel' ||
      node.type === 'n8n-nodes-base.excel'
    )

    console.log(`📊 Found ${hubspotNodes.length} HubSpot nodes and ${excelNodes.length} Excel nodes`)

    // Create mappings for HubSpot lists
    if (hubspotNodes.length > 0) {
      const hubspotListVars = Object.keys(variables).filter(key =>
        key.startsWith('HubSpot List ') && key.length <= 15
      ).sort()

      hubspotListVars.forEach((varName, index) => {
        if (index < hubspotNodes.length) {
          mappings[varName] = {
            nodeIndex: index,
            nodeId: hubspotNodes[index].id,
            nodeName: hubspotNodes[index].name
          }
        }
      })
    }

    // Create mappings for Excel sheets
    if (excelNodes.length > 0) {
      const excelSheetVars = Object.keys(variables).filter(key =>
        key.startsWith('Excel Sheet ') && key.length <= 15
      ).sort()

      excelSheetVars.forEach((varName, index) => {
        if (index < excelNodes.length) {
          mappings[varName] = {
            nodeIndex: index,
            nodeId: excelNodes[index].id,
            nodeName: excelNodes[index].name
          }
        }
      })
    }

    return mappings
  }

  /**
   * Inject variables into a specific node
   */
  private injectVariablesIntoNode(node: any, variables: Record<string, any>, dynamicMappings?: any): number {
    let injectedCount = 0
    const nodeType = node.type

    console.log(`Injecting variables into node: ${node.name} (${nodeType})`)
    console.log('Available variables:', Object.keys(variables))

    // Handle different node types
    switch (nodeType) {
      case 'n8n-nodes-base.scheduleTrigger':
        injectedCount += this.injectScheduleTriggerVariables(node, variables)
        break
      case 'n8n-nodes-base.hubspot':
        injectedCount += this.injectHubSpotVariables(node, variables)
        break
      case 'n8n-nodes-base.slack':
        injectedCount += this.injectSlackVariables(node, variables)
        break
      case 'n8n-nodes-base.googleSheets':
        injectedCount += this.injectGoogleSheetsVariables(node, variables)
        break
      case 'n8n-nodes-base.excel':
      case 'n8n-nodes-base.microsoftExcel':
        injectedCount += this.injectExcelVariables(node, variables, dynamicMappings)
        break
      case 'n8n-nodes-base.emailSend':
        injectedCount += this.injectEmailVariables(node, variables)
        break
      case 'n8n-nodes-base.httpRequest':
        // Check if this is a HubSpot API call
        if (node.parameters?.url?.includes('api.hubspot.com')) {
          injectedCount += this.injectHubSpotVariables(node, variables, dynamicMappings)
        } else {
          injectedCount += this.injectHttpRequestVariables(node, variables)
        }
        break
      case 'n8n-nodes-base.webhook':
        injectedCount += this.injectWebhookVariables(node, variables)
        break
      default:
        injectedCount += this.injectGenericVariables(node, variables)
    }

    // DYNAMIC AI-DRIVEN INJECTION: Try to inject ANY variable based on content analysis
    injectedCount += this.injectDynamicVariables(node, variables, dynamicMappings)

    return injectedCount
  }

  /**
   * Inject Schedule Trigger variables
   */
  private injectScheduleTriggerVariables(node: any, variables: Record<string, any>): number {
    let injectedCount = 0
    const params = node.parameters || {}

    console.log('🔍 SCHEDULE TRIGGER INJECTION:')
    console.log('Available variables:', Object.keys(variables))
    console.log('Node parameters before:', JSON.stringify(params, null, 2))

    // Map AI variable names to actual n8n parameters
    const variableMappings = {
      'Schedule Trigger Hour': 'triggerAtHour',
      'Trigger at Hour': 'triggerAtHour',
      'triggerAtHour': 'triggerAtHour',
      'Schedule Trigger Minute': 'triggerAtMinute',
      'Trigger at Minute': 'triggerAtMinute',
      'triggerAtMinute': 'triggerAtMinute',
      'Trigger Interval': 'interval',
      'scheduleInterval': 'interval',
      'Days Between Triggers': 'intervalValue',
      'daysBetweenTriggers': 'intervalValue',
      'rule': 'rule' // Handle generic rule variable
    }

    // Check for schedule trigger hour
    for (const [aiName, paramPath] of Object.entries(variableMappings)) {
      if (variables[aiName]) {
        const value = variables[aiName]
        console.log(`🔍 Found variable: "${aiName}" = "${value}"`)

        if (paramPath === 'triggerAtHour' && params.rule?.interval) {
          // Handle the specific structure: rule.interval[0].triggerAtHour
          if (Array.isArray(params.rule.interval) && params.rule.interval[0]) {
            params.rule.interval[0].triggerAtHour = parseInt(value)
            injectedCount++
            console.log(`✅ Set triggerAtHour to: ${value}`)
          }
        } else if (paramPath === 'triggerAtMinute' && params.rule?.interval) {
          if (Array.isArray(params.rule.interval) && params.rule.interval[0]) {
            params.rule.interval[0].triggerAtMinute = parseInt(value)
            injectedCount++
            console.log(`✅ Set triggerAtMinute to: ${value}`)
          }
        } else if (paramPath === 'interval' && params.rule) {
          params.rule.interval = value
          injectedCount++
          console.log(`✅ Set interval to: ${value}`)
        } else if (paramPath === 'intervalValue' && params.rule) {
          params.rule.intervalValue = parseInt(value)
          injectedCount++
          console.log(`✅ Set intervalValue to: ${value}`)
        } else if (paramPath === 'rule') {
          // Handle generic rule variable - replace the entire rule object
          params.rule = value
          injectedCount++
          console.log(`✅ Set rule to: ${JSON.stringify(value)}`)
        }
      }
    }

    console.log('Node parameters after:', JSON.stringify(params, null, 2))
    console.log(`📊 Schedule trigger injection result: ${injectedCount} variables injected`)
    return injectedCount
  }

  /**
   * Inject HubSpot-specific variables
   */
  private injectHubSpotVariables(node: any, variables: Record<string, any>, dynamicMappings?: any): number {
    let injectedCount = 0
    const params = node.parameters || {}

    console.log('🔍 HUBSPOT INJECTION:')
    console.log('Available variables:', Object.keys(variables))
    console.log('Node parameters before:', JSON.stringify(params, null, 2))

    // Handle generic HubSpot List variables (HubSpot List A, B, C, etc.)
    const hubspotListVars = Object.keys(variables).filter(key =>
      key.startsWith('HubSpot List ') && key.length <= 15 // A, B, C, etc.
    )

    // Also handle generic list ID variables
    const genericListVars = Object.keys(variables).filter(key =>
      key.toLowerCase().includes('list') && key.toLowerCase().includes('id')
    )

    // Process both HubSpot list variables and generic list variables
    const allListVars = [...hubspotListVars, ...genericListVars]

    for (const varName of allListVars) {
      const value = variables[varName]
      console.log(`🔍 Found list variable: "${varName}" = "${value}"`)

      // Check if this variable should be applied to this specific node
      const shouldApplyToThisNode = dynamicMappings && dynamicMappings[varName]
        ? dynamicMappings[varName].nodeId === node.id
        : true // If no dynamic mappings, apply to all nodes (legacy behavior)

      if (shouldApplyToThisNode) {
        // Update the URL and query parameter value with n8n expressions
        if (params.url && params.queryParameters?.parameters) {
          // Extract current list ID from URL (handle both numeric IDs and variable expressions)
          const currentListId = params.url.match(/\/lists\/([^/]+)\//)?.[1]
          if (currentListId) {
            // Update URL with actual value
            params.url = params.url.replace(`/lists/${currentListId}/`, `/lists/${value}/`)
            // Update query parameter with actual value
            const listIdParam = params.queryParameters.parameters.find((p: any) => p.name === 'listId')
            if (listIdParam) {
              listIdParam.value = value
              injectedCount++
              console.log(`✅ Updated HubSpot list ID to actual value: ${value} for node: ${node.name}`)
            }
          }
        }
      } else {
        console.log(`⏭️ Skipping ${varName} for node ${node.name} (not mapped to this node)`)
      }
    }

    // Handle legacy specific names for backward compatibility
    const legacyMappings = {
      'HubSpot List ID for Demo Requests': 'demoListId',
      'HubSpot List ID for Signups': 'signupListId',
      'hubspotListId': 'listId',
      'hubspot_segment_id': 'segmentId',
      'hubspot_object_type': 'resource'
    }

    for (const [aiName, paramKey] of Object.entries(legacyMappings)) {
      if (variables[aiName]) {
        const value = variables[aiName]
        console.log(`🔍 Found legacy variable: "${aiName}" = "${value}"`)

        if (paramKey === 'demoListId' || paramKey === 'signupListId') {
          // Update the URL and query parameter value with n8n expressions
          if (params.url && params.queryParameters?.parameters) {
            const currentListId = params.url.match(/\/lists\/(\d+)\//)?.[1]
            if (currentListId) {
              params.url = params.url.replace(`/lists/${currentListId}/`, `/lists/={{ $json.${aiName} }}/`)
              const listIdParam = params.queryParameters.parameters.find((p: any) => p.name === 'listId')
              if (listIdParam) {
                listIdParam.value = `={{ $json.${aiName} }}`
                injectedCount++
                console.log(`✅ Updated HubSpot list ID to n8n expression: ={{ $json.${aiName} }}`)
              }
            }
          }
        } else if (paramKey === 'listId') {
          // Handle listId in URL and query parameters
          if (params.url && params.queryParameters?.parameters) {
            const currentListId = params.url.match(/\/lists\/(\d+)\//)?.[1]
            if (currentListId) {
              params.url = params.url.replace(`/lists/${currentListId}/`, `/lists/={{ $json.${aiName} }}/`)
              const listIdParam = params.queryParameters.parameters.find((p: any) => p.name === 'listId')
              if (listIdParam) {
                listIdParam.value = `={{ $json.${aiName} }}`
                injectedCount++
                console.log(`✅ Updated HubSpot list ID to n8n expression: ={{ $json.${aiName} }}`)
              }
            }
          } else if (params.listId) {
            params.listId = `={{ $json.${aiName} }}`
            injectedCount++
            console.log(`✅ Set HubSpot list ID to n8n expression: ={{ $json.${aiName} }}`)
          }
        } else if (paramKey === 'segmentId' && params.segmentId) {
          params.segmentId = `={{ $json.${aiName} }}`
          injectedCount++
          console.log(`✅ Set HubSpot segment ID to n8n expression: ={{ $json.${aiName} }}`)
        } else if (paramKey === 'resource' && params.resource) {
          params.resource = `={{ $json.${aiName} }}`
          injectedCount++
          console.log(`✅ Set HubSpot resource to n8n expression: ={{ $json.${aiName} }}`)
        }
      }
    }

    console.log('Node parameters after:', JSON.stringify(params, null, 2))
    console.log(`📊 HubSpot injection result: ${injectedCount} variables injected`)
    return injectedCount
  }

  /**
   * Inject Slack-specific variables
   */
  private injectSlackVariables(node: any, variables: Record<string, any>): number {
    let injectedCount = 0
    const params = node.parameters || {}

    if (variables.slack_channel && params.channel) {
      params.channel = variables.slack_channel
      injectedCount++
      console.log(`Set Slack channel to: ${variables.slack_channel}`)
    }

    if (variables.slack_message && params.text) {
      params.text = variables.slack_message
      injectedCount++
      console.log(`Set Slack message to: ${variables.slack_message}`)
    }

    return injectedCount
  }

  /**
   * Inject Google Sheets variables
   */
  private injectGoogleSheetsVariables(node: any, variables: Record<string, any>): number {
    let injectedCount = 0
    const params = node.parameters || {}

    if (variables.google_sheets_id && params.spreadsheetId) {
      params.spreadsheetId = variables.google_sheets_id
      injectedCount++
      console.log(`Set Google Sheets ID to: ${variables.google_sheets_id}`)
    }

    if (variables.google_sheets_sheet_name && params.sheetName) {
      params.sheetName = variables.google_sheets_sheet_name
      injectedCount++
      console.log(`Set Google Sheets sheet name to: ${variables.google_sheets_sheet_name}`)
    }

    if (variables.google_sheets_range && params.range) {
      params.range = variables.google_sheets_range
      injectedCount++
      console.log(`Set Google Sheets range to: ${variables.google_sheets_range}`)
    }

    return injectedCount
  }

  /**
   * Inject Excel variables
   */
  private injectExcelVariables(node: any, variables: Record<string, any>, dynamicMappings?: any): number {
    let injectedCount = 0
    const params = node.parameters || {}

    console.log('🔍 EXCEL INJECTION:')
    console.log('Available variables:', Object.keys(variables))
    console.log('Node parameters before:', JSON.stringify(params, null, 2))

    // Handle generic Excel variables (Excel Workbook, Excel Sheet A, B, C, etc.)
    const excelWorkbookVars = Object.keys(variables).filter(key =>
      key === 'Excel Workbook' || key === 'Excel Workbook ID' || key === 'workbook'
    )

    const excelSheetVars = Object.keys(variables).filter(key =>
      key.startsWith('Excel Sheet ') && key.length <= 15 || key === 'worksheet' // A, B, C, etc.
    )

    // Handle Excel Workbook
    for (const varName of excelWorkbookVars) {
      const value = variables[varName]
      console.log(`🔍 Found Excel workbook variable: "${varName}" = "${value}"`)

      if (params.workbook !== undefined) {
        params.workbook = value
        injectedCount++
        console.log(`✅ Set Excel workbook to: ${value}`)
      }
    }

    // Handle Excel Sheets
    for (const varName of excelSheetVars) {
      const value = variables[varName]
      console.log(`🔍 Found Excel sheet variable: "${varName}" = "${value}"`)

      // Check if this variable should be applied to this specific node
      const shouldApplyToThisNode = dynamicMappings && dynamicMappings[varName]
        ? dynamicMappings[varName].nodeId === node.id
        : true // If no dynamic mappings, apply to all nodes (legacy behavior)

      if (shouldApplyToThisNode && params.worksheet !== undefined) {
        params.worksheet = parseInt(value)
        injectedCount++
        console.log(`✅ Set Excel worksheet to: ${value} for node: ${node.name}`)
      } else if (!shouldApplyToThisNode) {
        console.log(`⏭️ Skipping ${varName} for node ${node.name} (not mapped to this node)`)
      }
    }

    // Handle legacy specific names for backward compatibility
    const legacyMappings = {
      'Excel Workbook ID': 'workbook',
      'Excel Sheet ID': 'worksheet',
      'excelFilePath': 'fileName',
      'excelSheetName': 'sheetName',
      'excel_filename': 'fileName',
      'excel_sheet_name': 'sheetName'
    }

    for (const [aiName, paramKey] of Object.entries(legacyMappings)) {
      if (variables[aiName]) {
        const value = variables[aiName]
        console.log(`🔍 Found legacy variable: "${aiName}" = "${value}"`)

        if (paramKey === 'workbook' && params.workbook !== undefined) {
          params.workbook = value
          injectedCount++
          console.log(`✅ Set Excel workbook to: ${value}`)
        } else if (paramKey === 'worksheet' && params.worksheet !== undefined) {
          params.worksheet = parseInt(value)
          injectedCount++
          console.log(`✅ Set Excel worksheet to: ${value}`)
        } else if (paramKey === 'fileName' && params.fileName !== undefined) {
          params.fileName = value
          injectedCount++
          console.log(`✅ Set Excel filename to: ${value}`)
        } else if (paramKey === 'sheetName' && params.sheetName !== undefined) {
          params.sheetName = value
          injectedCount++
          console.log(`✅ Set Excel sheet name to: ${value}`)
        }
      }
    }

    console.log('Node parameters after:', JSON.stringify(params, null, 2))
    console.log(`📊 Excel injection result: ${injectedCount} variables injected`)
    return injectedCount
  }

  /**
   * Inject email variables
   */
  private injectEmailVariables(node: any, variables: Record<string, any>): number {
    let injectedCount = 0
    const params = node.parameters || {}

    console.log('Injecting email variables:', variables)

    // Notification Email
    if (variables.notificationEmail) {
      if (params.toEmail) {
        params.toEmail = variables.notificationEmail
        injectedCount++
        console.log(`Set notification email to: ${variables.notificationEmail}`)
      }
    }

    // Legacy support
    if (variables.email_to && params.toEmail) {
      params.toEmail = variables.email_to
      injectedCount++
      console.log(`Set email to: ${variables.email_to}`)
    }

    if (variables.email_subject && params.subject) {
      params.subject = variables.email_subject
      injectedCount++
      console.log(`Set email subject to: ${variables.email_subject}`)
    }

    if (variables.email_body && params.message) {
      params.message = variables.email_body
      injectedCount++
      console.log(`Set email body to: ${variables.email_body}`)
    }

    return injectedCount
  }

  /**
   * Inject HTTP request variables
   */
  private injectHttpRequestVariables(node: any, variables: Record<string, any>): number {
    let injectedCount = 0
    const params = node.parameters || {}

    if (variables.api_url && params.url) {
      params.url = variables.api_url
      injectedCount++
      console.log(`Set API URL to: ${variables.api_url}`)
    }

    // Handle headers
    if (params.headers) {
      Object.keys(params.headers).forEach(headerKey => {
        const variableKey = `header_${headerKey.toLowerCase()}`
        if (variables[variableKey]) {
          params.headers[headerKey] = variables[variableKey]
          injectedCount++
          console.log(`Set header ${headerKey} to configured value`)
        }
      })
    }

    return injectedCount
  }

  /**
   * Inject webhook variables
   */
  private injectWebhookVariables(node: any, variables: Record<string, any>): number {
    let injectedCount = 0
    const params = node.parameters || {}

    if (variables.webhook_path && params.path) {
      params.path = variables.webhook_path
      injectedCount++
      console.log(`Set webhook path to: ${variables.webhook_path}`)
    }

    return injectedCount
  }

  /**
   * Inject generic variables into any node
   */
  private injectGenericVariables(node: any, variables: Record<string, any>): number {
    let injectedCount = 0
    const params = node.parameters || {}

    console.log('🔍 GENERIC VARIABLE INJECTION:')
    console.log('Available variables:', Object.keys(variables))
    console.log('Variable values:', variables)
    console.log('Node parameters before injection:', JSON.stringify(params, null, 2))

    // Look for common variable patterns
    Object.keys(variables).forEach(variableName => {
      const variableValue = variables[variableName]
      console.log(`\n🔍 Looking for variable: "${variableName}" = "${variableValue}"`)

      if (this.findAndReplaceInObject(params, variableName, variables)) {
        injectedCount++
        console.log(`✅ Successfully injected variable: ${variableName}`)
      } else {
        console.log(`❌ No match found for variable: ${variableName}`)
      }
    })

    console.log(`\n📊 Generic injection result: ${injectedCount} variables injected`)
    console.log('Node parameters after injection:', JSON.stringify(params, null, 2))
    return injectedCount
  }

  /**
   * Recursively find and replace hardcoded values with variables
   */
  private findAndReplaceInObject(obj: any, variableName: string, variables?: Record<string, any>): boolean {
    let replaced = false

    if (typeof obj === 'string' && obj.length > 0 && !obj.includes('{{')) {
      // Check if this string matches a variable pattern
      if (this.shouldReplaceWithVariable(obj, variableName)) {
        return true // Signal that replacement should happen at the caller level
      }
    } else if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        if (this.findAndReplaceInObject(item, variableName, variables)) {
          // Create n8n expression instead of using raw value
          obj[index] = `={{ $json.${variableName} }}`
          replaced = true
          console.log(`Replaced array item at index ${index} with n8n expression: ={{ $json.${variableName} }}`)
        }
      })
    } else if (typeof obj === 'object' && obj !== null) {
      Object.entries(obj).forEach(([key, value]) => {
        if (this.findAndReplaceInObject(value, variableName, variables)) {
          // Create n8n expression instead of using raw value
          obj[key] = `={{ $json.${variableName} }}`
          replaced = true
          console.log(`Replaced object property '${key}' with n8n expression`)
        }
      })
    }

    return replaced
  }

  /**
   * Determine if a value should be replaced with a variable
   */
  private shouldReplaceWithVariable(value: string, variableName: string): boolean {
    // Skip if value is already a variable expression
    if (value.includes('{{') || value.includes('$json')) {
      return false
    }

    // Skip if value is too short (but allow numeric values)
    if (value.length < 1) {
      return false
    }

    // Allow numeric values to be replaced if they match common patterns
    if (value.match(/^[0-9]+$/)) {
      // Allow replacement of numeric IDs and similar values
      return true
    }

    // Skip single character values that aren't numbers
    if (value.length === 1 && !value.match(/^[0-9]$/)) {
      return false
    }

    const valueLower = value.toLowerCase()
    const variableLower = variableName.toLowerCase()

    // Check for direct matches
    if (valueLower === variableLower) {
      return true
    }

    // Check for partial matches
    const valueWords = valueLower.split(/[^a-z0-9]+/).filter(w => w.length > 2)
    const variableWords = variableLower.split(/[^a-z0-9]+/).filter(w => w.length > 2)

    const hasCommonWords = valueWords.some(vw =>
      variableWords.some(vrw => vw.includes(vrw) || vrw.includes(vw))
    )

    return hasCommonWords
  }

  /**
   * Update workflow metadata for cloning
   */
  private updateWorkflowMetadata(workflow: any, variables: Record<string, any>): void {
    // Update workflow name to indicate it's a clone
    if (workflow.name) {
      workflow.name = `${workflow.name} (Cloned)`
    }

    // Add metadata about the cloning
    if (!workflow.meta) {
      workflow.meta = {}
    }

    workflow.meta.templateCloned = true
    workflow.meta.clonedAt = new Date().toISOString()
    workflow.meta.variablesInjected = Object.keys(variables).length

    // Reset workflow ID and version to allow import
    delete workflow.id
    delete workflow.versionId
    workflow.active = false // Start as inactive
  }


  /**
   * Encode workflow for n8n import URL
   */
  private encodeWorkflowForUrl(workflow: any): string {
    try {
      const workflowJson = JSON.stringify(workflow)
      return btoa(workflowJson)
    } catch (error) {
      throw new Error(`Failed to encode workflow: ${error}`)
    }
  }

  /**
   * Generate a data URL for the workflow that can be downloaded
   */
  private generateDataUrl(workflow: any): string {
    try {
      const workflowJson = JSON.stringify(workflow, null, 2)
      const blob = new Blob([workflowJson], { type: 'application/json' })
      return URL.createObjectURL(blob)
    } catch (error) {
      throw new Error(`Failed to generate data URL: ${error}`)
    }
  }

  /**
   * Generate a preview of the cloned workflow
   */
  generateWorkflowPreview(workflow: any, variables: Record<string, any>): string {
    const clonedWorkflow = JSON.parse(JSON.stringify(workflow))
    this.injectVariables(clonedWorkflow, variables)

    return JSON.stringify(clonedWorkflow, null, 2)
  }

  /**
   * Validate that all required variables are provided
   */
  validateVariables(workflow: any, variables: Record<string, any>): {
    isValid: boolean
    missingVariables: string[]
    warnings: string[]
  } {
    const missingVariables: string[] = []
    const warnings: string[] = []

    // This would need to be implemented based on your specific workflow analysis
    // For now, return a basic validation
    return {
      isValid: missingVariables.length === 0,
      missingVariables,
      warnings
    }
  }

  /**
   * DYNAMIC AI-DRIVEN VARIABLE INJECTION
   * This method analyzes the node content and tries to inject ANY variable
   * based on intelligent pattern matching, not hardcoded names
   */
  private injectDynamicVariables(node: any, variables: Record<string, any>, dynamicMappings?: any): number {
    let injectedCount = 0
    const params = node.parameters || {}

    console.log('🔍 DYNAMIC INJECTION: Analyzing node for intelligent variable matching')
    console.log('Available variables:', Object.keys(variables))

    // For each variable, try to find where it should be injected
    Object.entries(variables).forEach(([variableName, variableValue]) => {
      console.log(`\n🔍 Analyzing variable: "${variableName}" = "${variableValue}"`)

      // Skip if this variable was already injected by other methods
      if (this.wasVariableAlreadyInjected(params, variableName)) {
        console.log(`⏭️ Variable "${variableName}" already injected, skipping`)
        return
      }

      // Skip if the parameter already has a non-expression value
      if (this.hasNonExpressionValue(params, variableName, variableValue)) {
        console.log(`⏭️ Variable "${variableName}" already has actual value, skipping`)
        return
      }

      // Try different injection strategies
      const strategies = [
        () => this.tryInjectByContentAnalysis(params, variableName, variableValue),
        () => this.tryInjectByParameterName(params, variableName, variableValue),
        () => this.tryInjectByValueMatching(params, variableName, variableValue),
        () => this.tryInjectByContext(params, variableName, variableValue, node),
        () => this.tryInjectByGenericPatterns(params, variableName, variableValue, node)
      ]

      for (const strategy of strategies) {
        try {
          const result = strategy()
          if (result.injected) {
            injectedCount++
            console.log(`✅ DYNAMIC INJECTION SUCCESS: "${variableName}" → ${result.description}`)
            break // Stop trying other strategies for this variable
          }
        } catch (error) {
          console.log(`⚠️ Strategy failed for "${variableName}":`, (error as Error).message)
        }
      }
    })

    console.log(`📊 Dynamic injection result: ${injectedCount} variables injected`)
    return injectedCount
  }

  /**
   * Check if a variable was already injected by other methods
   */
  private wasVariableAlreadyInjected(params: any, variableName: string): boolean {
    const paramString = JSON.stringify(params)
    return paramString.includes(`{{ $json.${variableName} }}`)
  }

  /**
   * Check if a parameter already has a non-expression value (actual value instead of variable expression)
   */
  private hasNonExpressionValue(params: any, variableName: string, variableValue: any): boolean {
    const paramString = JSON.stringify(params)

    // Check if the parameter already contains the actual value (not an expression)
    const valueFormats = [
      `"${variableValue}"`,  // String format
      `${variableValue}`,    // Number format
      `"${String(variableValue)}"`  // Convert to string
    ]

    for (const format of valueFormats) {
      if (paramString.includes(format) && !paramString.includes(`{{ $json.${variableName} }}`)) {
        return true
      }
    }

    return false
  }

  /**
   * Try to inject by analyzing the content and context
   */
  private tryInjectByContentAnalysis(params: any, variableName: string, variableValue: any): { injected: boolean, description: string } {
    // Strategy 1: Look for URLs with numeric IDs
    if (params.url && typeof params.url === 'string') {
      const numericIdPattern = /\/(\d+)\//
      const match = params.url.match(numericIdPattern)

      if (match && this.isNumericVariable(variableValue)) {
        const oldId = match[1]
        params.url = params.url.replace(`/${oldId}/`, `/={{ $json.${variableName} }}/`)
        return { injected: true, description: `URL ID replacement: ${oldId} → {{ $json.${variableName} }}` }
      }
    }

    // Strategy 2: Look for query parameters with numeric values
    if (params.queryParameters?.parameters) {
      for (const param of params.queryParameters.parameters) {
        if (param.value && this.isNumericVariable(variableValue) && this.isNumericVariable(param.value)) {
          const oldValue = param.value
          param.value = `={{ $json.${variableName} }}`
          return { injected: true, description: `Query parameter replacement: ${oldValue} → {{ $json.${variableName} }}` }
        }
      }
    }

    // Strategy 3: Look for direct parameter values
    for (const [key, value] of Object.entries(params)) {
      if (this.isNumericVariable(value) && this.isNumericVariable(variableValue)) {
        params[key] = `={{ $json.${variableName} }}`
        return { injected: true, description: `Parameter replacement: ${key} = ${value} → {{ $json.${variableName} }}` }
      }
    }

    return { injected: false, description: 'No content match found' }
  }

  /**
   * Try to inject by matching parameter names
   */
  private tryInjectByParameterName(params: any, variableName: string, variableValue: any): { injected: boolean, description: string } {
    const variableLower = variableName.toLowerCase()

    // Look for parameter names that match the variable name
    for (const [key, value] of Object.entries(params)) {
      const keyLower = key.toLowerCase()

      // Direct name match
      if (keyLower === variableLower) {
        params[key] = variableValue
        return { injected: true, description: `Direct name match: ${key} → ${variableValue}` }
      }

      // Partial name match
      if (keyLower.includes(variableLower) || variableLower.includes(keyLower)) {
        params[key] = variableValue
        return { injected: true, description: `Partial name match: ${key} → ${variableValue}` }
      }
    }

    return { injected: false, description: 'No parameter name match found' }
  }

  /**
   * Try to inject by matching values
   */
  private tryInjectByValueMatching(params: any, variableName: string, variableValue: any): { injected: boolean, description: string } {
    // Look for exact value matches
    const paramString = JSON.stringify(params)

    // Try different value formats
    const valueFormats = [
      `"${variableValue}"`,  // String format
      `${variableValue}`,    // Number format
      `"${String(variableValue)}"`  // Convert to string
    ]

    for (const format of valueFormats) {
      if (paramString.includes(format)) {
        // Replace the exact value with the actual variable value
        const updatedParams = JSON.parse(paramString.replace(new RegExp(format.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), `"${variableValue}"`))
        Object.assign(params, updatedParams)
        return { injected: true, description: `Value match replacement: ${format} → ${variableValue}` }
      }
    }

    return { injected: false, description: 'No value match found' }
  }

  /**
   * Try to inject by generic patterns that work across different node types
   */
  private tryInjectByGenericPatterns(params: any, variableName: string, variableValue: any, node: any): { injected: boolean, description: string } {
    const variableLower = variableName.toLowerCase()

    // Generic patterns for common variable types
    const patterns = [
      // List ID patterns
      { pattern: /listId|list_id|listid/i, paths: ['queryParameters.parameters[].value', 'listId', 'id'] },
      // Workbook patterns
      { pattern: /workbook|work_book|workbookid/i, paths: ['workbook', 'fileId', 'spreadsheetId'] },
      // Worksheet patterns
      { pattern: /worksheet|work_sheet|sheet/i, paths: ['worksheet', 'sheetName', 'range'] },
      // Rule patterns
      { pattern: /rule|schedule|trigger/i, paths: ['rule', 'schedule', 'trigger'] },
      // URL patterns
      { pattern: /url|endpoint|api/i, paths: ['url', 'endpoint', 'apiUrl'] }
    ]

    for (const { pattern, paths } of patterns) {
      if (pattern.test(variableName)) {
        for (const path of paths) {
          const result = this.tryInjectAtPath(params, path, variableName, variableValue)
          if (result.injected) {
            return result
          }
        }
      }
    }

    return { injected: false, description: 'No generic pattern match found' }
  }

  /**
   * Try to inject at a specific path in the parameters
   */
  private tryInjectAtPath(params: any, path: string, variableName: string, variableValue: any): { injected: boolean, description: string } {
    try {
      const pathParts = path.split('.')
      let current = params

      // Navigate to the parent object
      for (let i = 0; i < pathParts.length - 1; i++) {
        const part = pathParts[i]
        if (part.includes('[]')) {
          // Handle array paths like "parameters[]"
          const arrayName = part.replace('[]', '')
          if (current[arrayName] && Array.isArray(current[arrayName])) {
            // Try to inject into each array element
            for (const item of current[arrayName]) {
              if (item && typeof item === 'object') {
                const result = this.tryInjectAtPath(item, pathParts.slice(i + 1).join('.'), variableName, variableValue)
                if (result.injected) {
                  return result
                }
              }
            }
          }
        } else if (part.includes('[') && part.includes(']')) {
          // Handle indexed array access like "parameters[0]"
          const [arrayName, index] = part.split('[')
          const arrayIndex = parseInt(index.replace(']', ''))
          if (current[arrayName] && current[arrayName][arrayIndex]) {
            current = current[arrayName][arrayIndex]
          } else {
            return { injected: false, description: `Array index not found: ${path}` }
          }
        } else {
          current = current[part]
        }
      }

      // Set the variable at the final path
      const finalPart = pathParts[pathParts.length - 1]
      if (current && current.hasOwnProperty(finalPart)) {
        const currentValue = current[finalPart]
        // Only inject if the current value matches the variable value or is a hardcoded value
        if (currentValue === variableValue || (typeof currentValue === 'string' && !currentValue.includes('{{'))) {
          current[finalPart] = variableValue
          return { injected: true, description: `Injected actual value at path: ${path}` }
        }
      }
    } catch (error) {
      console.log(`Error injecting at path ${path}:`, (error as Error).message)
    }

    return { injected: false, description: `Path not found or not injectable: ${path}` }
  }

  /**
   * Try to inject by context (node type and business logic)
   */
  private tryInjectByContext(params: any, variableName: string, variableValue: any, node: any): { injected: boolean, description: string } {
    const nodeType = node.type
    const variableLower = variableName.toLowerCase()

    // HubSpot context
    if (nodeType === 'n8n-nodes-base.httpRequest' && params.url?.includes('api.hubspot.com')) {
      if (variableLower.includes('list') || variableLower.includes('hubspot')) {
        // This is likely a HubSpot list ID
        return this.tryInjectByContentAnalysis(params, variableName, variableValue)
      }
    }

    // Excel context
    if (nodeType === 'n8n-nodes-base.microsoftExcel' || nodeType === 'n8n-nodes-base.excel') {
      if (variableLower.includes('excel') || variableLower.includes('sheet') || variableLower.includes('workbook')) {
        // This is likely an Excel configuration
        return this.tryInjectByParameterName(params, variableName, variableValue)
      }
    }

    // Schedule context
    if (nodeType === 'n8n-nodes-base.scheduleTrigger') {
      if (variableLower.includes('trigger') || variableLower.includes('schedule') || variableLower.includes('hour') || variableLower.includes('minute')) {
        // This is likely a schedule configuration
        return this.tryInjectByParameterName(params, variableName, variableValue)
      }
    }

    return { injected: false, description: 'No context match found' }
  }

  /**
   * Check if a value is numeric (for ID matching)
   */
  private isNumericVariable(value: any): boolean {
    if (typeof value === 'number') return true
    if (typeof value === 'string') {
      return /^\d+$/.test(value) && value.length > 0
    }
    return false
  }
}

/**
 * Utility function to clone a workflow to n8n
 */
export async function cloneWorkflowToN8N(
  workflowJson: any,
  variables: Record<string, any>,
  n8nInstanceUrl?: string
): Promise<N8NCloneResult> {
  const cloner = new N8NWorkflowCloner()
  return cloner.cloneWorkflow({
    workflowJson,
    variables,
    n8nInstanceUrl
  })
}

/**
 * Utility function to generate n8n import URL
 */
export function generateN8NImportUrl(workflowJson: any, variables: Record<string, any> = {}): string {
  const cloner = new N8NWorkflowCloner()
  const encodedWorkflow = cloner['encodeWorkflowForUrl'](workflowJson)
  return `https://n8n.io/workflows/new?import=${encodedWorkflow}`
}

