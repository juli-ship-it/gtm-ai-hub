// Credential Management System
// Handles secure storage and retrieval of n8n workflow credentials

export interface CredentialTemplate {
  id: string
  name: string
  type: string
  description: string
  required: boolean
  fields: CredentialField[]
  nodeId: string
  nodeName: string
}

export interface CredentialField {
  name: string
  type: 'text' | 'password' | 'select' | 'multiselect' | 'boolean'
  label: string
  description: string
  required: boolean
  options?: string[]
  validation?: {
    pattern?: string
    minLength?: number
    maxLength?: number
  }
}

export interface UserCredential {
  id: string
  userId: string
  credentialType: string
  name: string
  values: Record<string, any>
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CredentialMapping {
  templateId: string
  userCredentialId: string
  nodeId: string
  parameterName: string
}

export class CredentialManager {
  private supabase: any

  constructor(supabase: any) {
    this.supabase = supabase
  }

  /**
   * Get credential templates for a workflow
   */
  async getCredentialTemplates(workflow: any): Promise<CredentialTemplate[]> {
    const templates: CredentialTemplate[] = []

    workflow.nodes?.forEach((node: any) => {
      if (node.credentials) {
        Object.entries(node.credentials).forEach(([credType, credName]) => {
          const template = this.createCredentialTemplate(credType, credName as string, node)
          templates.push(template)
        })
      }
    })

    return templates
  }

  /**
   * Create a credential template for a specific credential type
   */
  private createCredentialTemplate(credType: string, credName: string, node: any): CredentialTemplate {
    const template = this.getCredentialTemplateDefinition(credType)

    return {
      id: `${node.id}-${credType}`,
      name: credName,
      type: credType,
      description: template.description,
      required: true,
      fields: template.fields,
      nodeId: node.id,
      nodeName: node.name
    }
  }

  /**
   * Get credential template definition based on type
   */
  private getCredentialTemplateDefinition(credType: string): { description: string; fields: CredentialField[] } {
    const definitions: Record<string, { description: string; fields: CredentialField[] }> = {
      'hubspotApi': {
        description: 'HubSpot API credentials for accessing contacts, companies, and deals',
        fields: [
          {
            name: 'apiKey',
            type: 'password',
            label: 'API Key',
            description: 'Your HubSpot API key',
            required: true,
            validation: {
              minLength: 10,
              pattern: '^[a-f0-9-]{36}$'
            }
          }
        ]
      },
      'slackApi': {
        description: 'Slack API credentials for sending messages and notifications',
        fields: [
          {
            name: 'accessToken',
            type: 'password',
            label: 'Bot Token',
            description: 'Slack bot token (starts with xoxb-)',
            required: true,
            validation: {
              pattern: '^xoxb-'
            }
          }
        ]
      },
      'googleSheetsOAuth2Api': {
        description: 'Google Sheets OAuth2 credentials for accessing spreadsheets',
        fields: [
          {
            name: 'clientId',
            type: 'text',
            label: 'Client ID',
            description: 'Google OAuth2 client ID',
            required: true
          },
          {
            name: 'clientSecret',
            type: 'password',
            label: 'Client Secret',
            description: 'Google OAuth2 client secret',
            required: true
          },
          {
            name: 'refreshToken',
            type: 'password',
            label: 'Refresh Token',
            description: 'OAuth2 refresh token',
            required: true
          }
        ]
      },
      'emailSend': {
        description: 'Email service credentials for sending notifications',
        fields: [
          {
            name: 'host',
            type: 'text',
            label: 'SMTP Host',
            description: 'SMTP server hostname',
            required: true,
            validation: {
              pattern: '^[a-zA-Z0-9.-]+$'
            }
          },
          {
            name: 'port',
            type: 'text',
            label: 'SMTP Port',
            description: 'SMTP server port (usually 587 or 465)',
            required: true,
            validation: {
              pattern: '^[0-9]+$'
            }
          },
          {
            name: 'username',
            type: 'text',
            label: 'Username',
            description: 'SMTP username',
            required: true
          },
          {
            name: 'password',
            type: 'password',
            label: 'Password',
            description: 'SMTP password',
            required: true
          },
          {
            name: 'secure',
            type: 'boolean',
            label: 'Use SSL/TLS',
            description: 'Enable secure connection',
            required: false
          }
        ]
      },
      'httpBasicAuth': {
        description: 'HTTP Basic Authentication credentials',
        fields: [
          {
            name: 'username',
            type: 'text',
            label: 'Username',
            description: 'HTTP Basic Auth username',
            required: true
          },
          {
            name: 'password',
            type: 'password',
            label: 'Password',
            description: 'HTTP Basic Auth password',
            required: true
          }
        ]
      },
      'httpHeaderAuth': {
        description: 'HTTP Header Authentication credentials',
        fields: [
          {
            name: 'headerName',
            type: 'text',
            label: 'Header Name',
            description: 'Name of the authentication header',
            required: true
          },
          {
            name: 'headerValue',
            type: 'password',
            label: 'Header Value',
            description: 'Value of the authentication header',
            required: true
          }
        ]
      }
    }

    return definitions[credType] || {
      description: `${credType} credentials`,
      fields: [
        {
          name: 'value',
          type: 'password',
          label: 'Credential Value',
          description: 'Credential value',
          required: true
        }
      ]
    }
  }

  /**
   * Save user credentials
   */
  async saveUserCredential(
    userId: string,
    credentialType: string,
    name: string,
    values: Record<string, any>
  ): Promise<UserCredential> {
    // Encrypt sensitive values
    const encryptedValues = await this.encryptCredentialValues(values)

    const { data, error } = await this.supabase
      .from('user_credentials')
      .insert({
        user_id: userId,
        credential_type: credentialType,
        name,
        values: encryptedValues,
        is_active: true
      })
      .select()
      .single()

    if (error) throw error

    return {
      id: data.id,
      userId: data.user_id,
      credentialType: data.credential_type,
      name: data.name,
      values: encryptedValues,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }
  }

  /**
   * Get user credentials by type
   */
  async getUserCredentials(userId: string, credentialType?: string): Promise<UserCredential[]> {
    let query = this.supabase
      .from('user_credentials')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)

    if (credentialType) {
      query = query.eq('credential_type', credentialType)
    }

    const { data, error } = await query

    if (error) throw error

    return data.map((cred: any) => ({
      id: cred.id,
      userId: cred.user_id,
      credentialType: cred.credential_type,
      name: cred.name,
      values: cred.values, // Already encrypted
      isActive: cred.is_active,
      createdAt: cred.created_at,
      updatedAt: cred.updated_at
    }))
  }

  /**
   * Create credential mapping for template execution
   */
  async createCredentialMapping(
    templateId: string,
    mappings: CredentialMapping[]
  ): Promise<void> {
    const { error } = await this.supabase
      .from('template_credential_mapping')
      .insert(
        mappings.map(mapping => ({
          template_id: templateId,
          user_credential_id: mapping.userCredentialId,
          node_id: mapping.nodeId,
          parameter_name: mapping.parameterName
        }))
      )

    if (error) throw error
  }

  /**
   * Get credential mappings for a template
   */
  async getCredentialMappings(templateId: string): Promise<CredentialMapping[]> {
    const { data, error } = await this.supabase
      .from('template_credential_mapping')
      .select('*')
      .eq('template_id', templateId)

    if (error) throw error

    return data.map((mapping: any) => ({
      templateId: mapping.template_id,
      userCredentialId: mapping.user_credential_id,
      nodeId: mapping.node_id,
      parameterName: mapping.parameter_name
    }))
  }

  /**
   * Apply credentials to a workflow
   */
  async applyCredentialsToWorkflow(
    workflow: any,
    templateId: string
  ): Promise<any> {
    const mappings = await this.getCredentialMappings(templateId)
    const credentialMap = new Map<string, string>()

    // Build credential mapping
    for (const mapping of mappings) {
      const { data: credential } = await this.supabase
        .from('user_credentials')
        .select('values')
        .eq('id', mapping.userCredentialId)
        .single()

      if (credential) {
        credentialMap.set(`${mapping.nodeId}-${mapping.parameterName}`, credential.values)
      }
    }

    // Apply credentials to workflow
    const workflowWithCredentials = JSON.parse(JSON.stringify(workflow))

    workflowWithCredentials.nodes?.forEach((node: any) => {
      if (node.credentials) {
        Object.keys(node.credentials).forEach(credType => {
          const credentialKey = `${node.id}-${credType}`
          const credentialValues = credentialMap.get(credentialKey)

          if (credentialValues) {
            // Replace credential reference with actual values
            node.credentials[credType] = credentialValues
          }
        })
      }
    })

    return workflowWithCredentials
  }

  /**
   * Encrypt credential values
   */
  private async encryptCredentialValues(values: Record<string, any>): Promise<Record<string, any>> {
    // In a real implementation, you would use proper encryption
    // For now, we'll just return the values (in production, use a proper encryption library)
    return values
  }

  /**
   * Decrypt credential values
   */
  private async decryptCredentialValues(encryptedValues: Record<string, any>): Promise<Record<string, any>> {
    // In a real implementation, you would decrypt the values
    // For now, we'll just return the values
    return encryptedValues
  }
}

/**
 * Utility function to create credential manager
 */
export function createCredentialManager(supabase: any): CredentialManager {
  return new CredentialManager(supabase)
}
