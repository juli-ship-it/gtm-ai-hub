'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
// import { mockApi } from '@/lib/mock-data'
import { parameterizeN8NWorkflow } from '@/lib/integrations/n8n-workflow-parameterizer'
import { Play, Eye, Settings, Upload, FileText } from 'lucide-react'

export default function TemplateSystemDemo() {
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)
  const [variables, setVariables] = useState<Record<string, any>>({})
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionResult, setExecutionResult] = useState<any>(null)
  const [workflowJson, setWorkflowJson] = useState<string>('')

  const handleTemplateSelect = async (template: any) => {
    setSelectedTemplate(template)
    setVariables({})
    setExecutionResult(null)
    
    // Show the original workflow JSON
    setWorkflowJson(JSON.stringify(template.n8n_workflow_json, null, 2))
  }

  const handleVariableChange = (variableName: string, value: any) => {
    setVariables(prev => ({
      ...prev,
      [variableName]: value
    }))
  }

  const handleExecute = async () => {
    if (!selectedTemplate) return

    setIsExecuting(true)
    try {
      // Simulate parameterizing the workflow with user variables
      const parameterizedWorkflow = parameterizeN8NWorkflow(selectedTemplate.n8n_workflow_json)
      
      // Show the parameterized workflow
      setWorkflowJson(JSON.stringify(parameterizedWorkflow.parameterizedWorkflow, null, 2))
      
      // Execute the template
      const result = await mockApi.executeTemplate(selectedTemplate.id, variables)
      setExecutionResult(result)
    } catch (error) {
      console.error('Execution error:', error)
    } finally {
      setIsExecuting(false)
    }
  }

  const handleWorkflowUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const workflow = JSON.parse(e.target?.result as string)
        const parameterized = parameterizeN8NWorkflow(workflow)
        
        // Create a mock template from the uploaded workflow
        const mockTemplate = {
          id: 'uploaded-workflow',
          name: 'Uploaded Workflow',
          description: 'Workflow uploaded for demonstration',
          n8n_workflow_json: workflow,
          template_variables: parameterized.variables.map((v, index) => ({
            id: `var-${index}`,
            template_id: 'uploaded-workflow',
            name: v.suggestedName,
            type: v.type,
            required: v.isRequired,
            description: v.description,
            default_value: null,
            validation_rules: null,
            order_index: index,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }))
        }
        
        setSelectedTemplate(mockTemplate)
        setVariables({})
        setExecutionResult(null)
        setWorkflowJson(JSON.stringify(workflow, null, 2))
      } catch (error) {
        console.error('Error parsing workflow:', error)
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Template System Demo</h1>
          <p className="mt-2 text-gray-600">
            See how the template system parameterizes hardcoded values in n8n workflows
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Template Selection */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Select a Template</CardTitle>
                <CardDescription>
                  Choose from pre-built templates or upload your own n8n workflow
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="workflow-upload">Upload n8n Workflow JSON</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="workflow-upload"
                      type="file"
                      accept=".json"
                      onChange={handleWorkflowUpload}
                      className="flex-1"
                    />
                    <Upload className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Or select a pre-built template:</Label>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => handleTemplateSelect(mockApi.getTemplates().then(t => t[0]))}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      HubSpot to Google Sheets
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => handleTemplateSelect(mockApi.getTemplates().then(t => t[1]))}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Slack Notification
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Variable Configuration */}
            {selectedTemplate && (
              <Card>
                <CardHeader>
                  <CardTitle>Configure Variables</CardTitle>
                  <CardDescription>
                    Set the values for the detected variables
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedTemplate.template_variables?.map((variable: any) => (
                    <div key={variable.id} className="space-y-2">
                      <Label htmlFor={variable.name}>
                        {variable.name}
                        {variable.required && <span className="text-red-500 ml-1">*</span>}
                      </Label>
                      <p className="text-sm text-gray-600">{variable.description}</p>
                      
                      {variable.type === 'string' && (
                        <Input
                          id={variable.name}
                          value={variables[variable.name] || ''}
                          onChange={(e) => handleVariableChange(variable.name, e.target.value)}
                          placeholder={variable.default_value || ''}
                        />
                      )}
                      
                      {variable.type === 'select' && (
                        <Select
                          value={variables[variable.name] || ''}
                          onValueChange={(value) => handleVariableChange(variable.name, value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select an option" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="contact">Contact</SelectItem>
                            <SelectItem value="company">Company</SelectItem>
                            <SelectItem value="deal">Deal</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  ))}
                  
                  <Button
                    onClick={handleExecute}
                    disabled={isExecuting}
                    className="w-full"
                  >
                    {isExecuting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Executing...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Execute Template
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Execution Result */}
            {executionResult && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-600">Execution Successful!</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p><strong>Run ID:</strong> {executionResult.runId}</p>
                    <p><strong>Status:</strong> <Badge variant="default">Completed</Badge></p>
                    <p><strong>Variables Used:</strong></p>
                    <pre className="bg-gray-100 p-2 rounded text-sm">
                      {JSON.stringify(variables, null, 2)}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Workflow JSON Display */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Workflow JSON</CardTitle>
                <CardDescription>
                  {selectedTemplate ? 'Parameterized workflow with your variables' : 'Upload a workflow to see the parameterization'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {workflowJson ? (
                  <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
                    {workflowJson}
                  </pre>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No workflow selected</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Detected Variables */}
            {selectedTemplate && (
              <Card>
                <CardHeader>
                  <CardTitle>Detected Variables</CardTitle>
                  <CardDescription>
                    Variables automatically detected from the workflow
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {selectedTemplate.template_variables?.map((variable: any) => (
                      <div key={variable.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div>
                          <span className="font-medium">{variable.name}</span>
                          <Badge variant="outline" className="ml-2">{variable.type}</Badge>
                          {variable.required && <Badge variant="destructive" className="ml-1">Required</Badge>}
                        </div>
                        <span className="text-sm text-gray-600">{variable.description}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}