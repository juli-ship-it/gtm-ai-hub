'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  ExternalLink,
  Copy,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Download
} from 'lucide-react'
import { cloneWorkflowToN8N, N8NCloneResult } from '@/lib/integrations/n8n-workflow-cloner'
import { Database } from '@/types/database'
import { N8NScheduleTriggerForm } from './n8n-schedule-trigger-form'

type Template = Database['public']['Tables']['template']['Row'] & {
  template_variables?: Database['public']['Tables']['template_variable']['Row'][]
}

interface TemplateCloneFormProps {
  template: Template
  onClose: () => void
}

export function TemplateCloneForm({ template, onClose }: TemplateCloneFormProps) {
  const [userVariables, setUserVariables] = useState<Record<string, any>>({})
  const [cloneResult, setCloneResult] = useState<N8NCloneResult | null>(null)
  const [isCloning, setIsCloning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize user variables with defaults
  useEffect(() => {
    
    const initialVariables: Record<string, any> = {}
    
    if (template.template_variables && template.template_variables.length > 0) {
      template.template_variables.forEach(variable => {
        console.log('Processing variable:', variable.name, 'type:', variable.type, 'category:', (variable as any).category)
        if (variable.default_value !== null) {
          initialVariables[variable.name] = variable.default_value
        } else {
          // Set sensible defaults based on variable type
          switch (variable.type) {
            case 'string':
              initialVariables[variable.name] = ''
              break
            case 'number':
              initialVariables[variable.name] = 1
              break
            case 'boolean':
              initialVariables[variable.name] = false
              break
            case 'email':
              initialVariables[variable.name] = ''
              break
            case 'url':
              initialVariables[variable.name] = ''
              break
            default:
              initialVariables[variable.name] = ''
          }
        }
      })
    }
    
    setUserVariables(initialVariables)
  }, [template.template_variables])

  const handleVariableChange = (variableName: string, value: any) => {
    setUserVariables(prev => ({
      ...prev,
      [variableName]: value
    }))
  }

  const getDefaultOptionsForVariable = (variable: any) => {
    // Provide default options for common variable types
    if (variable.name === 'scheduleInterval' || variable.name === 'Trigger Interval') {
      return ['Seconds', 'Minutes', 'Hours', 'Days', 'Weeks', 'Months', 'Custom (Cron)']
    }
    if (variable.name === 'triggerAtHour' || variable.name === 'Trigger at Hour') {
      return Array.from({length: 24}, (_, i) => i.toString())
    }
    if (variable.name === 'triggerAtMinute' || variable.name === 'Trigger at Minute') {
      return Array.from({length: 60}, (_, i) => i.toString())
    }
    // Default fallback
    return ['Option 1', 'Option 2', 'Option 3']
  }

  const handleCloneToN8N = async () => {
    if (!template.n8n_workflow_json) {
      setError('This template does not have an n8n workflow to clone.')
      return
    }

    setIsCloning(true)
    setError(null)
    setCloneResult(null)

    try {
      
      // Clone the workflow with user's variables
      const result = await cloneWorkflowToN8N(template.n8n_workflow_json, userVariables)
      
      console.log('Clone result:', result)
      setCloneResult(result)
    } catch (err) {
      console.error('Clone error:', err)
      setError(err instanceof Error ? err.message : 'Failed to clone workflow to n8n')
    } finally {
      setIsCloning(false)
    }
  }



  const downloadWorkflow = () => {
    if (cloneResult?.workflowJson) {
      const blob = new Blob([cloneResult.workflowJson], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${cloneResult.workflowName}.json`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Clone Template: {template.name}</h2>
        <p className="text-gray-600">{template.description}</p>
      </div>

      {!cloneResult ? (
        <Card>
          <CardHeader>
            <CardTitle>Configure Your Variables</CardTitle>
            <CardDescription>
              Fill out the variables below to customize this workflow for your use case.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {template.template_variables && template.template_variables.length > 0 ? (
              <div className="space-y-4">
                {template.template_variables.map((variable, index) => {
                  const varWithExtras = variable as any // Type assertion for extended fields
                  return (
                  <div key={variable.id || index} className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium">
                        {variable.name}
                        {variable.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      <Badge variant="outline">{variable.type}</Badge>
                      {varWithExtras.category && <Badge variant="secondary">{varWithExtras.category}</Badge>}
                    </div>
                    
                    {variable.description && (
                      <p className="text-sm text-gray-600">{variable.description}</p>
                    )}

                    {variable.type === 'string' || variable.type === 'email' || variable.type === 'url' ? (
                      <Input
                        type={variable.type === 'email' ? 'email' : 'text'}
                        value={userVariables[variable.name] || ''}
                        onChange={(e) => handleVariableChange(variable.name, e.target.value)}
                        placeholder={`Enter your ${variable.name}`}
                        required={variable.required}
                      />
                    ) : variable.type === 'number' ? (
                      <Input
                        type="number"
                        value={userVariables[variable.name] || 1}
                        onChange={(e) => handleVariableChange(variable.name, parseInt(e.target.value) || 1)}
                        placeholder={`Enter your ${variable.name}`}
                        required={variable.required}
                        min={varWithExtras.validation?.min}
                        max={varWithExtras.validation?.max}
                      />
                    ) : variable.type === 'boolean' ? (
                      <Select
                        value={userVariables[variable.name] ? 'true' : 'false'}
                        onValueChange={(value) => handleVariableChange(variable.name, value === 'true')}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Yes</SelectItem>
                          <SelectItem value="false">No</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : variable.type === 'select' ? (
                      <Select
                        value={userVariables[variable.name] || variable.default_value || ''}
                        onValueChange={(value) => handleVariableChange(variable.name, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={`Select ${variable.name}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {(() => {
                            const options = varWithExtras.options || varWithExtras.n8n_enum || getDefaultOptionsForVariable(variable)
                            return options.map((option: string) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))
                          })()}
                        </SelectContent>
                      </Select>
                    ) : variable.type === 'multiselect' ? (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">Select multiple options:</p>
                        <div className="space-y-1">
                          {(varWithExtras.options || []).map((option: string) => (
                            <label key={option} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={(userVariables[variable.name] || []).includes(option)}
                                onChange={(e) => {
                                  const currentValues = userVariables[variable.name] || []
                                  if (e.target.checked) {
                                    handleVariableChange(variable.name, [...currentValues, option])
                                  } else {
                                    handleVariableChange(variable.name, currentValues.filter((v: string) => v !== option))
                                  }
                                }}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <span className="text-sm">{option}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ) : variable.name === 'Trigger Interval' || varWithExtras.category === 'schedule' || variable.name.includes('Trigger') ? (
                      <div className="space-y-4 p-4 border rounded-lg bg-blue-50">
                        <h4 className="font-medium text-blue-900">n8n Schedule Trigger Configuration</h4>
                        <p className="text-sm text-blue-800">
                          This is a schedule trigger variable. The n8n form will be shown here.
                        </p>
                        <N8NScheduleTriggerForm
                          onValuesChange={(values) => {
                            // Update all schedule-related values
                            Object.entries(values).forEach(([key, value]) => {
                              handleVariableChange(key, value)
                            })
                          }}
                          initialValues={userVariables}
                        />
                      </div>
                    ) : varWithExtras.category === 'excel_config' ? (
                      <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                        <h4 className="font-medium">Excel Worksheet Configuration</h4>
                        {varWithExtras.excelConfig?.sheets.map((sheet: string) => (
                          <div key={sheet} className="space-y-2">
                            <label className="font-medium text-sm">{sheet}</label>
                            <div className="space-y-1">
                              {varWithExtras.excelConfig?.columns[sheet]?.map((column: string) => (
                                <label key={column} className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    checked={(userVariables[variable.name]?.[sheet] || []).includes(column)}
                                    onChange={(e) => {
                                      const currentConfig = userVariables[variable.name] || {}
                                      const currentColumns = currentConfig[sheet] || []
                                      if (e.target.checked) {
                                        handleVariableChange(variable.name, {
                                          ...currentConfig,
                                          [sheet]: [...currentColumns, column]
                                        })
                                      } else {
                                        handleVariableChange(variable.name, {
                                          ...currentConfig,
                                          [sheet]: currentColumns.filter((c: string) => c !== column)
                                        })
                                      }
                                    }}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                  />
                                  <span className="text-sm">{column}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Textarea
                        value={userVariables[variable.name] || ''}
                        onChange={(e) => handleVariableChange(variable.name, e.target.value)}
                        placeholder={`Enter your ${variable.name}`}
                        rows={3}
                        required={variable.required}
                      />
                    )}
                  </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">This template has no variables to configure.</p>
              </div>
            )}

            {/* Security Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-amber-800">Security Notice</h4>
                  <p className="text-sm text-amber-700">
                    <strong>Credentials and API keys have been removed for security.</strong> You'll need to manually configure the following in n8n after importing:
                  </p>
                  <ul className="text-sm text-amber-700 list-disc list-inside space-y-1 ml-4">
                    <li>HubSpot API credentials</li>
                    <li>Microsoft Excel/Office 365 credentials</li>
                    <li>Any other authentication tokens or API keys</li>
                  </ul>
                  <p className="text-sm text-amber-700">
                    Look for <code className="bg-amber-100 px-1 rounded">[CONFIGURE_MANUALLY_IN_N8N]</code> placeholders in the imported workflow.
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-center space-x-2 text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleCloneToN8N}
                disabled={isCloning}
                className="flex items-center space-x-2"
              >
                {isCloning ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    <span>Cloning...</span>
                  </>
                ) : (
                  <>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    <span>Clone to n8n</span>
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Workflow Cloned Successfully!</span>
            </CardTitle>
            <CardDescription>
              Your workflow has been prepared for import into n8n with {cloneResult.variablesInjected} variables injected.
              <br />
              <span className="text-amber-600 font-medium">⚠️ Remember to configure credentials manually in n8n after importing.</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-center">
                  <Button
                    onClick={downloadWorkflow}
                    className="flex items-center space-x-2 bg-wl-accent hover:bg-wl-accent/90 text-white px-6 py-3"
                  >
                    <Download className="h-5 w-5 mr-2" />
                    Download JSON
                  </Button>
                </div>
                <p className="text-sm text-gray-600 text-center">
                  Download the workflow and import it manually in n8n
                </p>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">What happens next:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Your variables have been pre-configured in the workflow</li>
                <li>• The workflow will start as inactive for safety</li>
                <li>• Review and test the workflow before activating</li>
                <li>• You can modify values in n8n if needed</li>
              </ul>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setCloneResult(null)}>
                Configure Again
              </Button>
              <Button onClick={onClose}>
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
