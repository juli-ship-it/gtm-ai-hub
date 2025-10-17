'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { PageHeader } from '@/components/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { StatusBadge } from '@/components/status-badge'
import { Sidebar } from '@/components/sidebar'
import { 
  ArrowLeft,
  MessageSquare,
  Clock,
  User,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Edit,
  Save,
  X,
  Plus,
  Calendar,
  Tag,
  Link as LinkIcon,
  Shield,
  Activity,
  FileText,
  Users,
  Zap,
  Target,
  BarChart3,
  ExternalLink,
  Send,
  MoreVertical,
  Bell,
  Star,
  Flag
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'
import { useAuth } from '@/lib/auth/context'

type IntakeRequest = Database['public']['Tables']['intake_request']['Row'] & {
  requester_user?: Database['public']['Tables']['app_user']['Row']
  comments?: IntakeComment[]
}

type IntakeComment = Database['public']['Tables']['intake_comment']['Row'] & {
  author_user?: Database['public']['Tables']['app_user']['Row']
}

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800'
}

const statusSteps = [
  { key: 'new', label: 'New', description: 'Request submitted', icon: Plus },
  { key: 'triaged', label: 'Triaged', description: 'Under review', icon: AlertCircle },
  { key: 'building', label: 'Building', description: 'In development', icon: Zap },
  { key: 'shipped', label: 'Shipped', description: 'Completed', icon: CheckCircle },
  { key: 'declined', label: 'Declined', description: 'Not approved', icon: X }
]

const categoryIcons = {
  campaign_execution: Target,
  content_creation: FileText,
  lead_management: Users,
  reporting: BarChart3,
  other: Zap
}

export default function IntakeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const intakeId = params.id as string
  const { user, loading: authLoading } = useAuth()
  
  const [intakeRequest, setIntakeRequest] = useState<IntakeRequest | null>(null)
  const [comments, setComments] = useState<IntakeComment[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [editableFields, setEditableFields] = useState({
    status: '',
    priority: '',
    title: '',
    problem_statement: '',
    automation_idea: '',
    ethics_considerations: ''
  })

  useEffect(() => {
    if (intakeId) {
      fetchIntakeRequest()
      fetchComments()
    }
  }, [intakeId])

  const fetchIntakeRequest = async () => {
    const supabase = createClient()
    
    try {
      // First try with the join
      const { data, error } = await supabase
        .from('intake_request')
        .select(`
          *,
          requester_user:requester (
            email,
            id
          )
        `)
        .eq('id', intakeId)
        .single()

      if (error) {
        console.error('Error with join query:', error)
        // Fallback to simple query without join
        const { data: simpleData, error: simpleError } = await supabase
          .from('intake_request')
          .select('*')
          .eq('id', intakeId)
          .single()
        
        if (simpleError) {
          console.error('Simple query also failed:', simpleError)
          throw simpleError
        }
        
        setIntakeRequest(simpleData)
        setEditableFields({
          status: (simpleData as any).status,
          priority: (simpleData as any).priority,
          title: (simpleData as any).title || '',
          problem_statement: (simpleData as any).problem_statement || '',
          automation_idea: (simpleData as any).automation_idea || '',
          ethics_considerations: (simpleData as any).ethics_considerations || ''
        })
      } else {
        setIntakeRequest(data)
        setEditableFields({
          status: (data as any).status,
          priority: (data as any).priority,
          title: (data as any).title || '',
          problem_statement: (data as any).problem_statement || '',
          automation_idea: (data as any).automation_idea || '',
          ethics_considerations: (data as any).ethics_considerations || ''
        })
      }
    } catch (error) {
      console.error('Error fetching intake request:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      // Set intakeRequest to null to show the not found state
      setIntakeRequest(null)
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async () => {
    const supabase = createClient()
    
    try {
      console.log('Fetching comments for request:', intakeId)
      
      const { data, error } = await supabase
        .from('intake_comment')
        .select(`
          *,
          author_user:author_id (
            email,
            id
          )
        `)
        .eq('intake_request_id', intakeId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Database error fetching comments:', error)
        console.error('Error details:', JSON.stringify(error, null, 2))
        setComments([])
        return
      }
      
      console.log('Comments fetched successfully:', data?.length || 0, 'comments')
      setComments(data || [])
    } catch (error) {
      console.error('Error fetching comments:', error)
      setComments([])
    }
  }

  const handleStatusUpdate = async (newStatus: string) => {
    if (!intakeRequest) return
    
    setIsUpdatingStatus(true)
    const supabase = createClient()
    
    try {
      const { error } = await (supabase as any)
        .from('intake_request')
        .update({ 
          status: newStatus as any,
          updated_at: new Date().toISOString()
        })
        .eq('id', intakeId)

      if (error) throw error
      
      setIntakeRequest(prev => prev ? { ...prev, status: newStatus as any } : null)
      setEditableFields(prev => ({ ...prev, status: newStatus }))
    } catch (error) {
      console.error('Error updating status:', error)
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleSaveChanges = async () => {
    if (!intakeRequest) return
    
    const supabase = createClient()
    
    try {
      const { error } = await (supabase as any)
        .from('intake_request')
        .update({
          ...editableFields,
          updated_at: new Date().toISOString()
        })
        .eq('id', intakeId)

      if (error) throw error
      
      setIntakeRequest(prev => prev ? { ...prev, ...editableFields } as any : null)
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating intake request:', error)
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim() || !intakeRequest) return
    
    setIsSubmittingComment(true)
    const supabase = createClient()
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.error('User not authenticated')
        alert('You must be logged in to add comments')
        return
      }

      console.log('Adding comment for user:', user.id, 'to request:', intakeId)

      const { data, error } = await (supabase as any)
        .from('intake_comment')
        .insert({
          intake_request_id: intakeId,
          author_id: user.id,
          content: newComment.trim()
        })
        .select(`
          *,
          author_user:author_id (
            email,
            id
          )
        `)
        .single()

      if (error) {
        console.error('Database error adding comment:', error)
        alert(`Failed to add comment: ${error.message}`)
        return
      }
      
      console.log('Comment added successfully:', data)
      setComments(prev => [...prev, data])
      setNewComment('')
    } catch (error) {
      console.error('Error adding comment:', error)
      alert(`Error adding comment: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const getCurrentStepIndex = () => {
    return statusSteps.findIndex(step => step.key === intakeRequest?.status) || 0
  }

  const getCategoryIcon = (category: string | null) => {
    if (!category) return Zap
    return categoryIcons[category as keyof typeof categoryIcons] || Zap
  }

  const getRequestTypeInfo = (requestType: string) => {
    switch (requestType) {
      case 'showcase':
        return {
          label: 'Showcase',
          color: 'bg-purple-100 text-purple-800',
          description: 'This is a demo example to showcase the intake system'
        }
      case 'demo':
        return {
          label: 'Demo',
          color: 'bg-green-100 text-green-800',
          description: 'This is temporary demo data'
        }
      default:
        return {
          label: 'Request',
          color: 'bg-blue-100 text-blue-800',
          description: 'This is a real intake request from a user'
        }
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-wl-bg">
        <div className="flex">
          <Sidebar />
          <div className="flex-1 p-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-wl-bg">
        <div className="flex">
          <Sidebar />
          <div className="flex-1 p-8">
            <PageHeader
              title="Authentication Required"
              description="Please sign in to view intake requests."
            />
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-wl-muted mx-auto mb-4" />
              <h3 className="text-lg font-medium text-wl-text mb-2">Sign In Required</h3>
              <p className="text-wl-muted mb-4">
                You need to be signed in to view and comment on intake requests.
              </p>
              <Button onClick={() => router.push('/auth/login')}>
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!intakeRequest) {
    return (
      <div className="min-h-screen bg-wl-bg">
        <div className="flex">
          <Sidebar />
          <div className="flex-1 p-8">
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-wl-muted mx-auto mb-4" />
              <h3 className="text-lg font-medium text-wl-text mb-2">Intake Request Not Found</h3>
              <p className="text-wl-muted mb-4">
                The intake request you're looking for doesn't exist or has been removed.
              </p>
              <Button onClick={() => router.push('/intake')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Intake Board
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const currentStepIndex = getCurrentStepIndex()
  const CategoryIcon = getCategoryIcon(intakeRequest.category)
  const requestTypeInfo = getRequestTypeInfo(intakeRequest.request_type)

  return (
    <div className="min-h-screen bg-wl-bg">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-8">
          {/* Request Type Banner */}
          {intakeRequest.request_type !== 'real' && (
            <div className={`mb-6 p-4 rounded-lg ${requestTypeInfo.color} border-l-4 border-current`}>
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5" />
                <div>
                  <p className="font-medium">{requestTypeInfo.label} Request</p>
                  <p className="text-sm opacity-90">{requestTypeInfo.description}</p>
                </div>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push('/intake')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Intake Board
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-wl-text">
                  {intakeRequest.title || `Request ${intakeRequest.id.slice(0, 8)}`}
                </h1>
                <p className="text-wl-muted">
                  Created {new Date(intakeRequest.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {intakeRequest.request_type === 'real' && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    {isEditing ? 'Cancel' : 'Edit'}
                  </Button>
                  {isEditing && (
                    <Button
                      size="sm"
                      onClick={handleSaveChanges}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  )}
                </>
              )}
              {intakeRequest.request_type !== 'real' && (
                <Badge className={requestTypeInfo.color}>
                  {requestTypeInfo.label} - Read Only
                </Badge>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Progress Tracking */}
              <Card className="wl-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5" />
                    <span>Progress Tracking</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      {statusSteps.map((step, index) => {
                        const StepIcon = step.icon
                        const isActive = index === currentStepIndex
                        const isCompleted = index < currentStepIndex
                        const isUpcoming = index > currentStepIndex
                        
                        return (
                          <div key={step.key} className="flex flex-col items-center space-y-2">
                            <div className={`
                              w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors
                              ${isActive ? 'bg-wl-accent border-wl-accent text-white' : 
                                isCompleted ? 'bg-green-500 border-green-500 text-white' :
                                'bg-gray-100 border-gray-300 text-gray-400'}
                            `}>
                              <StepIcon className="h-5 w-5" />
                            </div>
                            <div className="text-center">
                              <p className={`text-sm font-medium ${isActive ? 'text-wl-accent' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                                {step.label}
                              </p>
                              <p className="text-xs text-wl-muted">{step.description}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    
                    {/* Status Update */}
                    <div className="pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium text-wl-text">Update Status:</span>
                        <Select 
                          value={editableFields.status} 
                          onValueChange={(value) => {
                            setEditableFields(prev => ({ ...prev, status: value }))
                            if (!isEditing) {
                              handleStatusUpdate(value)
                            }
                          }}
                          disabled={isUpdatingStatus}
                        >
                          <SelectTrigger className="w-48">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {statusSteps.map(step => (
                              <SelectItem key={step.key} value={step.key}>
                                {step.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Request Details */}
              <Card className="wl-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>Request Details</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-wl-text mb-2 block">Title</label>
                      {isEditing ? (
                        <Input
                          value={editableFields.title}
                          onChange={(e) => setEditableFields(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Request title"
                        />
                      ) : (
                        <p className="text-wl-muted">{intakeRequest.title || 'No title provided'}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-wl-text mb-2 block">Category</label>
                      <div className="flex items-center space-x-2">
                        <CategoryIcon className="h-4 w-4 text-wl-accent" />
                        <Badge variant="secondary">
                          {intakeRequest.category?.replace('_', ' ') || 'Other'}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-wl-text mb-2 block">Priority</label>
                      <Badge className={priorityColors[intakeRequest.priority]}>
                        {intakeRequest.priority}
                      </Badge>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-wl-text mb-2 block">Status</label>
                      <StatusBadge status={intakeRequest.status} />
                    </div>
                  </div>

                  {/* Problem Statement */}
                  <div>
                    <label className="text-sm font-medium text-wl-text mb-2 block">Problem Statement</label>
                    {isEditing ? (
                      <Textarea
                        value={editableFields.problem_statement}
                        onChange={(e) => setEditableFields(prev => ({ ...prev, problem_statement: e.target.value }))}
                        placeholder="Describe the problem or job to be done"
                        rows={4}
                      />
                    ) : (
                      <p className="text-wl-muted whitespace-pre-wrap">
                        {intakeRequest.problem_statement || 'No problem statement provided'}
                      </p>
                    )}
                  </div>

                  {/* Automation Idea */}
                  <div>
                    <label className="text-sm font-medium text-wl-text mb-2 block">Automation Idea</label>
                    {isEditing ? (
                      <Textarea
                        value={editableFields.automation_idea}
                        onChange={(e) => setEditableFields(prev => ({ ...prev, automation_idea: e.target.value }))}
                        placeholder="Describe the proposed automation solution"
                        rows={4}
                      />
                    ) : (
                      <p className="text-wl-muted whitespace-pre-wrap">
                        {intakeRequest.automation_idea || 'No automation idea provided'}
                      </p>
                    )}
                  </div>

                  {/* Ethics Considerations */}
                  <div>
                    <label className="text-sm font-medium text-wl-text mb-2 block">Ethics Considerations</label>
                    {isEditing ? (
                      <Textarea
                        value={editableFields.ethics_considerations}
                        onChange={(e) => setEditableFields(prev => ({ ...prev, ethics_considerations: e.target.value }))}
                        placeholder="Any ethical considerations or concerns"
                        rows={3}
                      />
                    ) : (
                      <p className="text-wl-muted whitespace-pre-wrap">
                        {intakeRequest.ethics_considerations || 'No ethics considerations provided'}
                      </p>
                    )}
                  </div>

                  {/* Enhanced Fields */}
                  {intakeRequest.current_process && (
                    <div>
                      <label className="text-sm font-medium text-wl-text mb-2 block">Current Process</label>
                      <p className="text-wl-muted whitespace-pre-wrap">{intakeRequest.current_process}</p>
                    </div>
                  )}

                  {intakeRequest.pain_points && (
                    <div>
                      <label className="text-sm font-medium text-wl-text mb-2 block">Pain Points</label>
                      <p className="text-wl-muted whitespace-pre-wrap">{intakeRequest.pain_points}</p>
                    </div>
                  )}

                  {intakeRequest.frequency && (
                    <div>
                      <label className="text-sm font-medium text-wl-text mb-2 block">Frequency</label>
                      <Badge variant="outline">{intakeRequest.frequency}</Badge>
                    </div>
                  )}

                  {intakeRequest.time_friendly && (
                    <div>
                      <label className="text-sm font-medium text-wl-text mb-2 block">Time Estimate</label>
                      <p className="text-wl-muted">{intakeRequest.time_friendly}</p>
                    </div>
                  )}

                  {intakeRequest.systems && intakeRequest.systems.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-wl-text mb-2 block">Systems Used</label>
                      <div className="flex flex-wrap gap-2">
                        {intakeRequest.systems.map((system, index) => (
                          <Badge key={index} variant="secondary">{system}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {intakeRequest.sensitivity && (
                    <div>
                      <label className="text-sm font-medium text-wl-text mb-2 block">Data Sensitivity</label>
                      <div className="flex items-center space-x-2">
                        <Shield className="h-4 w-4 text-wl-accent" />
                        <Badge variant="outline">{intakeRequest.sensitivity}</Badge>
                      </div>
                    </div>
                  )}

                  {intakeRequest.links && (
                    <div>
                      <label className="text-sm font-medium text-wl-text mb-2 block">Related Links</label>
                      <div className="space-y-2">
                        {intakeRequest.links.split('\n').map((link, index) => (
                          <a
                            key={index}
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-2 text-wl-accent hover:underline"
                          >
                            <LinkIcon className="h-4 w-4" />
                            <span className="truncate">{link}</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Comments Section */}
              <Card className="wl-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageSquare className="h-5 w-5" />
                    <span>Comments ({comments.length})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Add Comment */}
                  {user ? (
                    <div className="space-y-3">
                      <Textarea
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        rows={3}
                      />
                      <div className="flex justify-end">
                        <Button
                          onClick={handleAddComment}
                          disabled={!newComment.trim() || isSubmittingComment}
                          size="sm"
                        >
                          <Send className="h-4 w-4 mr-2" />
                          {isSubmittingComment ? 'Posting...' : 'Post Comment'}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 border-2 border-dashed border-wl-muted/30 rounded-lg">
                      <MessageSquare className="h-8 w-8 text-wl-muted mx-auto mb-2" />
                      <p className="text-wl-muted text-sm mb-2">Sign in to add comments</p>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => router.push('/auth/login')}
                      >
                        Sign In
                      </Button>
                    </div>
                  )}

                  {/* Comments List */}
                  <div className="space-y-4">
                    {comments.length === 0 ? (
                      <p className="text-wl-muted text-center py-4">No comments yet. Be the first to comment!</p>
                    ) : (
                      comments.map((comment) => (
                        <div key={comment.id} className="border-l-4 border-wl-accent/20 pl-4 py-2">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4 text-wl-muted" />
                              <span className="text-sm font-medium text-wl-text">
                                {comment.author_user?.email || 'Unknown User'}
                              </span>
                              <span className="text-xs text-wl-muted">
                                {new Date(comment.created_at).toLocaleString()}
                              </span>
                            </div>
                          </div>
                          <p className="text-wl-muted text-sm whitespace-pre-wrap">{comment.content}</p>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Request Info */}
              <Card className="wl-card">
                <CardHeader>
                  <CardTitle className="text-lg">Request Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-wl-muted" />
                    <div>
                      <p className="text-sm font-medium text-wl-text">Requester</p>
                      <p className="text-sm text-wl-muted">
                        {intakeRequest.requester_user?.email || 
                         intakeRequest.slack_username || 
                         'Unknown User'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-wl-muted" />
                    <div>
                      <p className="text-sm font-medium text-wl-text">Created</p>
                      <p className="text-sm text-wl-muted">
                        {new Date(intakeRequest.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-wl-muted" />
                    <div>
                      <p className="text-sm font-medium text-wl-text">Last Updated</p>
                      <p className="text-sm text-wl-muted">
                        {new Date(intakeRequest.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {intakeRequest.jira_issue_key && (
                    <div className="flex items-center space-x-2">
                      <ExternalLink className="h-4 w-4 text-wl-muted" />
                      <div>
                        <p className="text-sm font-medium text-wl-text">Jira Issue</p>
                        <p className="text-sm text-wl-muted">{intakeRequest.jira_issue_key}</p>
                      </div>
                    </div>
                  )}

                  {intakeRequest.slack_team_name && (
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-wl-muted" />
                      <div>
                        <p className="text-sm font-medium text-wl-text">Slack Team</p>
                        <p className="text-sm text-wl-muted">{intakeRequest.slack_team_name}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="wl-card">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {intakeRequest.request_type === 'real' ? (
                    <>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => handleStatusUpdate('triaged')}
                        disabled={intakeRequest.status === 'triaged' || isUpdatingStatus}
                      >
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Mark as Triaged
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => handleStatusUpdate('building')}
                        disabled={intakeRequest.status === 'building' || isUpdatingStatus}
                      >
                        <Zap className="h-4 w-4 mr-2" />
                        Start Building
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => handleStatusUpdate('shipped')}
                        disabled={intakeRequest.status === 'shipped' || isUpdatingStatus}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark as Shipped
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="w-full justify-start text-red-600 hover:text-red-700"
                        onClick={() => handleStatusUpdate('declined')}
                        disabled={intakeRequest.status === 'declined' || isUpdatingStatus}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Decline Request
                      </Button>
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-wl-muted text-sm">
                        Quick actions are not available for {requestTypeInfo.label.toLowerCase()} requests.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Tags */}
              <Card className="wl-card">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Tag className="h-5 w-5" />
                    <span>Tags</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{intakeRequest.category?.replace('_', ' ') || 'Other'}</Badge>
                    <Badge variant="secondary">{intakeRequest.priority}</Badge>
                    <Badge variant="secondary">{intakeRequest.status}</Badge>
                    {intakeRequest.frequency && (
                      <Badge variant="outline">{intakeRequest.frequency}</Badge>
                    )}
                    {intakeRequest.sensitivity && (
                      <Badge variant="outline">{intakeRequest.sensitivity}</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
