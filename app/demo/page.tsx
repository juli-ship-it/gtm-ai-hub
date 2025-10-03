'use client'

import { useState } from 'react'
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
  Play,
  FileText,
  TrendingUp,
  Zap,
  Star,
  Download,
  RefreshCw,
  Eye,
  Users,
  Target,
  BookOpen,
  BarChart3,
  ClipboardList,
  Shield
} from 'lucide-react'

// Mock data for demo
const mockStats = {
  runsToday: 12,
  timeSaved: 24,
  successRate: 94,
  activeTemplates: 8
}

const mockRecentRuns = [
  {
    id: '1',
    template: 'YouTube → Blog (SEO)',
    status: 'succeeded' as const,
    startedAt: '2024-01-15T10:30:00Z',
    duration: '2m 34s'
  },
  {
    id: '2',
    template: 'Blog → LinkedIn',
    status: 'running' as const,
    startedAt: '2024-01-15T11:15:00Z',
    duration: '1m 12s'
  },
  {
    id: '3',
    template: 'Weekly Campaign Report',
    status: 'succeeded' as const,
    startedAt: '2024-01-15T09:00:00Z',
    duration: '4m 56s'
  }
]

const mockTemplates = [
  {
    id: '1',
    slug: 'youtube-to-blog-seo',
    name: 'YouTube → Blog (SEO)',
    category: 'content',
    description: 'Convert YouTube videos into SEO-optimized blog posts with keyword research and meta descriptions',
    version: 'v1.2',
    runs: 45,
    avgTime: '2m 34s',
    lastRun: '2024-01-15T10:30:00Z',
    successRate: 96,
    isNew: true,
    isPopular: true
  },
  {
    id: '2',
    slug: 'blog-to-linkedin',
    name: 'Blog → LinkedIn',
    category: 'content',
    description: 'Transform blog posts into engaging LinkedIn content with professional tone and hashtags',
    version: 'v1.0',
    runs: 32,
    avgTime: '1m 12s',
    lastRun: '2024-01-15T11:15:00Z',
    successRate: 94,
    isNew: false,
    isPopular: true
  },
  {
    id: '3',
    slug: 'webinar-to-nurture',
    name: 'Webinar → Nurture Campaign',
    category: 'content',
    description: 'Create email nurture sequences from webinar content with personalized follow-ups',
    version: 'v1.1',
    runs: 28,
    avgTime: '3m 45s',
    lastRun: '2024-01-14T16:20:00Z',
    successRate: 89,
    isNew: false,
    isPopular: false
  },
  {
    id: '4',
    slug: 'weekly-campaign-report',
    name: 'Weekly Campaign Report',
    category: 'reporting',
    description: 'Generate comprehensive weekly campaign performance reports with insights and recommendations',
    version: 'v2.0',
    runs: 67,
    avgTime: '4m 56s',
    lastRun: '2024-01-15T09:00:00Z',
    successRate: 98,
    isNew: false,
    isPopular: true
  },
  {
    id: '5',
    slug: 'daily-spend-alerts',
    name: 'Daily Spend & CPA Alerts',
    category: 'reporting',
    description: 'Monitor daily ad spend and cost-per-acquisition with automated alerts and recommendations',
    version: 'v1.3',
    runs: 89,
    avgTime: '1m 30s',
    lastRun: '2024-01-15T08:00:00Z',
    successRate: 92,
    isNew: false,
    isPopular: false
  },
  {
    id: '6',
    slug: 'jira-slack-intake',
    name: 'Jira → Slack Intake Bot',
    category: 'intake',
    description: 'Automatically create intake requests from Jira tickets and notify teams via Slack',
    version: 'v1.0',
    runs: 156,
    avgTime: '30s',
    lastRun: '2024-01-15T12:45:00Z',
    successRate: 99,
    isNew: true,
    isPopular: true
  }
]

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

const mockRuns = [
  {
    id: '1',
    template: 'YouTube → Blog (SEO)',
    triggeredBy: 'Juliana Reyes',
    status: 'succeeded' as const,
    startedAt: '2024-01-15T10:30:00Z',
    finishedAt: '2024-01-15T10:32:34Z',
    duration: '2m 34s',
    artifacts: {
      blog_post_id: 'blog_123',
      hubspot_draft_id: 'draft_456',
      word_count: 1200
    }
  },
  {
    id: '2',
    template: 'Blog → LinkedIn',
    triggeredBy: 'Juliana Reyes',
    status: 'running' as const,
    startedAt: '2024-01-15T11:15:00Z',
    finishedAt: null,
    duration: '1m 12s',
    artifacts: null
  },
  {
    id: '3',
    template: 'Weekly Campaign Report',
    triggeredBy: 'Juliana Reyes',
    status: 'succeeded' as const,
    startedAt: '2024-01-15T09:00:00Z',
    finishedAt: '2024-01-15T09:04:56Z',
    duration: '4m 56s',
    artifacts: {
      report_url: 'https://reports.workleap.com/weekly-2024-01-15',
      summary: 'Strong performance across all channels',
      recommendations: ['Increase LinkedIn budget', 'Optimize email subject lines']
    }
  },
  {
    id: '4',
    template: 'Daily Spend & CPA Alerts',
    triggeredBy: 'Juliana Reyes',
    status: 'failed' as const,
    startedAt: '2024-01-15T08:00:00Z',
    finishedAt: '2024-01-15T08:00:45Z',
    duration: '45s',
    artifacts: null,
    errorMessage: 'Invalid budget configuration provided'
  },
  {
    id: '5',
    template: 'Webinar → Nurture Campaign',
    triggeredBy: 'Juliana Reyes',
    status: 'succeeded' as const,
    startedAt: '2024-01-14T16:20:00Z',
    finishedAt: '2024-01-14T16:23:45Z',
    duration: '3m 45s',
    artifacts: {
      email_sequence_id: 'seq_789',
      campaign_name: 'Q1 Webinar Follow-up',
      emails_sent: 3
    }
  }
]

const mockPlaybooks = [
  {
    id: '1',
    name: 'Webinar → Nurture Campaign',
    description: 'Complete workflow to convert webinar content into a multi-touch email nurture campaign',
    templatesIncluded: ['Webinar → Nurture', 'Blog → LinkedIn'],
    humanSteps: 3,
    estimatedTime: '4 hours',
    lastRun: '2024-01-15T10:30:00Z',
    runs: 12,
    successRate: 92,
    kpis: {
      targetSendTime: '24 hours',
      expectedOpenRate: '25%',
      expectedClickRate: '5%'
    }
  },
  {
    id: '2',
    name: 'Content Repurposing',
    description: 'Systematic approach to repurpose content across multiple channels',
    templatesIncluded: ['YouTube → Blog', 'Blog → LinkedIn'],
    humanSteps: 3,
    estimatedTime: '2 hours',
    lastRun: '2024-01-14T16:20:00Z',
    runs: 8,
    successRate: 88,
    kpis: {
      targetCompletionTime: '4 hours',
      expectedEngagementIncrease: '15%',
      expectedReachIncrease: '30%'
    }
  },
  {
    id: '3',
    name: 'Lead Nurturing Sequence',
    description: 'Automated lead nurturing with personalized content based on behavior',
    templatesIncluded: ['Email Personalization', 'Content Recommendations'],
    humanSteps: 2,
    estimatedTime: '3 hours',
    lastRun: '2024-01-13T14:15:00Z',
    runs: 15,
    successRate: 95,
    kpis: {
      targetResponseTime: '2 hours',
      expectedConversionRate: '8%',
      expectedEngagementRate: '35%'
    }
  }
]

const mockPrompts = [
  {
    id: '1',
    name: 'Content Writer',
    role: 'writer',
    body: 'You are a professional content writer specializing in B2B marketing. Create engaging, informative content that resonates with business decision-makers.',
    version: 'v2.1',
    tags: ['content', 'b2b', 'marketing'],
    createdBy: 'Juliana Reyes',
    createdAt: '2024-01-10T09:00:00Z'
  },
  {
    id: '2',
    name: 'SEO Optimizer',
    role: 'seo_researcher',
    body: 'You are an SEO expert. Analyze content for search optimization opportunities and provide specific recommendations for improving organic visibility.',
    version: 'v1.5',
    tags: ['seo', 'optimization', 'research'],
    createdBy: 'Juliana Reyes',
    createdAt: '2024-01-08T14:30:00Z'
  },
  {
    id: '3',
    name: 'Compliance Checker',
    role: 'compliance',
    body: 'You are a compliance specialist. Review content for regulatory compliance, brand guidelines, and ethical considerations.',
    version: 'v1.0',
    tags: ['compliance', 'legal', 'ethics'],
    createdBy: 'Juliana Reyes',
    createdAt: '2024-01-05T11:15:00Z'
  }
]

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

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800'
}

type TabType = 'dashboard' | 'templates' | 'intake' | 'runs' | 'playbooks' | 'prompts'

export default function DemoPage() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="wl-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-wl-muted">Runs Today</p>
                <p className="text-2xl font-bold text-wl-text">{mockStats.runsToday}</p>
              </div>
              <Play className="h-8 w-8 text-wl-accent" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="wl-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-wl-muted">Hours Saved</p>
                <p className="text-2xl font-bold text-wl-text">{mockStats.timeSaved}</p>
              </div>
              <Clock className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="wl-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-wl-muted">Success Rate</p>
                <p className="text-2xl font-bold text-wl-text">{mockStats.successRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="wl-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-wl-muted">Active Templates</p>
                <p className="text-2xl font-bold text-wl-text">{mockStats.activeTemplates}</p>
              </div>
              <Zap className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Runs */}
      <Card className="wl-card">
        <CardHeader>
          <CardTitle>Recent Runs</CardTitle>
          <CardDescription>Latest automation executions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockRecentRuns.map((run) => (
              <div key={run.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-wl-accent/10 rounded-lg">
                    <Play className="h-4 w-4 text-wl-accent" />
                  </div>
                  <div>
                    <p className="font-medium text-wl-text">{run.template}</p>
                    <p className="text-sm text-wl-muted">
                      {new Date(run.startedAt).toLocaleString()} • {run.duration}
                    </p>
                  </div>
                </div>
                <StatusBadge status={run.status} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Popular Templates */}
      <Card className="wl-card">
        <CardHeader>
          <CardTitle>Popular Templates</CardTitle>
          <CardDescription>Most used automation templates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockTemplates.slice(0, 3).map((template) => {
              const CategoryIcon = categoryIcons[template.category as keyof typeof categoryIcons]
              return (
                <div key={template.id} className="p-4 border border-gray-100 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-3 mb-2">
                    <CategoryIcon className="h-5 w-5 text-wl-accent" />
                    <h4 className="font-medium text-wl-text">{template.name}</h4>
                  </div>
                  <p className="text-sm text-wl-muted mb-3">{template.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-wl-muted">{template.runs} runs</span>
                    <Button size="sm" variant="outline">
                      <Play className="h-3 w-3 mr-1" />
                      Run
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderTemplates = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-wl-muted" />
            <Input
              placeholder="Search templates..."
              className="pl-10"
            />
          </div>
        </div>
        <Select defaultValue="all">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockTemplates.map((template) => {
          const CategoryIcon = categoryIcons[template.category as keyof typeof categoryIcons]
          const categoryColor = categoryColors[template.category as keyof typeof categoryColors]
          
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
                    {template.isNew && (
                      <Badge variant="secondary" className="text-xs">
                        New
                      </Badge>
                    )}
                    {template.isPopular && (
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
                    <p className="font-semibold text-wl-text">{template.runs}</p>
                  </div>
                  <div>
                    <p className="text-wl-muted">Avg Time</p>
                    <p className="font-semibold text-wl-text">{template.avgTime}</p>
                  </div>
                  <div>
                    <p className="text-wl-muted">Success Rate</p>
                    <p className="font-semibold text-wl-text">{template.successRate}%</p>
                  </div>
                  <div>
                    <p className="text-wl-muted">Last Run</p>
                    <p className="font-semibold text-wl-text">
                      {new Date(template.lastRun).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center text-sm text-wl-muted">
                    <Clock className="h-4 w-4 mr-1" />
                    Updated 2 days ago
                  </div>
                  <Button 
                    size="sm" 
                    className="wl-button-primary group-hover:shadow-lg transition-all duration-200"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Run Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )

  const renderIntake = () => (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
      <div className="flex flex-col sm:flex-row gap-4">
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
  )

  const renderRuns = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-wl-muted" />
            <Input
              placeholder="Search runs..."
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
            <SelectItem value="queued">Queued</SelectItem>
            <SelectItem value="running">Running</SelectItem>
            <SelectItem value="succeeded">Succeeded</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
        <Button variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Runs Table */}
      <div className="space-y-4">
        {mockRuns.map((run) => (
          <Card key={run.id} className="wl-card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-wl-accent/10 rounded-lg">
                    <Play className="h-4 w-4 text-wl-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-wl-text">{run.template}</h3>
                    <div className="flex items-center space-x-4 text-sm text-wl-muted">
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>{run.triggeredBy}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>
                          {new Date(run.startedAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{run.duration}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <StatusBadge status={run.status} />
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {run.artifacts && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-wl-text mb-2">Artifacts</h4>
                  <pre className="text-sm text-wl-muted overflow-x-auto">
                    {JSON.stringify(run.artifacts, null, 2)}
                  </pre>
                </div>
              )}
              
              {run.errorMessage && (
                <div className="mt-4 p-4 bg-red-50 rounded-lg">
                  <h4 className="font-medium text-red-800 mb-2">Error</h4>
                  <p className="text-sm text-red-600">{run.errorMessage}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderPlaybooks = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-wl-muted" />
            <Input
              placeholder="Search playbooks..."
              className="pl-10"
            />
          </div>
        </div>
        <Select defaultValue="all">
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

      {/* Playbooks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockPlaybooks.map((playbook) => (
          <Card key={playbook.id} className="wl-card-hover group">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-wl-accent/10 rounded-xl">
                    <BookOpen className="h-5 w-5 text-wl-accent" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{playbook.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {playbook.description}
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-wl-muted">Templates</p>
                  <p className="font-semibold text-wl-text">{playbook.templatesIncluded.length}</p>
                </div>
                <div>
                  <p className="text-wl-muted">Human Steps</p>
                  <p className="font-semibold text-wl-text">{playbook.humanSteps}</p>
                </div>
                <div>
                  <p className="text-wl-muted">Est. Time</p>
                  <p className="font-semibold text-wl-text">{playbook.estimatedTime}</p>
                </div>
                <div>
                  <p className="text-wl-muted">Success Rate</p>
                  <p className="font-semibold text-wl-text">{playbook.successRate}%</p>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-wl-muted">
                    Last run: {new Date(playbook.lastRun).toLocaleDateString()}
                  </div>
                  <Button 
                    size="sm" 
                    className="wl-button-primary group-hover:shadow-lg transition-all duration-200"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Run Playbook
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderPrompts = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-wl-muted" />
            <Input
              placeholder="Search prompts..."
              className="pl-10"
            />
          </div>
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-48">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="writer">Writer</SelectItem>
            <SelectItem value="editor">Editor</SelectItem>
            <SelectItem value="classifier">Classifier</SelectItem>
            <SelectItem value="seo_researcher">SEO Researcher</SelectItem>
            <SelectItem value="compliance">Compliance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Prompts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockPrompts.map((prompt) => (
          <Card key={prompt.id} className="wl-card-hover group">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-wl-accent/10 rounded-xl">
                    <FileText className="h-5 w-5 text-wl-accent" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{prompt.name}</CardTitle>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {prompt.role}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {prompt.version}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-wl-muted mb-2">Prompt Body</p>
                <p className="text-sm text-wl-text line-clamp-3">
                  {prompt.body}
                </p>
              </div>
              
              <div className="flex flex-wrap gap-1">
                {prompt.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-wl-muted">
                    Created by {prompt.createdBy}
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="group-hover:shadow-lg transition-all duration-200"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard()
      case 'templates':
        return renderTemplates()
      case 'intake':
        return renderIntake()
      case 'runs':
        return renderRuns()
      case 'playbooks':
        return renderPlaybooks()
      case 'prompts':
        return renderPrompts()
      default:
        return renderDashboard()
    }
  }

  return (
    <div className="min-h-screen bg-wl-bg">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-8">
          <PageHeader
            title="Demo Mode"
            description="Preview all features with mock data. This is a demonstration of the GTM Hub interface."
          >
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                Demo Mode
              </Badge>
              <Button variant="outline" onClick={() => window.location.href = '/app'}>
                <ArrowRight className="mr-2 h-4 w-4" />
                Go to Real App
              </Button>
            </div>
          </PageHeader>

          {/* Tab Navigation */}
          <div className="mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {[
                  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
                  { id: 'templates', label: 'Templates', icon: FileText },
                  { id: 'intake', label: 'Intake', icon: MessageSquare },
                  { id: 'runs', label: 'Runs', icon: Play },
                  { id: 'playbooks', label: 'Playbooks', icon: BookOpen },
                  { id: 'prompts', label: 'Prompts', icon: FileText }
                ].map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as TabType)}
                      className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-wl-accent text-wl-accent'
                          : 'border-transparent text-wl-muted hover:text-wl-text hover:border-gray-300'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{tab.label}</span>
                    </button>
                  )
                })}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          {renderContent()}
        </div>
      </div>
    </div>
  )
}
