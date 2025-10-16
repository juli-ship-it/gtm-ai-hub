'use client'

import { useEffect, useState } from 'react'
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
  Plus, 
  Search, 
  Filter, 
  MessageSquare,
  Clock,
  User,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Star,
  Zap,
  Play,
  Pause,
  CheckCircle2,
  X,
  Edit3,
  MoreHorizontal
} from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'
import { IntakeForm } from '@/components/intake-form'
import { useAuth } from '@/lib/auth/context'

type IntakeRequest = Database['public']['Tables']['intake_request']['Row'] & {
  requester_user?: Database['public']['Tables']['app_user']['Row']
  comments?: { count: number }[]
}

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800'
}

const typeColors = {
  real: 'bg-blue-100 text-blue-800',
  showcase: 'bg-purple-100 text-purple-800',
  demo: 'bg-green-100 text-green-800'
}

const typeIcons = {
  real: MessageSquare,
  showcase: Star,
  demo: Zap
}

export default function IntakePage() {
  const { user, loading: authLoading } = useAuth()
  const [intakeRequests, setIntakeRequests] = useState<IntakeRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [isIntakeFormOpen, setIsIntakeFormOpen] = useState(false)

  useEffect(() => {
    const fetchIntakeRequests = async () => {
      const supabase = createClient()
      
      try {
        // First try with the join, but handle null requester
        const { data, error } = await supabase
          .from('intake_request')
          .select(`
            *,
            requester_user:requester (
              email
            ),
            comments:intake_comment(count)
          `)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error with join query:', error)
          console.error('Error details:', JSON.stringify(error, null, 2))
          // Fallback to simple query without join
          const { data: simpleData, error: simpleError } = await supabase
            .from('intake_request')
            .select('*')
            .order('created_at', { ascending: false })
          
          if (simpleError) {
            console.error('Simple query also failed:', simpleError)
            console.error('Simple error details:', JSON.stringify(simpleError, null, 2))
            throw simpleError
          }
          console.log('Simple query data:', simpleData)
          setIntakeRequests(simpleData || [])
        } else {
          console.log('Join query data:', data)
          setIntakeRequests(data || [])
        }
      } catch (error) {
        console.error('Error fetching intake requests:', error)
        // Set empty array on error to show "no requests" state
        setIntakeRequests([])
      } finally {
        setLoading(false)
      }
    }

    fetchIntakeRequests()
  }, [])

  const filteredRequests = intakeRequests.filter(request => {
    const matchesSearch = 
      request.jira_issue_key?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.problem_statement?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.automation_idea?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.requester_user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.slack_username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.title?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || request.priority === priorityFilter
    // Handle requests that might not have request_type field yet (fallback to 'real')
    const requestType = request.request_type || 'real'
    const matchesType = typeFilter === 'all' || requestType === typeFilter
    
    
    
    return matchesSearch && matchesStatus && matchesPriority && matchesType
  })

  const getStats = () => {
    const realRequests = intakeRequests.filter(r => (r.request_type || 'real') === 'real')
    const newCount = realRequests.filter(r => r.status === 'new').length
    const inProgressCount = realRequests.filter(r => ['triaged', 'building'].includes(r.status)).length
    const shippedCount = realRequests.filter(r => r.status === 'shipped').length
    const totalCount = realRequests.length

    return { newCount, inProgressCount, shippedCount, totalCount }
  }

  const stats = getStats()

  const handleIntakeSuccess = (intakeId: string) => {
    // Refresh the intake requests list
    window.location.reload() // Simple refresh for now
    setIsIntakeFormOpen(false)
  }

  const handleQuickStatusUpdate = async (requestId: string, newStatus: string) => {
    const supabase = createClient()
    
    try {
      const { error } = await (supabase as any)
        .from('intake_request')
        .update({ status: newStatus })
        .eq('id', requestId)

      if (error) throw error
      
      // Update local state
      setIntakeRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { ...req, status: newStatus as any }
            : req
        )
      )
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const getStatusActions = (currentStatus: string) => {
    switch (currentStatus) {
      case 'new':
        return [
          { label: 'Start Review', status: 'triaged', icon: Play, color: 'bg-blue-100 text-blue-800 hover:bg-blue-200' },
          { label: 'Decline', status: 'declined', icon: X, color: 'bg-red-100 text-red-800 hover:bg-red-200' }
        ]
      case 'triaged':
        return [
          { label: 'Start Building', status: 'building', icon: Play, color: 'bg-green-100 text-green-800 hover:bg-green-200' },
          { label: 'Back to New', status: 'new', icon: Pause, color: 'bg-gray-100 text-gray-800 hover:bg-gray-200' }
        ]
      case 'building':
        return [
          { label: 'Mark Shipped', status: 'shipped', icon: CheckCircle2, color: 'bg-green-100 text-green-800 hover:bg-green-200' },
          { label: 'Back to Review', status: 'triaged', icon: Pause, color: 'bg-gray-100 text-gray-800 hover:bg-gray-200' }
        ]
      case 'shipped':
        return [
          { label: 'Reopen', status: 'building', icon: Edit3, color: 'bg-orange-100 text-orange-800 hover:bg-orange-200' }
        ]
      case 'declined':
        return [
          { label: 'Reopen', status: 'new', icon: Edit3, color: 'bg-blue-100 text-blue-800 hover:bg-blue-200' }
        ]
      default:
        return []
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-wl-bg">
        <div className="flex">
          <Sidebar />
          <div className="flex-1 p-8">
            <PageHeader
              title="Intake Board"
              description="Submit and track automation requests from your team."
            />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse" />
              ))}
            </div>
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
              ))}
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
              description="Please sign in to access the intake board."
            />
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-wl-muted mx-auto mb-4" />
              <h3 className="text-lg font-medium text-wl-text mb-2">Sign In Required</h3>
              <p className="text-wl-muted mb-4">
                You need to be signed in to view and submit intake requests.
              </p>
              <Button onClick={() => window.location.href = '/auth/login'}>
                Sign In
              </Button>
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
            title="Intake Board"
            description="Submit and track automation requests from your team."
          >
            <Button 
              className="wl-button-primary"
              onClick={() => setIsIntakeFormOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Request
            </Button>
          </PageHeader>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="wl-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-wl-muted">New Requests</p>
                    <p className="text-2xl font-bold text-wl-text">{stats.newCount}</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="wl-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-wl-muted">In Progress</p>
                    <p className="text-2xl font-bold text-wl-text">{stats.inProgressCount}</p>
                  </div>
                  <Clock className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="wl-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-wl-muted">Shipped</p>
                    <p className="text-2xl font-bold text-wl-text">{stats.shippedCount}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="wl-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-wl-muted">Total</p>
                    <p className="text-2xl font-bold text-wl-text">{stats.totalCount}</p>
                  </div>
                  <MessageSquare className="h-8 w-8 text-wl-accent" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="mb-8 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-wl-muted" />
                <Input
                  placeholder="Search requests..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="triaged">Triaged</SelectItem>
                <SelectItem value="building">Building</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="declined">Declined</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="real">Requests</SelectItem>
                <SelectItem value="showcase">Showcase</SelectItem>
                <SelectItem value="demo">Demo</SelectItem>
                <SelectItem value="all">All Types</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Intake Requests */}
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-wl-muted mx-auto mb-4" />
              <h3 className="text-lg font-medium text-wl-text mb-2">No requests found</h3>
              <p className="text-wl-muted mb-4">
                {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Get started by submitting your first automation request.'
                }
              </p>
              <Button 
                className="wl-button-primary"
                onClick={() => setIsIntakeFormOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                New Request
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredRequests.map((request) => (
                <Card key={request.id} className="wl-card hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="p-2 bg-wl-accent/10 rounded-xl">
                            {(() => {
                              const requestType = request.request_type || 'real'
                              const TypeIcon = typeIcons[requestType] || MessageSquare
                              return <TypeIcon className="h-5 w-5 text-wl-accent" />
                            })()}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold text-wl-text">
                              {request.title || request.jira_issue_key || `Request ${request.id.slice(0, 8)}`}
                            </h3>
                            <StatusBadge status={request.status} />
                            <Badge className={priorityColors[request.priority]}>
                              {request.priority}
                            </Badge>
                            <Badge className={typeColors[request.request_type || 'real']}>
                              {request.request_type || 'real'}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-wl-muted">
                            <div className="flex items-center space-x-1">
                              <User className="h-4 w-4" />
                              <span>
                                {request.requester_user?.email || 
                                 request.slack_username || 
                                 'Unknown User'}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>
                                {new Date(request.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MessageSquare className="h-4 w-4" />
                              <span>{request.comments?.[0]?.count || 0} comments</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Link href={`/intake/${request.id}`}>
                          <Button variant="ghost" size="sm">
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-4">
                      {request.problem_statement && (
                        <div>
                          <h4 className="font-medium text-wl-text mb-1">Problem Statement</h4>
                          <p className="text-wl-muted text-sm line-clamp-2">
                            {request.problem_statement}
                          </p>
                        </div>
                      )}
                      
                      {request.automation_idea && (
                        <div>
                          <h4 className="font-medium text-wl-text mb-1">Automation Idea</h4>
                          <p className="text-wl-muted text-sm line-clamp-2">
                            {request.automation_idea}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-2">
                        {getStatusActions(request.status).map((action, index) => {
                          const ActionIcon = action.icon
                          return (
                            <Button
                              key={index}
                              variant="ghost"
                              size="sm"
                              className={`text-xs ${action.color}`}
                              onClick={() => handleQuickStatusUpdate(request.id, action.status)}
                            >
                              <ActionIcon className="h-3 w-3 mr-1" />
                              {action.label}
                            </Button>
                          )
                        })}
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-wl-muted">
                        <span>ID: {request.id.slice(0, 8)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Intake Form Modal */}
      <IntakeForm
        isOpen={isIntakeFormOpen}
        onClose={() => setIsIntakeFormOpen(false)}
        onSuccess={handleIntakeSuccess}
      />
    </div>
  )
}
