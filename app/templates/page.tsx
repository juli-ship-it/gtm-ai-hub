'use client'

import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sidebar } from '@/components/sidebar'
import { TemplateCreationForm } from '@/components/template-creation-form'
import { TemplateEditForm } from '@/components/template-edit-form'
import { TemplateCloneForm } from '@/components/template-clone-form'
import { 
  Search, 
  Filter, 
  Play, 
  Clock, 
  Star,
  FileText,
  BarChart3,
  ClipboardList,
  Shield,
  Plus,
  Eye,
  Settings,
  ExternalLink
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'
import { convertLoomUrlToEmbed } from '@/lib/utils'

type Template = Database['public']['Tables']['template']['Row'] & {
  template_runs?: { count: number }[]
  last_run?: Database['public']['Tables']['template_run']['Row']
  template_variables?: Database['public']['Tables']['template_variable']['Row'][]
}

const categoryIcons = {
  content: FileText,
  reporting: BarChart3,
  intake: ClipboardList,
  governance: Shield
}

const categoryColors = {
  content: 'bg-blue-100 text-blue-800',
  reporting: 'bg-green-100 text-green-800',
  intake: 'bg-purple-100 text-purple-800',
  governance: 'bg-orange-100 text-orange-800'
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const [viewingTemplate, setViewingTemplate] = useState<Template | null>(null)
  const [cloningTemplate, setCloningTemplate] = useState<Template | null>(null)

  useEffect(() => {
    const fetchTemplates = async () => {
      const supabase = createClient()
      
      try {
        setLoading(true)
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
        // First try with basic fields to see if templates exist
        const { data, error } = await supabase
          .from('template')
          .select(`
            *,
            template_runs:template_run(count),
            last_run:template_run(
              started_at,
              finished_at,
              status
            ),
            template_variables:template_variable(
              id,
              name,
              type,
              required,
              description,
              default_value,
              validation_rules,
              order_index,
              n8n_enum,
              excel_config,
              category,
              business_context,
              ai_reasoning,
              validation
            )
          `)
          // .eq('enabled', true) // Temporarily removed to show all templates
          .order('created_at', { ascending: false })

        if (error) {
          console.error('❌ Error fetching templates:', error)
          throw error
        }

        console.log('📊 Templates fetched:', data?.length || 0)
        console.log('📋 First template:', data?.[0])

        // Get the most recent run for each template
        const templatesWithLastRun = await Promise.all(
          (data || []).map(async (template: any) => {
            const { data: lastRun } = await supabase
              .from('template_run')
              .select('started_at, finished_at, status')
              .eq('template_id', template.id)
              .order('started_at', { ascending: false })
              .limit(1)
              .single()

            return {
              ...template,
              last_run: lastRun,
              is_owner: template.created_by === user?.id
            }
          })
        )

        console.log('Templates loaded:', templatesWithLastRun)
        console.log('First template variables:', templatesWithLastRun[0]?.template_variables)
        setTemplates(templatesWithLastRun)
      } catch (error) {
        console.error('Error fetching templates:', error)
        setTemplates([])
      } finally {
        setLoading(false)
      }
    }

    fetchTemplates()
  }, [])

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const formatDuration = (startedAt: string, finishedAt: string | null) => {
    if (!finishedAt) return 'Running...'
    
    const start = new Date(startedAt)
    const end = new Date(finishedAt)
    const diffMs = end.getTime() - start.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffSecs = Math.floor((diffMs % 60000) / 1000)
    
    return `${diffMins}m ${diffSecs}s`
  }

  const getSuccessRate = (template: Template) => {
    // This would need to be calculated from actual run data
    // For now, return a placeholder
    return 95
  }

  const handleCreateTemplate = () => {
    setShowCreateForm(true)
  }

  const handleTemplateCreated = (template: Template) => {
    setShowCreateForm(false)
    // Add the new template to the existing list
    setTemplates(prev => [template, ...prev])
  }

  const handleEditTemplate = (template: Template) => {
    console.log('Edit template clicked:', template)
    setEditingTemplate(template)
  }

  const handleTemplateUpdated = (updatedTemplate: Template) => {
    setEditingTemplate(null)
    // Update the template in the list
    setTemplates(prev => prev.map(t => t.id === updatedTemplate.id ? updatedTemplate : t))
  }



  const handleViewTemplate = async (template: Template) => {
    // Fetch the template with all variables for viewing
    try {
      const supabase = createClient()
      const { data: fullTemplate, error } = await supabase
        .from('template')
        .select(`
          *,
          template_variables:template_variable(
            id,
            name,
            type,
            required,
            description,
            default_value,
            validation_rules,
            order_index,
            n8n_enum,
            excel_config,
            category,
            business_context,
            ai_reasoning,
            validation
          )
        `)
        .eq('id', template.id)
        .single()

      if (error) {
        console.error('Error fetching template for viewing:', error)
        // Fallback to the original template if fetch fails
        setViewingTemplate(template)
        return
      }

      console.log('Template loaded for viewing:', fullTemplate)
      setViewingTemplate(fullTemplate)
    } catch (error) {
      console.error('Error fetching template for viewing:', error)
      // Fallback to the original template if fetch fails
      setViewingTemplate(template)
    }
  }

  const handleCloseModals = () => {
    setShowCreateForm(false)
    setEditingTemplate(null)
    setViewingTemplate(null)
    setCloningTemplate(null)
  }

  const handleCloneToN8N = async (template: Template) => {
    if (!template.n8n_workflow_json) {
      alert('This template does not have an n8n workflow to clone.')
      return
    }

    // Check if n8n_workflow_json contains analysis data (old format) or actual workflow
    const workflowData = template.n8n_workflow_json as any
    const isAnalysisData = workflowData && (
      workflowData.systems || 
      workflowData.variables || 
      workflowData.complexity ||
      workflowData.estimatedDuration
    )

    if (isAnalysisData) {
      alert('This template was created before the fix. Please recreate the template to enable cloning functionality.')
      return
    }

    // Fetch the template with all variables for cloning
    try {
      const supabase = createClient()
      const { data: fullTemplate, error } = await supabase
        .from('template')
        .select(`
          *,
          template_variables:template_variable(
            id,
            name,
            type,
            required,
            description,
            default_value,
            validation_rules,
            order_index,
            n8n_enum,
            excel_config,
            category,
            business_context,
            ai_reasoning,
            validation
          )
        `)
        .eq('id', template.id)
        .single()

      if (error) {
        console.error('Error fetching template for cloning:', error)
        alert('Failed to load template details for cloning.')
        return
      }

      console.log('Template loaded for cloning:', fullTemplate)
      console.log('Template variables:', (fullTemplate as any).template_variables)
      setCloningTemplate(fullTemplate)
    } catch (error) {
      console.error('Error fetching template for cloning:', error)
      alert('Failed to load template details for cloning.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-wl-bg">
        <div className="flex">
          <Sidebar />
          <div className="flex-1 p-8">
            <PageHeader
              title="Template Catalog"
              description="Discover and run AI-powered automation templates for your GTM workflows."
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="min-h-screen bg-wl-bg">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-8">
          <PageHeader
            title="Template Catalog"
            description="Discover and run AI-powered automation templates for your GTM workflows."
          >
            <Button className="wl-button-primary" onClick={handleCreateTemplate}>
              <Plus className="mr-2 h-4 w-4" />
              Create Template
            </Button>
          </PageHeader>

          {/* Filters */}
          <div className="mb-8 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-wl-muted" />
                <Input
                  placeholder="Search templates..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="content">Content</SelectItem>
                <SelectItem value="reporting">Reporting</SelectItem>
                <SelectItem value="intake">Intake</SelectItem>
                <SelectItem value="governance">Governance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Templates Grid */}
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-wl-muted mx-auto mb-4" />
              <h3 className="text-lg font-medium text-wl-text mb-2">No templates found</h3>
              <p className="text-wl-muted mb-4">
                {searchTerm || categoryFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Get started by creating your first template.'
                }
              </p>
              <Button className="wl-button-primary" onClick={handleCreateTemplate}>
                <FileText className="mr-2 h-4 w-4" />
                Create Template
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => {
                const CategoryIcon = categoryIcons[template.category as keyof typeof categoryIcons]
                const categoryColor = categoryColors[template.category as keyof typeof categoryColors]
                const runCount = template.template_runs?.[0]?.count || 0
                const isNew = new Date(template.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Created within last 7 days
                const isPopular = runCount > 10
                
                return (
                  <Card key={template.id} className="wl-card-hover group">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-wl-accent/10 rounded-xl">
                            <CategoryIcon className="h-5 w-5 text-wl-accent" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{template.name}</CardTitle>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="outline" className={categoryColor}>
                                {template.category}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {template.version}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          {isNew && (
                            <Badge variant="secondary" className="text-xs">
                              New
                            </Badge>
                          )}
                          {isPopular && (
                            <Badge variant="secondary" className="text-xs">
                              <Star className="h-3 w-3 mr-1" />
                              Popular
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <CardDescription className="text-sm">
                        {template.description}
                      </CardDescription>
                      
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-wl-muted">Runs</p>
                          <p className="font-semibold text-wl-text">{runCount}</p>
                        </div>
                        <div>
                          <p className="text-wl-muted">Avg Time</p>
                          <p className="font-semibold text-wl-text">
                            {template.last_run ? formatDuration(template.last_run.started_at, template.last_run.finished_at) : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-wl-muted">Success Rate</p>
                          <p className="font-semibold text-wl-text">{getSuccessRate(template)}%</p>
                        </div>
                        <div>
                          <p className="text-wl-muted">Last Run</p>
                          <p className="font-semibold text-wl-text">
                            {template.last_run 
                              ? new Date(template.last_run.started_at).toLocaleDateString()
                              : 'Never'
                            }
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center text-sm text-wl-muted">
                          <Clock className="h-4 w-4 mr-1" />
                          Updated {new Date(template.created_at).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleViewTemplate(template)}
                            className="text-xs px-3 py-2 min-w-[80px]"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          {(template as any).is_owner && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                console.log('Edit button clicked for template:', template)
                                handleEditTemplate(template)
                              }}
                              className="border-blue-500 text-blue-500 hover:bg-blue-50 text-xs px-3 py-2 min-w-[80px]"
                            >
                              <Settings className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                          )}
                          {template.n8n_workflow_json && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleCloneToN8N(template)}
                              className="border-green-500 text-green-500 hover:bg-green-50 text-xs px-3 py-2 min-w-[80px]"
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Clone
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Template Creation Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto p-4">
            <TemplateCreationForm
              onSuccess={handleTemplateCreated}
              onCancel={handleCloseModals}
            />
          </div>
        </div>
      )}

            {/* Template Edit Modal */}
            {editingTemplate && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
                  <TemplateEditForm
                    template={editingTemplate as any}
                    onSuccess={handleTemplateUpdated as any}
                    onCancel={handleCloseModals}
                  />
                </div>
              </div>
            )}


      {/* Template View Modal */}
      {viewingTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">{viewingTemplate.name}</h2>
                <Button variant="outline" onClick={handleCloseModals}>
                  Close
                </Button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Description</h3>
                  <p className="text-gray-600">{viewingTemplate.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium">Category</h4>
                    <Badge variant="outline">{viewingTemplate.category}</Badge>
                  </div>
                  <div>
                    <h4 className="font-medium">Difficulty</h4>
                    <Badge variant="outline">{viewingTemplate.difficulty_level}</Badge>
                  </div>
                  <div>
                    <h4 className="font-medium">Duration</h4>
                    <p>{viewingTemplate.estimated_duration_minutes} minutes</p>
                  </div>
                  <div>
                    <h4 className="font-medium">Systems</h4>
                        <div className="flex flex-wrap gap-2">
                      {viewingTemplate.systems_required?.map(system => (
                        <Badge key={system} variant="secondary">{system}</Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {viewingTemplate.template_variables && viewingTemplate.template_variables.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Required Variables</h3>
                    <div className="space-y-3">
                      {viewingTemplate.template_variables.map((variable) => (
                        <div key={variable.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{variable.name}</span>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline">{variable.type}</Badge>
                              {variable.required && <Badge variant="destructive">Required</Badge>}
                            </div>
                          </div>
                          {variable.description && (
                            <p className="text-sm text-gray-600">{variable.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {viewingTemplate.execution_instructions && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Step-by-Step Instructions</h3>
                    <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
                      <div className="space-y-4">
                        {viewingTemplate.execution_instructions.split('\n\n').map((section, sectionIndex) => {
                          if (section.trim().startsWith('Step-by-Step Instructions:')) {
                            return null // Skip the header
                          }
                          
                          if (section.trim().startsWith('Business Logic:')) {
                            return (
                              <div key={sectionIndex} className="mt-6">
                                <h4 className="font-semibold text-blue-800 mb-2">Business Logic</h4>
                                <div className="space-y-2">
                                  {section.replace('Business Logic:\n', '').split('\n').map((line, lineIndex) => {
                                    const trimmedLine = line.trim()
                                    if (!trimmedLine) return null
                                    return (
                                      <div key={lineIndex} className="flex items-start">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                        <p className="text-blue-900 text-sm">{trimmedLine}</p>
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            )
                          }
                          
                          if (section.trim().startsWith('AI Insights:')) {
                            return (
                              <div key={sectionIndex} className="mt-6">
                                <h4 className="font-semibold text-green-800 mb-2">AI Insights</h4>
                                <div className="space-y-2">
                                  {section.replace('AI Insights:\n', '').split('\n').map((line, lineIndex) => {
                                    const trimmedLine = line.trim()
                                    if (!trimmedLine) return null
                                    return (
                                      <div key={lineIndex} className="flex items-start">
                                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                        <p className="text-green-900 text-sm">{trimmedLine}</p>
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            )
                          }
                          
                          if (section.trim().startsWith('Systems Used:')) {
                            return (
                              <div key={sectionIndex} className="mt-6">
                                <h4 className="font-semibold text-gray-700 mb-2">Systems Used</h4>
                                <p className="text-gray-600 text-sm">{section.replace('Systems Used: ', '')}</p>
                              </div>
                            )
                          }
                          
                          // Handle numbered steps
                          if (section.match(/^\d+\./)) {
                            return (
                              <div key={sectionIndex} className="space-y-2">
                                {section.split('\n').map((line, lineIndex) => {
                                  const trimmedLine = line.trim()
                                  if (!trimmedLine) return null
                                  
                                  if (trimmedLine.match(/^\d+\./)) {
                                    return (
                                      <h4 key={lineIndex} className="font-semibold text-blue-800 text-base">
                                        {trimmedLine}
                                      </h4>
                                    )
                                  } else if (trimmedLine.startsWith('•')) {
                                    return (
                                      <div key={lineIndex} className="flex items-start ml-4">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                        <p className="text-blue-900 text-sm">{trimmedLine.substring(1).trim()}</p>
                                      </div>
                                    )
                                  }
                                  return null
                                })}
                              </div>
                            )
                          }
                          
                          return null
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* How to Use Video Section */}
                {viewingTemplate.how_to_use_video_url && (() => {
                  const embedUrl = convertLoomUrlToEmbed(viewingTemplate.how_to_use_video_url)
                  return embedUrl ? (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">How to Use This Template</h3>
                      <div className="bg-purple-50 rounded-lg border border-purple-200 p-4">
                        <div className="aspect-video rounded-lg overflow-hidden">
                          <iframe
                            src={embedUrl}
                            title="How to Use This Template"
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                        <p className="text-sm text-purple-700 mt-2">
                          Watch this video to learn how to use this template effectively.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">How to Use This Template</h3>
                      <div className="bg-purple-50 rounded-lg border border-purple-200 p-4">
                        <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                          <div className="text-center">
                            <p className="text-gray-600 mb-2">Invalid Loom URL</p>
                            <a 
                              href={viewingTemplate.how_to_use_video_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 underline"
                            >
                              Open video in new tab
                            </a>
                          </div>
                        </div>
                        <p className="text-sm text-purple-700 mt-2">
                          Watch this video to learn how to use this template effectively.
                        </p>
                      </div>
                    </div>
                  )
                })()}

                {/* How it was Built Video Section */}
                {viewingTemplate.how_it_was_built_video_url && (() => {
                  const embedUrl = convertLoomUrlToEmbed(viewingTemplate.how_it_was_built_video_url)
                  return embedUrl ? (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">How This Template Was Built</h3>
                      <div className="bg-orange-50 rounded-lg border border-orange-200 p-4">
                        <div className="aspect-video rounded-lg overflow-hidden">
                          <iframe
                            src={embedUrl}
                            title="How This Template Was Built"
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                        <p className="text-sm text-orange-700 mt-2">
                          Watch this video to understand how this template was created and the thought process behind it.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">How This Template Was Built</h3>
                      <div className="bg-orange-50 rounded-lg border border-orange-200 p-4">
                        <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                          <div className="text-center">
                            <p className="text-gray-600 mb-2">Invalid Loom URL</p>
                            <a 
                              href={viewingTemplate.how_it_was_built_video_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 underline"
                            >
                              Open video in new tab
                            </a>
                          </div>
                        </div>
                        <p className="text-sm text-orange-700 mt-2">
                          Watch this video to understand how this template was created and the thought process behind it.
                        </p>
                      </div>
                    </div>
                  )
                })()}

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={handleCloseModals}>
                    Close
                  </Button>
                  {viewingTemplate.n8n_workflow_json && (
                    <Button 
                      variant="outline"
                      onClick={() => handleCloneToN8N(viewingTemplate)}
                      className="border-green-500 text-green-500 hover:bg-green-50"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Clone in n8n
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Template Clone Modal */}
      {cloningTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <TemplateCloneForm 
              template={cloningTemplate} 
              onClose={handleCloseModals}
            />
          </div>
        </div>
      )}
    </div>
  )
}
