'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { 
  X, 
  Save, 
  Settings, 
  Variable, 
  Key, 
  FileText,
  Plus,
  Trash2,
  AlertCircle
} from 'lucide-react'

interface Template {
  id: string
  name: string
  slug: string
  description: string
  category: string
  version: string
  enabled: boolean
  created_at: string
  updated_at: string
  created_by: string
  owner_name: string
  is_owner: boolean
  template_variables?: TemplateVariable[]
  last_run?: any
  template_runs?: any[]
}

interface TemplateVariable {
  id?: string
  name: string
  type: 'text' | 'number' | 'boolean' | 'select' | 'multiselect' | 'textarea' | 'password' | 'email' | 'url' | 'date' | 'object'
  required: boolean
  description: string
  default_value?: string
  validation_rules?: any
  order_index: number
  options?: string[]
  n8n_enum?: string[]
  excel_config?: {
    sheets: string[]
    columns: Record<string, string[]>
    sheetOptions: string[]
  }
  category?: 'schedule' | 'data_source' | 'data_destination' | 'configuration' | 'notification' | 'filter' | 'mapping' | 'excel_config'
  business_context?: string
  ai_reasoning?: string
  validation?: {
    min?: number
    max?: number
    pattern?: string
    fileTypes?: string[]
  }
}

interface TemplateEditFormProps {
  template: Template
  onSuccess?: (template: Template) => void
  onCancel?: () => void
}

export function TemplateEditForm({ template, onSuccess, onCancel }: TemplateEditFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: template.name,
    description: template.description,
    category: template.category,
    enabled: template.enabled,
    howToUseVideoUrl: template.how_to_use_video_url || '',
    howItWasBuiltVideoUrl: template.how_it_was_built_video_url || ''
  })
  const [variables, setVariables] = useState<TemplateVariable[]>(template.template_variables || [])
  const [newVariable, setNewVariable] = useState<Partial<TemplateVariable>>({
    name: '',
    type: 'text',
    required: false,
    description: '',
    order_index: 0
  })

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('You must be logged in to edit templates')
      }

      // Update template
      const { data: updatedTemplate, error: updateError } = await (supabase as any)
        .from('template')
        .update({
          name: formData.name,
          description: formData.description,
          category: formData.category,
          enabled: formData.enabled,
          how_to_use_video_url: formData.howToUseVideoUrl || null,
          how_it_was_built_video_url: formData.howItWasBuiltVideoUrl || null,
          last_modified_at: new Date().toISOString()
        })
        .eq('id', template.id)
        .select()
        .single()

      if (updateError) throw updateError

      // Update template variables
      // Delete existing variables
      await (supabase as any)
        .from('template_variable')
        .delete()
        .eq('template_id', template.id)

      // Insert new variables
      if (variables.length > 0) {
        const variablesToInsert = variables.map((variable, index) => ({
          template_id: template.id,
          name: variable.name,
          type: variable.type,
          required: variable.required,
          description: variable.description,
          default_value: variable.default_value,
          validation_rules: variable.validation_rules,
          order_index: index,
          n8n_enum: variable.n8n_enum,
          excel_config: variable.excel_config,
          category: variable.category,
          business_context: variable.business_context,
          ai_reasoning: variable.ai_reasoning,
          validation: variable.validation
        }))

        const { error: variablesError } = await (supabase as any)
          .from('template_variable')
          .insert(variablesToInsert)

        if (variablesError) throw variablesError
      }

      // Call success callback to close modal and refresh the list
      onSuccess?.(updatedTemplate)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update template')
    } finally {
      setLoading(false)
    }
  }

  const addVariable = () => {
    if (!newVariable.name.trim()) return

    const variable: TemplateVariable = {
      ...newVariable,
      name: newVariable.name.trim(),
      order_index: variables.length,
      id: `var_${Date.now()}`
    } as TemplateVariable

    setVariables([...variables, variable])
    setNewVariable({
      name: '',
      type: 'text',
      required: false,
      description: '',
      order_index: 0
    })
  }

  const removeVariable = (index: number) => {
    setVariables(variables.filter((_, i) => i !== index))
  }

  const updateVariable = (index: number, field: keyof TemplateVariable, value: any) => {
    const updated = [...variables]
    updated[index] = { ...updated[index], [field]: value }
    setVariables(updated)
  }

  const getVariableTypeIcon = (type: string) => {
    switch (type) {
      case 'password': return <Key className="h-4 w-4" />
      case 'select': 
      case 'multiselect': return <Settings className="h-4 w-4" />
      default: return <Variable className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Edit Template</h2>
          <p className="text-gray-600">Update template settings and variables</p>
        </div>
        <Button variant="outline" onClick={onCancel}>
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Basic Information</span>
          </CardTitle>
          <CardDescription>
            Update the basic template information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Template Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter template name"
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="automation">Automation</SelectItem>
                  <SelectItem value="integration">Integration</SelectItem>
                  <SelectItem value="workflow">Workflow</SelectItem>
                  <SelectItem value="reporting">Reporting</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what this template does"
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="enabled"
              checked={formData.enabled}
              onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
              className="rounded"
            />
            <Label htmlFor="enabled">Template is enabled</Label>
          </div>

          <div>
            <Label htmlFor="howToUseVideoUrl">How to Use Video URL (Loom)</Label>
            <Input
              id="howToUseVideoUrl"
              value={formData.howToUseVideoUrl}
              onChange={(e) => setFormData({ ...formData, howToUseVideoUrl: e.target.value })}
              placeholder="https://loom.com/share/..."
              type="url"
            />
            <p className="text-xs text-gray-500 mt-1">
              Add a Loom video showing how to use this template
            </p>
          </div>

          <div>
            <Label htmlFor="howItWasBuiltVideoUrl">How it was Built Video URL (Loom)</Label>
            <Input
              id="howItWasBuiltVideoUrl"
              value={formData.howItWasBuiltVideoUrl}
              onChange={(e) => setFormData({ ...formData, howItWasBuiltVideoUrl: e.target.value })}
              placeholder="https://loom.com/share/..."
              type="url"
            />
            <p className="text-xs text-gray-500 mt-1">
              Add a Loom video showing how this template was built
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Template Variables */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Variable className="h-5 w-5" />
            <span>Template Variables</span>
          </CardTitle>
          <CardDescription>
            Configure the variables that users will provide when running this template
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Existing Variables */}
          {variables.length > 0 && (
            <div className="space-y-3">
              {variables.map((variable, index) => (
                <div key={variable.id || index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getVariableTypeIcon(variable.type)}
                      <span className="font-medium">{variable.name}</span>
                      {variable.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeVariable(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Type</Label>
                      <Select 
                        value={variable.type} 
                        onValueChange={(value) => updateVariable(index, 'type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="boolean">Boolean</SelectItem>
                          <SelectItem value="select">Select</SelectItem>
                          <SelectItem value="multiselect">Multi-select</SelectItem>
                          <SelectItem value="textarea">Textarea</SelectItem>
                          <SelectItem value="password">Password</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="url">URL</SelectItem>
                          <SelectItem value="date">Date</SelectItem>
                          <SelectItem value="object">Object (Excel Config)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Default Value</Label>
                      <Input
                        value={variable.default_value || ''}
                        onChange={(e) => updateVariable(index, 'default_value', e.target.value)}
                        placeholder="Default value"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label>Description</Label>
                    <Input
                      value={variable.description}
                      onChange={(e) => updateVariable(index, 'description', e.target.value)}
                      placeholder="Variable description"
                    />
                  </div>

                  {/* n8n Enum Configuration */}
                  {(variable.type === 'select' || variable.type === 'multiselect') && (
                    <div>
                      <Label>n8n Enum Values (comma-separated)</Label>
                      <Input
                        value={variable.n8n_enum?.join(', ') || ''}
                        onChange={(e) => updateVariable(index, 'n8n_enum', e.target.value.split(',').map(v => v.trim()).filter(v => v))}
                        placeholder="e.g., Seconds, Minutes, Hours, Days, Weeks, Months"
                      />
                    </div>
                  )}

                  {/* Options for select/multiselect */}
                  {(variable.type === 'select' || variable.type === 'multiselect') && (
                    <div>
                      <Label>Options (comma-separated)</Label>
                      <Input
                        value={variable.options?.join(', ') || ''}
                        onChange={(e) => updateVariable(index, 'options', e.target.value.split(',').map(v => v.trim()).filter(v => v))}
                        placeholder="e.g., Option 1, Option 2, Option 3"
                      />
                    </div>
                  )}

                  {/* Excel Configuration */}
                  {variable.type === 'object' && variable.category === 'excel_config' && (
                    <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                      <h4 className="font-medium">Excel Worksheet Configuration</h4>
                      <div>
                        <Label>Sheet Names (comma-separated)</Label>
                        <Input
                        value={variable.excel_config?.sheets?.join(', ') || ''}
                        onChange={(e) => {
                          const sheets = e.target.value.split(',').map(s => s.trim()).filter(s => s)
                          updateVariable(index, 'excel_config', {
                            ...variable.excel_config,
                            sheets
                          })
                        }}
                          placeholder="e.g., Sheet1, Sheet2, Sheet3"
                        />
                      </div>
                      <div>
                        <Label>Sheet Options (comma-separated)</Label>
                        <Input
                        value={variable.excel_config?.sheetOptions?.join(', ') || ''}
                        onChange={(e) => {
                          const sheetOptions = e.target.value.split(',').map(s => s.trim()).filter(s => s)
                          updateVariable(index, 'excel_config', {
                            ...variable.excel_config,
                            sheetOptions
                          })
                        }}
                          placeholder="e.g., Create new sheet, Append to existing sheet, Overwrite existing sheet"
                        />
                      </div>
                    </div>
                  )}

                  {/* Category */}
                  <div>
                    <Label>Category</Label>
                    <Select 
                      value={variable.category || 'configuration'} 
                      onValueChange={(value) => updateVariable(index, 'category', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="schedule">Schedule</SelectItem>
                        <SelectItem value="data_source">Data Source</SelectItem>
                        <SelectItem value="data_destination">Data Destination</SelectItem>
                        <SelectItem value="configuration">Configuration</SelectItem>
                        <SelectItem value="notification">Notification</SelectItem>
                        <SelectItem value="filter">Filter</SelectItem>
                        <SelectItem value="mapping">Mapping</SelectItem>
                        <SelectItem value="excel_config">Excel Config</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Business Context */}
                  <div>
                    <Label>Business Context</Label>
                    <Textarea
                      value={variable.business_context || ''}
                      onChange={(e) => updateVariable(index, 'business_context', e.target.value)}
                      placeholder="Why this variable matters for the business use case"
                      rows={2}
                    />
                  </div>

                  {/* Validation Rules */}
                  {variable.type === 'number' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Min Value</Label>
                        <Input
                          type="number"
                          value={variable.validation?.min || ''}
                          onChange={(e) => updateVariable(index, 'validation', {
                            ...variable.validation,
                            min: e.target.value ? parseInt(e.target.value) : undefined
                          })}
                          placeholder="Minimum value"
                        />
                      </div>
                      <div>
                        <Label>Max Value</Label>
                        <Input
                          type="number"
                          value={variable.validation?.max || ''}
                          onChange={(e) => updateVariable(index, 'validation', {
                            ...variable.validation,
                            max: e.target.value ? parseInt(e.target.value) : undefined
                          })}
                          placeholder="Maximum value"
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={variable.required}
                      onChange={(e) => updateVariable(index, 'required', e.target.checked)}
                      className="rounded"
                    />
                    <Label>Required variable</Label>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add New Variable */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 space-y-3">
            <h4 className="font-medium">Add New Variable</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Variable Name</Label>
                <Input
                  value={newVariable.name || ''}
                  onChange={(e) => setNewVariable({ ...newVariable, name: e.target.value })}
                  placeholder="e.g., api_key, email_address"
                />
              </div>
              <div>
                <Label>Type</Label>
                <Select 
                  value={newVariable.type || 'text'} 
                  onValueChange={(value) => setNewVariable({ ...newVariable, type: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="boolean">Boolean</SelectItem>
                    <SelectItem value="select">Select</SelectItem>
                    <SelectItem value="multiselect">Multi-select</SelectItem>
                    <SelectItem value="textarea">Textarea</SelectItem>
                    <SelectItem value="password">Password</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="url">URL</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="object">Object (Excel Config)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={newVariable.description || ''}
                onChange={(e) => setNewVariable({ ...newVariable, description: e.target.value })}
                placeholder="Describe this variable"
              />
            </div>

            {/* n8n Enum Configuration for new variable */}
            {(newVariable.type === 'select' || newVariable.type === 'multiselect') && (
              <div>
                <Label>n8n Enum Values (comma-separated)</Label>
                <Input
                  value={newVariable.n8n_enum?.join(', ') || ''}
                  onChange={(e) => setNewVariable({ 
                    ...newVariable, 
                    n8n_enum: e.target.value.split(',').map(v => v.trim()).filter(v => v)
                  })}
                  placeholder="e.g., Seconds, Minutes, Hours, Days, Weeks, Months"
                />
              </div>
            )}

            {/* Options for new variable */}
            {(newVariable.type === 'select' || newVariable.type === 'multiselect') && (
              <div>
                <Label>Options (comma-separated)</Label>
                <Input
                  value={newVariable.options?.join(', ') || ''}
                  onChange={(e) => setNewVariable({ 
                    ...newVariable, 
                    options: e.target.value.split(',').map(v => v.trim()).filter(v => v)
                  })}
                  placeholder="e.g., Option 1, Option 2, Option 3"
                />
              </div>
            )}

            {/* Category for new variable */}
            <div>
              <Label>Category</Label>
              <Select 
                value={newVariable.category || 'configuration'} 
                onValueChange={(value) => setNewVariable({ ...newVariable, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="schedule">Schedule</SelectItem>
                  <SelectItem value="data_source">Data Source</SelectItem>
                  <SelectItem value="data_destination">Data Destination</SelectItem>
                  <SelectItem value="configuration">Configuration</SelectItem>
                  <SelectItem value="notification">Notification</SelectItem>
                  <SelectItem value="filter">Filter</SelectItem>
                  <SelectItem value="mapping">Mapping</SelectItem>
                  <SelectItem value="excel_config">Excel Config</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={newVariable.required || false}
                  onChange={(e) => setNewVariable({ ...newVariable, required: e.target.checked })}
                  className="rounded"
                />
                <Label>Required variable</Label>
              </div>
              <Button onClick={addVariable} disabled={!newVariable.name?.trim()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Variable
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-end space-x-3 pt-4 border-t">
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

export default TemplateEditForm
