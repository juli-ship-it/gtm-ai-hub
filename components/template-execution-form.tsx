'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Play, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  FileText,
  Upload,
  Loader2,
  ExternalLink
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { createN8NClient } from '@/lib/integrations/n8n'
import { Database } from '@/types/database'

type Template = Database['public']['Tables']['template']['Row'] & {
  template_variables?: Database['public']['Tables']['template_variable']['Row'][]
}

interface TemplateExecutionFormProps {
  template: Template
  onSuccess?: (runId: string) => void
  onCancel?: () => void
}

interface FormData {
  [key: string]: any
}

interface ExecutionStatus {
  status: 'idle' | 'running' | 'success' | 'error'
  message?: string
  progress?: number
  executionId?: string
  artifacts?: any
}

export function TemplateExecutionForm({ template, onSuccess, onCancel }: TemplateExecutionFormProps) {
  const [formData, setFormData] = useState<FormData>({})
  const [executionStatus, setExecutionStatus] = useState<ExecutionStatus>({ status: 'idle' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: File }>({})

  // Initialize form data with default values
  useEffect(() => {
    const initialData: FormData = {}
    template.template_variables?.forEach(variable => {
      if (variable.default_value) {
        initialData[variable.name] = variable.default_value
      }
    })
    setFormData(initialData)
  }, [template.template_variables])

  const handleInputChange = (variableName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [variableName]: value
    }))
  }

  const handleFileUpload = (variableName: string, file: File) => {
    setUploadedFiles(prev => ({
      ...prev,
      [variableName]: file
    }))
    setFormData(prev => ({
      ...prev,
      [variableName]: file.name
    }))
  }

  const validateForm = (): string | null => {
    for (const variable of template.template_variables || []) {
      if (variable.required && (!formData[variable.name] || formData[variable.name] === '')) {
        return `${variable.name} is required`
      }
      
      // Validate based on type
      if (formData[variable.name]) {
        switch (variable.type) {
          case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!emailRegex.test(formData[variable.name])) {
              return `${variable.name} must be a valid email address`
            }
            break
          case 'url':
            try {
              new URL(formData[variable.name])
            } catch {
              return `${variable.name} must be a valid URL`
            }
            break
          case 'number':
            if (isNaN(Number(formData[variable.name]))) {
              return `${variable.name} must be a valid number`
            }
            break
        }
      }
    }
    return null
  }

  const handleSubmit = async () => {
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    setError(null)
    setExecutionStatus({ status: 'running', message: 'Starting execution...', progress: 0 })

    try {
      const supabase = createClient()
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('You must be logged in to execute templates')
      }

      // Create template run record
      const { data: templateRun, error: runError } = await supabase
        .from('template_run')
        .insert({
          template_id: template.id,
          triggered_by: user.id,
          input_payload: formData,
          status: 'queued'
        })
        .select()
        .single()

      if (runError) throw runError

      // Store execution context
      const contextEntries = Object.entries(formData).map(([name, value]) => ({
        template_run_id: templateRun.id,
        variable_name: name,
        variable_value: value
      }))

      if (contextEntries.length > 0) {
        const { error: contextError } = await supabase
          .from('template_execution_context')
          .insert(contextEntries)

        if (contextError) throw contextError
      }

      // Trigger n8n workflow
      const n8nClient = createN8NClient()
      const n8nResponse = await n8nClient.triggerWorkflow(template.n8n_webhook_url, formData)

      // Update template run with execution ID
      await supabase
        .from('template_run')
        .update({
          status: 'running',
          logs: `Execution started with ID: ${n8nResponse.executionId}`
        })
        .eq('id', templateRun.id)

      setExecutionStatus({
        status: 'running',
        message: 'Workflow is running...',
        progress: 50,
        executionId: n8nResponse.executionId
      })

      // Poll for completion
      const pollInterval = setInterval(async () => {
        try {
          const status = await n8nClient.getWorkflowStatus(n8nResponse.executionId)
          
          if (status.status === 'succeeded') {
            clearInterval(pollInterval)
            
            // Update template run with success
            await supabase
              .from('template_run')
              .update({
                status: 'succeeded',
                finished_at: new Date().toISOString(),
                logs: status.logs || 'Execution completed successfully',
                artifacts: status.result
              })
              .eq('id', templateRun.id)

            setExecutionStatus({
              status: 'success',
              message: 'Execution completed successfully!',
              progress: 100,
              executionId: n8nResponse.executionId,
              artifacts: status.result
            })

            onSuccess?.(templateRun.id)
          } else if (status.status === 'failed') {
            clearInterval(pollInterval)
            
            // Update template run with failure
            await supabase
              .from('template_run')
              .update({
                status: 'failed',
                finished_at: new Date().toISOString(),
                logs: status.logs || 'Execution failed',
                error_message: status.error || 'Unknown error'
              })
              .eq('id', templateRun.id)

            setExecutionStatus({
              status: 'error',
              message: status.error || 'Execution failed',
              progress: 100,
              executionId: n8nResponse.executionId
            })
          } else {
            // Still running, update progress
            setExecutionStatus(prev => ({
              ...prev,
              progress: Math.min((prev.progress || 0) + 10, 90)
            }))
          }
        } catch (pollError) {
          console.error('Error polling execution status:', pollError)
        }
      }, 2000) // Poll every 2 seconds

      // Timeout after 10 minutes
      setTimeout(() => {
        clearInterval(pollInterval)
        if (executionStatus.status === 'running') {
          setExecutionStatus({
            status: 'error',
            message: 'Execution timed out',
            progress: 100
          })
        }
      }, 600000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute template')
      setExecutionStatus({ status: 'error', message: 'Execution failed' })
    } finally {
      setLoading(false)
    }
  }

  const renderVariableInput = (variable: Database['public']['Tables']['template_variable']['Row']) => {
    const value = formData[variable.name] || ''
    const isRequired = variable.required
    const validationRules = variable.validation_rules as any

    switch (variable.type) {
      case 'string':
      case 'email':
      case 'url':
        return (
          <Input
            type={variable.type === 'email' ? 'email' : variable.type === 'url' ? 'url' : 'text'}
            value={value}
            onChange={(e) => handleInputChange(variable.name, e.target.value)}
            placeholder={variable.description || `Enter ${variable.name}`}
            required={isRequired}
            pattern={validationRules?.pattern}
          />
        )

      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleInputChange(variable.name, parseFloat(e.target.value) || '')}
            placeholder={variable.description || `Enter ${variable.name}`}
            required={isRequired}
            min={validationRules?.min}
            max={validationRules?.max}
          />
        )

      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={variable.name}
              checked={value === true}
              onChange={(e) => handleInputChange(variable.name, e.target.checked)}
              required={isRequired}
            />
            <label htmlFor={variable.name} className="text-sm">
              {variable.description || variable.name}
            </label>
          </div>
        )

      case 'select':
        const options = validationRules?.options || []
        return (
          <Select
            value={value}
            onValueChange={(val) => handleInputChange(variable.name, val)}
            required={isRequired}
          >
            <SelectTrigger>
              <SelectValue placeholder={variable.description || `Select ${variable.name}`} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option: string) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case 'multiselect':
        const multiOptions = validationRules?.options || []
        const selectedValues = Array.isArray(value) ? value : []
        return (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {selectedValues.map((val: string) => (
                <Badge key={val} variant="secondary" className="flex items-center space-x-1">
                  <span>{val}</span>
                  <button
                    onClick={() => {
                      const newValues = selectedValues.filter(v => v !== val)
                      handleInputChange(variable.name, newValues)
                    }}
                    className="ml-1 hover:text-red-500"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
            <Select
              onValueChange={(val) => {
                if (!selectedValues.includes(val)) {
                  handleInputChange(variable.name, [...selectedValues, val])
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Add options..." />
              </SelectTrigger>
              <SelectContent>
                {multiOptions.filter((option: string) => !selectedValues.includes(option)).map((option: string) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )

      case 'date':
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => handleInputChange(variable.name, e.target.value)}
            required={isRequired}
          />
        )

      case 'file':
        const file = uploadedFiles[variable.name]
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="file"
                id={variable.name}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    handleFileUpload(variable.name, file)
                  }
                }}
                accept={validationRules?.fileTypes?.join(',')}
                className="hidden"
              />
              <label htmlFor={variable.name}>
                <Button variant="outline" asChild>
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    {file ? file.name : 'Choose File'}
                  </span>
                </Button>
              </label>
            </div>
            {file && (
              <p className="text-sm text-gray-600">
                {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>
        )

      default:
        return (
          <Input
            type="text"
            value={value}
            onChange={(e) => handleInputChange(variable.name, e.target.value)}
            placeholder={variable.description || `Enter ${variable.name}`}
            required={isRequired}
          />
        )
    }
  }

  const renderExecutionStatus = () => {
    if (executionStatus.status === 'idle') return null

    return (
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            {executionStatus.status === 'running' && (
              <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
            )}
            {executionStatus.status === 'success' && (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
            {executionStatus.status === 'error' && (
              <AlertCircle className="h-5 w-5 text-red-500" />
            )}
            <div className="flex-1">
              <p className="font-medium">{executionStatus.message}</p>
              {executionStatus.executionId && (
                <p className="text-sm text-gray-600">
                  Execution ID: {executionStatus.executionId}
                </p>
              )}
              {executionStatus.progress !== undefined && (
                <Progress value={executionStatus.progress} className="mt-2" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderArtifacts = () => {
    if (!executionStatus.artifacts) return null

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Execution Results</CardTitle>
          <CardDescription>Your workflow has completed successfully</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(executionStatus.artifacts).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="font-medium">{key}:</span>
                <span className="text-sm text-gray-600">
                  {typeof value === 'string' && value.startsWith('http') ? (
                    <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                      {value} <ExternalLink className="h-3 w-3 inline ml-1" />
                    </a>
                  ) : (
                    String(value)
                  )}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>{template.name}</span>
          </CardTitle>
          <CardDescription>{template.description}</CardDescription>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{template.estimated_duration_minutes} min</span>
            </div>
            <Badge variant="outline">{template.difficulty_level}</Badge>
            {template.tags && template.tags.length > 0 && (
              <div className="flex space-x-1">
                {template.tags.slice(0, 3).map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                ))}
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {renderExecutionStatus()}
      {renderArtifacts()}

      {executionStatus.status === 'idle' && (
        <Card>
          <CardHeader>
            <CardTitle>Configure Variables</CardTitle>
            <CardDescription>
              Fill in the required information to execute this template
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {template.template_variables?.map((variable) => (
              <div key={variable.id} className="space-y-2">
                <label className="text-sm font-medium">
                  {variable.name}
                  {variable.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {variable.description && (
                  <p className="text-sm text-gray-600">{variable.description}</p>
                )}
                {renderVariableInput(variable)}
              </div>
            ))}

            {template.execution_instructions && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Instructions</h4>
                <p className="text-sm text-blue-800">{template.execution_instructions}</p>
              </div>
            )}

            {error && (
              <div className="flex items-center space-x-2 text-red-600 p-3 bg-red-50 rounded-lg">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Executing...</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    <span>Execute Template</span>
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
