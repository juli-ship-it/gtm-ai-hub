import { PageHeader } from '@/components/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { StatusBadge } from '@/components/status-badge'
import { Sidebar } from '@/components/sidebar'
import { 
  Search, 
  Filter, 
  Download, 
  RefreshCw,
  Clock,
  User,
  FileText,
  Eye
} from 'lucide-react'

// Mock data
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
    finishedAt: '2024-01-14T16:24:15Z',
    duration: '4m 15s',
    artifacts: {
      campaign_id: 'campaign_789',
      email_count: 5,
      hubspot_workflow_id: 'workflow_101'
    }
  }
]

export default function RunsPage() {
  return (
    <div className="min-h-screen bg-wl-bg">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-8">
          <PageHeader
            title="Run History"
            description="Track and monitor all your automation runs, their status, and artifacts."
          >
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </PageHeader>

          {/* Filters */}
          <div className="mb-8 flex flex-col sm:flex-row gap-4">
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
                <SelectItem value="succeeded">Succeeded</SelectItem>
                <SelectItem value="running">Running</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="queued">Queued</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Templates</SelectItem>
                <SelectItem value="youtube-blog">YouTube → Blog</SelectItem>
                <SelectItem value="blog-linkedin">Blog → LinkedIn</SelectItem>
                <SelectItem value="weekly-report">Weekly Report</SelectItem>
                <SelectItem value="daily-alerts">Daily Alerts</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Runs Table */}
          <Card className="wl-card">
            <CardHeader>
              <CardTitle>Recent Runs</CardTitle>
              <CardDescription>
                {mockRuns.length} runs found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockRuns.map((run) => (
                  <div key={run.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="flex-shrink-0">
                        <div className="p-2 bg-wl-accent/10 rounded-xl">
                          <FileText className="h-5 w-5 text-wl-accent" />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-1">
                          <h4 className="font-medium text-wl-text truncate">
                            {run.template}
                          </h4>
                          <StatusBadge status={run.status} />
                        </div>
                        
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
                          <span>•</span>
                          <span>{run.duration}</span>
                        </div>
                        
                        {run.errorMessage && (
                          <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded-lg">
                            {run.errorMessage}
                          </div>
                        )}
                        
                        {run.artifacts && (
                          <div className="mt-2 flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              {Object.keys(run.artifacts).length} artifacts
                            </Badge>
                            {run.artifacts.blog_post_id && (
                              <Badge variant="outline" className="text-xs">
                                Blog Post
                              </Badge>
                            )}
                            {run.artifacts.report_url && (
                              <Badge variant="outline" className="text-xs">
                                Report
                              </Badge>
                            )}
                            {run.artifacts.campaign_id && (
                              <Badge variant="outline" className="text-xs">
                                Campaign
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {run.status === 'succeeded' && (
                        <Button size="sm" className="wl-button-primary">
                          Re-run
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
