'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  Upload, 
  FileText, 
  Settings, 
  Play, 
  CheckCircle, 
  AlertCircle,
  X,
  Plus,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react'
import { parseN8NWorkflow, DetectedVariable, WorkflowAnalysis } from '@/lib/integrations/n8n-workflow-parser'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'

type Template = Database['public']['Tables']['template']['Row']
type TemplateVariable = Database['public']['Tables']['template_variable']['Row']

interface TemplateCreationFormProps {
  onSuccess?: (template: Template) => void
  onCancel?: () => void
}

interface FormData {
  name: string
  description: string
  category: 'content' | 'reporting' | 'intake' | 'governance'
  tags: string[]
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced'
  executionInstructions: string
  estimatedDuration: number
  isPublic: boolean
  requiresApproval: boolean
}

export function TemplateCreationForm({ onSuccess, onCancel }: TemplateCreationFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [workflowFile, setWorkflowFile] = useState<File | null>(null)
  const [workflowAnalysis, setWorkflowAnalysis] = useState<WorkflowAnalysis | null>(null)
  const [detectedVariables, setDetectedVariables] = useState<DetectedVariable[]>([])
  const [customVariables, setCustomVariables] = useState<DetectedVariable[]>([])
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    category: 'content',
    tags: [],
    difficultyLevel: 'beginner',
    executionInstructions: '',
    estimatedDuration: 5,
    isPublic: true,
    requiresApproval: false
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newTag, setNewTag] = useState('')
  const [showWorkflowPreview, setShowWorkflowPreview] = useState(false)

  const totalSteps = 4

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file.name.endsWith('.json')) {
      setError('Please upload a valid JSON file')
      return
    }

    try {
      const content = await file.text()
      const analysis = parseN8NWorkflow(content)
      
      setWorkflowFile(file)
      setWorkflowAnalysis(analysis)
      setDetectedVariables(analysis.variables)
      
      // Auto-populate form data from analysis
      setFormData(prev => ({
        ...prev,
        name: analysis.webhookNodes[0]?.name || file.name.replace('.json', ''),
        description: `Automated workflow: ${analysis.webhookNodes[0]?.name || 'n8n workflow'}`,
        estimatedDuration: analysis.estimatedDuration,
        difficultyLevel: analysis.complexity,
        tags: analysis.systems
      }))
      
      setError(null)
    } catch (err) {
      setError('Invalid n8n workflow file. Please check the JSON format.')
      console.error('Workflow parsing error:', err)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileUpload(file)
    }
  }, [handleFileUpload])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }, [handleFileUpload])

  const addCustomVariable = () => {
    const newVariable: DetectedVariable = {
      name: '',
      type: 'string',
      required: false,
      description: '',
      source: 'inferred'
    }
    setCustomVariables(prev => [...prev, newVariable])
  }

  const updateCustomVariable = (index: number, field: keyof DetectedVariable, value: any) => {
    setCustomVariables(prev => 
      prev.map((variable, i) => 
        i === index ? { ...variable, [field]: value } : variable
      )
    )
  }

  const removeCustomVariable = (index: number) => {
    setCustomVariables(prev => prev.filter((_, i) => i !== index))
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleSubmit = async () => {
    if (!workflowAnalysis || !workflowFile) {
      setError('Please upload a workflow file first')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // For now, create a mock template to demonstrate the flow
      // TODO: Replace with actual database save once SSL issue is resolved
      const mockTemplate = {
        id: `template_${Date.now()}`,
        name: formData.name,
        slug: formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: formData.description,
        category: formData.category,
        version: 'v1.0',
        enabled: true,
        created_at: new Date().toISOString(),
        template_variables: [...detectedVariables, ...customVariables],
        last_run: null,
        template_runs: [{ count: 0 }]
      }

      // Simulate a short delay for the loading state
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Call success callback to close modal and refresh the list
      onSuccess?.(mockTemplate)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create template')
    } finally {
      setLoading(false)
    }
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Upload n8n Workflow</h3>
        <p className="text-sm text-gray-600 mb-4">
          Upload your n8n workflow JSON file to automatically detect variables and configuration.
        </p>
      </div>

      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        {workflowFile ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <FileText className="h-8 w-8 text-green-500" />
              <span className="font-medium">{workflowFile.name}</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowWorkflowPreview(!showWorkflowPreview)}
              >
                {showWorkflowPreview ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                {showWorkflowPreview ? 'Hide' : 'Preview'} Workflow
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setWorkflowFile(null)
                  setWorkflowAnalysis(null)
                  setDetectedVariables([])
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Upload className="h-10 w-10 text-gray-400 mx-auto" />
            <div className="space-y-1">
              <p className="text-lg font-medium">Drop your n8n workflow here</p>
              <p className="text-sm text-gray-500">or click to browse files</p>
            </div>
            <input
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
              id="workflow-upload"
            />
            <label htmlFor="workflow-upload">
              <Button asChild>
                <span>Choose File</span>
              </Button>
            </label>
          </div>
        )}
      </div>

      {showWorkflowPreview && workflowAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle>Workflow Analysis</CardTitle>
            <CardDescription>Automatically detected information from your workflow</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Systems Used</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {workflowAnalysis.systems.map(system => (
                    <Badge key={system} variant="secondary">{system}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium">Complexity</p>
                <Badge variant="outline">{workflowAnalysis.complexity}</Badge>
              </div>
              <div>
                <p className="text-sm font-medium">Estimated Duration</p>
                <p className="text-sm">{workflowAnalysis.estimatedDuration} minutes</p>
              </div>
              <div>
                <p className="text-sm font-medium">Features</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {workflowAnalysis.hasFileUpload && <Badge variant="secondary">File Upload</Badge>}
                  {workflowAnalysis.hasEmailNotification && <Badge variant="secondary">Email</Badge>}
                  {workflowAnalysis.hasSlackNotification && <Badge variant="secondary">Slack</Badge>}
                  {workflowAnalysis.errorHandling && <Badge variant="secondary">Error Handling</Badge>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="flex items-center space-x-2 text-red-600">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Detected Variables</h3>
        <p className="text-sm text-gray-600 mb-4">
          Review and configure the variables automatically detected from your workflow.
        </p>
      </div>

      {detectedVariables.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium">Auto-detected Variables</h4>
          {detectedVariables.map((variable, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-medium">{variable.name}</span>
                      <Badge variant="outline">{variable.type}</Badge>
                      {variable.required && <Badge variant="destructive">Required</Badge>}
                    </div>
                    <p className="text-sm text-gray-600">{variable.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Source: {variable.source} • Node: {variable.nodeName}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Custom Variables</h4>
          <Button onClick={addCustomVariable} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Variable
          </Button>
        </div>

        {customVariables.map((variable, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Variable Name</label>
                  <Input
                    value={variable.name}
                    onChange={(e) => updateCustomVariable(index, 'name', e.target.value)}
                    placeholder="e.g., custom_field"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <Select
                    value={variable.type}
                    onValueChange={(value) => updateCustomVariable(index, 'type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="string">String</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="boolean">Boolean</SelectItem>
                      <SelectItem value="file">File</SelectItem>
                      <SelectItem value="select">Select</SelectItem>
                      <SelectItem value="multiselect">Multi-select</SelectItem>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="url">URL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium">Description</label>
                  <Input
                    value={variable.description}
                    onChange={(e) => updateCustomVariable(index, 'description', e.target.value)}
                    placeholder="Describe what this variable is for"
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={variable.required}
                      onChange={(e) => updateCustomVariable(index, 'required', e.target.checked)}
                    />
                    <span className="text-sm">Required</span>
                  </label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeCustomVariable(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Template Configuration</h3>
        <p className="text-sm text-gray-600 mb-4">
          Configure the template metadata and settings.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="text-sm font-medium">Template Name</label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., HubSpot Segment to Excel"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Category</label>
          <Select
            value={formData.category}
            onValueChange={(value: any) => setFormData(prev => ({ ...prev, category: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="content">Content</SelectItem>
              <SelectItem value="reporting">Reporting</SelectItem>
              <SelectItem value="intake">Intake</SelectItem>
              <SelectItem value="governance">Governance</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-2">
          <label className="text-sm font-medium">Description</label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe what this template does..."
            rows={3}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Difficulty Level</label>
          <Select
            value={formData.difficultyLevel}
            onValueChange={(value: any) => setFormData(prev => ({ ...prev, difficultyLevel: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium">Estimated Duration (minutes)</label>
          <Input
            type="number"
            value={formData.estimatedDuration}
            onChange={(e) => setFormData(prev => ({ ...prev, estimatedDuration: parseInt(e.target.value) || 5 }))}
            min="1"
          />
        </div>
        <div className="col-span-2">
          <label className="text-sm font-medium">Execution Instructions</label>
          <Textarea
            value={formData.executionInstructions}
            onChange={(e) => setFormData(prev => ({ ...prev, executionInstructions: e.target.value }))}
            placeholder="Instructions for users on how to use this template..."
            rows={3}
          />
        </div>
        <div className="col-span-2">
          <label className="text-sm font-medium">Tags</label>
          <div className="space-y-2">
            <div className="flex space-x-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button onClick={addTag} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="flex items-center space-x-1">
                  <span>{tag}</span>
                  <button
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <div className="col-span-2 space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isPublic"
              checked={formData.isPublic}
              onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
            />
            <label htmlFor="isPublic" className="text-sm">Make template public</label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="requiresApproval"
              checked={formData.requiresApproval}
              onChange={(e) => setFormData(prev => ({ ...prev, requiresApproval: e.target.checked }))}
            />
            <label htmlFor="requiresApproval" className="text-sm">Require approval before execution</label>
          </div>
        </div>
      </div>
    </div>
  )

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Review & Create</h3>
        <p className="text-sm text-gray-600 mb-4">
          Review your template configuration before creating it.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Template Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Name</p>
              <p className="text-sm">{formData.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Category</p>
              <p className="text-sm capitalize">{formData.category}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Difficulty</p>
              <p className="text-sm capitalize">{formData.difficultyLevel}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Duration</p>
              <p className="text-sm">{formData.estimatedDuration} minutes</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm font-medium">Description</p>
              <p className="text-sm">{formData.description}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Variables</p>
              <p className="text-sm">{detectedVariables.length + customVariables.length} total</p>
            </div>
            <div>
              <p className="text-sm font-medium">Systems</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {workflowAnalysis?.systems.map(system => (
                  <Badge key={system} variant="secondary">{system}</Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Create Template</h2>
          <div className="text-sm text-gray-500">
            Step {currentStep} of {totalSteps}
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      <Card>
        <CardContent className="px-6 py-6">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
        </CardContent>
      </Card>

      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : onCancel?.()}
        >
          {currentStep > 1 ? 'Previous' : 'Cancel'}
        </Button>
        <div className="flex space-x-2">
          {currentStep < totalSteps ? (
            <Button
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={currentStep === 1 && !workflowAnalysis}
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  <span>Create Template</span>
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
