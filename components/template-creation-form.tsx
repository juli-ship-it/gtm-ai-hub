'use client'

import { useState, useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
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
  EyeOff,
} from 'lucide-react'
import { parseN8NWorkflow, DetectedVariable, WorkflowAnalysis } from '@/lib/integrations/n8n-workflow-parser'
import { parseSmartWorkflow, SmartWorkflowAnalysis, SmartVariable } from '@/lib/integrations/smart-workflow-parser'
import { analyzeWorkflowWithAI, AIWorkflowAnalysis, AIVariable } from '@/lib/integrations/ai-workflow-analyzer'
import { Database } from '@/types/database'

type Template = Database['public']['Tables']['template']['Row']
type TemplateVariable = Database['public']['Tables']['template_variable']['Row']

interface TemplateCreationFormProps {
  template?: Template // Optional template for editing
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
  howToUseVideoUrl: string
  howItWasBuiltVideoUrl: string
}

export function TemplateCreationForm({ template, onSuccess, onCancel }: TemplateCreationFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [workflowFile, setWorkflowFile] = useState<File | null>(null)
  const [workflowAnalysis, setWorkflowAnalysis] = useState<WorkflowAnalysis | null>(null)
  const [smartAnalysis, setSmartAnalysis] = useState<SmartWorkflowAnalysis | null>(null)
  const [aiAnalysis, setAiAnalysis] = useState<AIWorkflowAnalysis | null>(null)
  const [originalWorkflowJson, setOriginalWorkflowJson] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
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
    requiresApproval: false,
    howToUseVideoUrl: '',
    howItWasBuiltVideoUrl: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newTag, setNewTag] = useState('')
  const [showWorkflowPreview, setShowWorkflowPreview] = useState(false)

  const totalSteps = 4

  // Convert AI variables to detected variables
  const convertAIVariable = (aiVar: AIVariable): DetectedVariable => ({
    name: aiVar.name,
    type: aiVar.type,
    required: aiVar.required,
    description: aiVar.description,
    defaultValue: aiVar.defaultValue,
    options: aiVar.options,
    validation: aiVar.validation,
    source: 'inferred',
    nodeId: '',
    nodeName: ''
  })

  // Populate form when editing existing template
  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name || '',
        description: template.description || '',
        category: (template.category as any) || 'content',
        difficultyLevel: (template.difficulty_level as any) || 'beginner',
        tags: template.tags || [],
        executionInstructions: template.execution_instructions || '',
        estimatedDuration: template.estimated_duration_minutes || 5,
        isPublic: template.is_public || true,
        requiresApproval: template.requires_approval || false,
        howToUseVideoUrl: template.how_to_use_video_url || '',
        howItWasBuiltVideoUrl: template.how_it_was_built_video_url || ''
      })
      
      // If template has workflow data, populate it
      if (template.n8n_workflow_json) {
        setOriginalWorkflowJson(template.n8n_workflow_json as any)
      }
      if ((template as any).workflow_analysis) {
        setWorkflowAnalysis((template as any).workflow_analysis as any)
        setDetectedVariables((template as any).template_variables || [])
      }
    }
  }, [template])

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file.name.endsWith('.json')) {
      setError('Please upload a valid JSON file')
      return
    }

    try {
      const content = await file.text()
      const originalWorkflow = JSON.parse(content)
      
      setWorkflowFile(file)
      setOriginalWorkflowJson(originalWorkflow)
      
      // Run basic analysis for immediate feedback
      const analysis = parseN8NWorkflow(content)
      const smartAnalysis = parseSmartWorkflow(content)
      setWorkflowAnalysis(analysis)
      setSmartAnalysis(smartAnalysis)
      
      // Auto-populate basic form data
      setFormData(prev => ({
        ...prev,
        name: file.name.replace('.json', ''),
        description: 'Upload your n8n workflow to get started',
        estimatedDuration: 5,
        difficultyLevel: 'beginner',
        tags: [],
        executionInstructions: 'Upload your workflow and click "Analyze with AI" to get detailed instructions and variable extraction.'
      }))
      
      setError(null)
    } catch (err) {
      setError('Invalid n8n workflow file. Please check the JSON format.')
      console.error('Workflow parsing error:', err)
    }
  }, [])

  const handleAIAnalysis = useCallback(async () => {
    if (!originalWorkflowJson) {
      setError('Please upload a workflow file first')
      return
    }

    setIsAnalyzing(true)
    setError(null)

    try {
      const content = JSON.stringify(originalWorkflowJson)
      
      // Run AI analysis
      const aiAnalysis = await analyzeWorkflowWithAI(content)
      setAiAnalysis(aiAnalysis)
      setDetectedVariables(aiAnalysis.detectedVariables.map(convertAIVariable))
      
      // Auto-populate form data from AI analysis
      setFormData(prev => ({
        ...prev,
        name: aiAnalysis.workflowName || formData.name,
        description: aiAnalysis.workflowDescription,
        estimatedDuration: aiAnalysis.estimatedDuration,
        difficultyLevel: aiAnalysis.complexity === 'simple' ? 'beginner' : aiAnalysis.complexity,
        tags: aiAnalysis.systems,
        executionInstructions: `Step-by-Step Instructions:\n\n1. Initial Setup\n• Review the workflow requirements and variables\n• Ensure you have access to all required systems\n• Gather necessary credentials and API keys\n\n2. Configuration\n• Configure schedule settings (if applicable)\n• Set up data source connections (${aiAnalysis.systems.filter(s => s !== 'scheduler').join(', ')})\n• Configure data destination settings (Excel, Google Sheets, etc.)\n• Set up notification preferences\n\n3. Variable Configuration\n• Fill in all required template variables\n• Test connections to external systems\n• Verify data mapping and transformations\n\n4. Testing & Deployment\n• Run the workflow in test mode\n• Verify data output and format\n• Set up monitoring and alerts\n• Deploy to production environment\n\n5. Maintenance\n• Monitor workflow performance\n• Update credentials as needed\n• Review and optimize data processing\n• Keep documentation up to date\n\nBusiness Logic:\n${aiAnalysis.businessLogic}\n\nAI Insights:\n${aiAnalysis.aiInsights.map(insight => `• ${insight}`).join('\n')}\n\nSystems Used: ${aiAnalysis.systems.join(', ')}`
      }))
      
    } catch (err) {
      setError('AI analysis failed. Please try again.')
      console.error('AI analysis error:', err)
    } finally {
      setIsAnalyzing(false)
    }
  }, [originalWorkflowJson, formData.name])

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
    if (!originalWorkflowJson) {
      setError('Please upload a workflow file first')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('You must be logged in to create templates')
      }

      const isEditing = !!template
      const baseSlug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      const timestamp = Date.now()
      const slug = `${baseSlug}-${timestamp}`

      if (isEditing) {
        // Update existing template
        const { data: updatedTemplate, error: updateError } = await (supabase as any)
          .from('template')
          .update({
            name: formData.name,
            slug: slug,
            description: formData.description,
            category: formData.category,
            tags: formData.tags,
            difficulty_level: formData.difficultyLevel,
            execution_instructions: formData.executionInstructions,
            estimated_duration_minutes: formData.estimatedDuration,
            is_public: formData.isPublic,
            requires_approval: formData.requiresApproval,
            n8n_workflow_json: originalWorkflowJson || null,
            how_to_use_video_url: formData.howToUseVideoUrl || null,
            how_it_was_built_video_url: formData.howItWasBuiltVideoUrl || null,
            last_modified_at: new Date().toISOString()
          })
          .eq('id', template.id)
          .select()
          .single()

        if (updateError) throw updateError

        // Update template variables
        if (detectedVariables.length > 0 || customVariables.length > 0) {
          // Delete existing variables
          await (supabase as any)
            .from('template_variable')
            .delete()
            .eq('template_id', template.id)

          // Insert new variables
          const allVariables = [...detectedVariables, ...customVariables]
          if (allVariables.length > 0) {
            const variablesToInsert = allVariables.map((variable, index) => ({
              template_id: template.id,
              name: variable.name,
              type: variable.type,
              required: variable.required,
              description: variable.description,
              default_value: variable.defaultValue,
              validation_rules: variable.validation,
              order_index: index
            }))

            const { error: variablesError } = await (supabase as any)
              .from('template_variable')
              .insert(variablesToInsert)

            if (variablesError) {
            console.error('Template variables creation error:', variablesError)
            console.error('Variables error details:', JSON.stringify(variablesError, null, 2))
            // Don't fail the entire template creation if variables fail
            console.warn('Template created successfully, but variables failed to save')
          }
          }
        }

        onSuccess?.(updatedTemplate)
      } else {
        // Create new template
        const { data: newTemplate, error: createError } = await (supabase as any)
          .from('template')
          .insert({
            name: formData.name,
            slug: slug,
            description: formData.description,
            category: formData.category,
            tags: formData.tags,
            difficulty_level: formData.difficultyLevel,
            execution_instructions: formData.executionInstructions,
            estimated_duration_minutes: formData.estimatedDuration,
            is_public: formData.isPublic,
            requires_approval: formData.requiresApproval,
            n8n_workflow_json: originalWorkflowJson || null,
            how_to_use_video_url: formData.howToUseVideoUrl || null,
            how_it_was_built_video_url: formData.howItWasBuiltVideoUrl || null,
            n8n_webhook_url: 'https://placeholder-webhook-url.com', // Will be set when workflow is deployed
            created_by: user.id,
            enabled: true
          })
          .select()
          .single()

        if (createError) {
          console.error('Template creation error:', createError)
          console.error('Error details:', JSON.stringify(createError, null, 2))
          throw new Error(`Failed to create template: ${createError.message || JSON.stringify(createError)}`)
        }

        // Insert template variables (optional - don't fail if this fails)
        const allVariables = [...detectedVariables, ...customVariables]
        if (allVariables.length > 0) {
          const variablesToInsert = allVariables.map((variable, index) => ({
            template_id: newTemplate.id,
            name: variable.name,
            type: variable.type,
            required: variable.required || false,
            description: variable.description || '',
            default_value: variable.defaultValue || null,
            validation_rules: variable.validation || null,
            order_index: index
          }))
          
          console.log('Inserting template variables:', variablesToInsert)

          const { error: variablesError } = await (supabase as any)
            .from('template_variable')
            .insert(variablesToInsert)

          if (variablesError) {
            console.error('Template variables creation error:', variablesError)
            console.error('Variables error details:', JSON.stringify(variablesError, null, 2))
            // Don't fail the entire template creation if variables fail
            console.warn('Template created successfully, but variables failed to save')
          }
        }

        console.log('✅ Template created successfully:', newTemplate)
        onSuccess?.(newTemplate)
      }
    } catch (err) {
      console.error('Template creation error:', err)
      setError(err instanceof Error ? err.message : `Failed to ${template ? 'update' : 'create'} template`)
    } finally {
      setLoading(false)
    }
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Upload n8n Workflow</h3>
        <p className="text-sm text-gray-600 mb-4">
          Upload your n8n workflow JSON file, then click "Analyze with AI" to automatically detect variables and generate detailed configuration.
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
            
            {isAnalyzing && (
              <div className="flex items-center justify-center space-x-2 text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm">AI is analyzing your workflow...</span>
              </div>
            )}
            
            {aiAnalysis && !isAnalyzing && (
              <div className="flex items-center justify-center space-x-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">AI analysis complete! {aiAnalysis.detectedVariables.length} variables detected.</span>
              </div>
            )}
            <div className="flex items-center justify-center space-x-2">
              <Button
                onClick={handleAIAnalysis}
                disabled={isAnalyzing}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    🤖 Analyze with AI
                  </>
                )}
              </Button>
              {aiAnalysis && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowWorkflowPreview(!showWorkflowPreview)}
                >
                  {showWorkflowPreview ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                  {showWorkflowPreview ? 'Hide' : 'Preview'} Workflow
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setWorkflowFile(null)
                  setWorkflowAnalysis(null)
                  setDetectedVariables([])
                  setAiAnalysis(null)
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

      {showWorkflowPreview && aiAnalysis && (
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
                  {aiAnalysis.systems.map(system => (
                    <Badge key={system} variant="secondary">{system}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium">Complexity</p>
                <Badge variant="outline">{aiAnalysis.complexity}</Badge>
              </div>
              <div>
                <p className="text-sm font-medium">Estimated Duration</p>
                <p className="text-sm">{aiAnalysis.estimatedDuration} minutes</p>
              </div>
              <div>
                <p className="text-sm font-medium">Features</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {aiAnalysis.hasFileUpload && <Badge variant="secondary">File Upload</Badge>}
                  {aiAnalysis.hasEmailNotification && <Badge variant="secondary">Email</Badge>}
                  {aiAnalysis.hasSlackNotification && <Badge variant="secondary">Slack</Badge>}
                  {aiAnalysis.errorHandling && <Badge variant="secondary">Error Handling</Badge>}
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">Business Logic</p>
              <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
                <div className="space-y-3">
                  {aiAnalysis.businessLogic && aiAnalysis.businessLogic !== 'No business logic analysis available' ? (
                    aiAnalysis.businessLogic.split('\n').map((line, index) => {
                      const trimmedLine = line.trim()
                      if (!trimmedLine) return null
                      
                      if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-')) {
                        return (
                          <div key={index} className="flex items-start">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                            <p className="text-blue-900 text-sm leading-relaxed">{trimmedLine.substring(1).trim()}</p>
                          </div>
                        )
                      } else if (trimmedLine.match(/^\d+\./)) {
                        return (
                          <div key={index} className="flex items-start">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                            <p className="text-blue-900 text-sm leading-relaxed">{trimmedLine}</p>
                          </div>
                        )
                      } else {
                        return (
                          <p key={index} className="text-blue-900 text-sm leading-relaxed">{trimmedLine}</p>
                        )
                      }
                    })
                  ) : (
                    <p className="text-blue-700 text-sm italic">Business logic analysis is being generated...</p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">AI Insights</p>
              <div className="bg-green-50 rounded-lg border border-green-200 p-4">
                <div className="space-y-3">
                  {aiAnalysis.aiInsights.map((insight, index) => (
                    <div key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <p className="text-green-900 text-sm leading-relaxed">{insight}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Detected Variables Section */}
            {aiAnalysis.detectedVariables && aiAnalysis.detectedVariables.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">Detected Variables ({aiAnalysis.detectedVariables.length})</p>
                <div className="bg-purple-50 rounded-lg border border-purple-200 p-4">
                  <div className="space-y-3">
                    {aiAnalysis.detectedVariables.map((variable, index) => (
                      <div key={index} className="flex items-start justify-between p-3 bg-white rounded-lg border border-purple-100">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-purple-900">{variable.name}</span>
                            <Badge variant="outline" className="text-xs">{variable.type}</Badge>
                            {variable.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                          </div>
                          <p className="text-sm text-purple-700">{variable.description}</p>
                          {variable.defaultValue && (
                            <p className="text-xs text-purple-600 mt-1">
                              Default: {typeof variable.defaultValue === 'string' ? variable.defaultValue : JSON.stringify(variable.defaultValue)}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
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
        <div className="col-span-2">
          <label className="text-sm font-medium">How to Use Video URL (Loom)</label>
          <Input
            value={formData.howToUseVideoUrl}
            onChange={(e) => setFormData(prev => ({ ...prev, howToUseVideoUrl: e.target.value }))}
            placeholder="https://loom.com/share/..."
            type="url"
          />
          <p className="text-xs text-gray-500 mt-1">
            Add a Loom video showing how to use this template
          </p>
        </div>
        <div className="col-span-2">
          <label className="text-sm font-medium">How it was Built Video URL (Loom)</label>
          <Input
            value={formData.howItWasBuiltVideoUrl}
            onChange={(e) => setFormData(prev => ({ ...prev, howItWasBuiltVideoUrl: e.target.value }))}
            placeholder="https://loom.com/share/..."
            type="url"
          />
          <p className="text-xs text-gray-500 mt-1">
            Add a Loom video showing how this template was built
          </p>
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
          <h2 className="text-2xl font-bold">{template ? 'Edit Template' : 'Create Template'}</h2>
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
              disabled={currentStep === 1 && !originalWorkflowJson}
            >
              {currentStep === 1 && !aiAnalysis ? 'Skip AI Analysis' : 'Next'}
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
                  <span>{template ? 'Update Template' : 'Create Template'}</span>
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
