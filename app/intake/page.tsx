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
  ArrowRight
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'

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

export default function IntakePage() {
  const [intakeRequests, setIntakeRequests] = useState<IntakeRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')

  useEffect(() => {
    const fetchIntakeRequests = async () => {
      const supabase = createClient()
      
      try {
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

        if (error) throw error

        setIntakeRequests(data || [])
      } catch (error) {
        console.error('Error fetching intake requests:', error)
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
      request.requester_user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || request.priority === priorityFilter
    
    return matchesSearch && matchesStatus && matchesPriority
  })

  const getStats = () => {
    const newCount = intakeRequests.filter(r => r.status === 'new').length
    const inProgressCount = intakeRequests.filter(r => ['triaged', 'building'].includes(r.status)).length
    const shippedCount = intakeRequests.filter(r => r.status === 'shipped').length
    const totalCount = intakeRequests.length

    return { newCount, inProgressCount, shippedCount, totalCount }
  }

  const stats = getStats()

  if (loading) {
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
  return (
    <div className="min-h-screen bg-wl-bg">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-8">
          <PageHeader
            title="Intake Board"
            description="Submit and track automation requests from your team."
          >
            <Button className="wl-button-primary">
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
              <Button className="wl-button-primary">
                <Plus className="mr-2 h-4 w-4" />
                New Request
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredRequests.map((request) => (
                <Card key={request.id} className="wl-card-hover">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="p-2 bg-wl-accent/10 rounded-xl">
                            <MessageSquare className="h-5 w-5 text-wl-accent" />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold text-wl-text">
                              {request.jira_issue_key || `Request ${request.id.slice(0, 8)}`}
                            </h3>
                            <StatusBadge status={request.status} />
                            <Badge className={priorityColors[request.priority]}>
                              {request.priority}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-wl-muted">
                            <div className="flex items-center space-x-1">
                              <User className="h-4 w-4" />
                              <span>{request.requester_user?.email || 'Unknown User'}</span>
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
                      <Button variant="ghost" size="sm">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      {request.problem_statement && (
                        <div>
                          <h4 className="font-medium text-wl-text mb-2">Problem Statement</h4>
                          <p className="text-wl-muted text-sm">
                            {request.problem_statement}
                          </p>
                        </div>
                      )}
                      
                      {request.automation_idea && (
                        <div>
                          <h4 className="font-medium text-wl-text mb-2">Automation Idea</h4>
                          <p className="text-wl-muted text-sm">
                            {request.automation_idea}
                          </p>
                        </div>
                      )}
                      
                      {request.ethics_considerations && (
                        <div>
                          <h4 className="font-medium text-wl-text mb-2">Ethics Considerations</h4>
                          <p className="text-wl-muted text-sm">
                            {request.ethics_considerations}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
