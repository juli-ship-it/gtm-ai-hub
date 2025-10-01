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

// Mock data
const mockIntakeRequests = [
  {
    id: '1',
    jiraIssueKey: 'GTM-123',
    requester: 'Juliana Reyes',
    problemStatement: 'We need to automate the creation of case studies from customer interviews',
    automationIdea: 'Create a template that takes interview transcripts and generates structured case studies with quotes and key metrics',
    ethicsConsiderations: 'Ensure customer consent and data privacy compliance',
    status: 'new' as const,
    priority: 'high' as const,
    createdAt: '2024-01-15T14:30:00Z',
    comments: 2
  },
  {
    id: '2',
    jiraIssueKey: 'GTM-124',
    requester: 'Juliana Reyes',
    problemStatement: 'Manual social media posting is time-consuming and inconsistent',
    automationIdea: 'Build a system that automatically posts content across LinkedIn, Twitter, and Facebook with platform-specific optimizations',
    ethicsConsiderations: 'Maintain authentic voice and avoid spam-like behavior',
    status: 'triaged' as const,
    priority: 'medium' as const,
    createdAt: '2024-01-15T10:15:00Z',
    comments: 5
  },
  {
    id: '3',
    jiraIssueKey: 'GTM-125',
    requester: 'Juliana Reyes',
    problemStatement: 'Lead scoring is manual and inconsistent across sales reps',
    automationIdea: 'Implement AI-powered lead scoring based on engagement data and firmographics',
    ethicsConsiderations: 'Ensure fair and unbiased scoring algorithms',
    status: 'building' as const,
    priority: 'high' as const,
    createdAt: '2024-01-14T16:45:00Z',
    comments: 8
  },
  {
    id: '4',
    jiraIssueKey: 'GTM-126',
    requester: 'Juliana Reyes',
    problemStatement: 'Email personalization at scale is challenging',
    automationIdea: 'Create dynamic email templates that personalize content based on user behavior and preferences',
    ethicsConsiderations: 'Respect user privacy and provide opt-out options',
    status: 'shipped' as const,
    priority: 'medium' as const,
    createdAt: '2024-01-12T09:20:00Z',
    comments: 12
  }
]

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800'
}

export default function IntakePage() {
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
                    <p className="text-2xl font-bold text-wl-text">1</p>
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
                    <p className="text-2xl font-bold text-wl-text">2</p>
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
                    <p className="text-2xl font-bold text-wl-text">1</p>
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
                    <p className="text-2xl font-bold text-wl-text">4</p>
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
                />
              </div>
            </div>
            <Select defaultValue="all">
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
            <Select defaultValue="all">
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
          <div className="space-y-6">
            {mockIntakeRequests.map((request) => (
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
                            {request.jiraIssueKey}
                          </h3>
                          <StatusBadge status={request.status} />
                          <Badge className={priorityColors[request.priority]}>
                            {request.priority}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-wl-muted">
                          <div className="flex items-center space-x-1">
                            <User className="h-4 w-4" />
                            <span>{request.requester}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>
                              {new Date(request.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MessageSquare className="h-4 w-4" />
                            <span>{request.comments} comments</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-wl-text mb-2">Problem Statement</h4>
                      <p className="text-wl-muted text-sm">
                        {request.problemStatement}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-wl-text mb-2">Automation Idea</h4>
                      <p className="text-wl-muted text-sm">
                        {request.automationIdea}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-wl-text mb-2">Ethics Considerations</h4>
                      <p className="text-wl-muted text-sm">
                        {request.ethicsConsiderations}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
