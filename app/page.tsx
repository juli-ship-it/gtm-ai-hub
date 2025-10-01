import { PageHeader } from '@/components/page-header'
import { KPIStat } from '@/components/kpi-stat'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sidebar } from '@/components/sidebar'
import { 
  Play, 
  FileText, 
  Clock, 
  TrendingUp, 
  Zap,
  ArrowRight,
  Star
} from 'lucide-react'

// Mock data for development
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
    name: 'YouTube → Blog (SEO)',
    category: 'content',
    description: 'Convert YouTube videos into SEO-optimized blog posts',
    lastRun: '2024-01-15T10:30:00Z',
    runs: 45,
    avgTime: '2m 34s'
  },
  {
    id: '2',
    name: 'Blog → LinkedIn',
    category: 'content',
    description: 'Transform blog posts into engaging LinkedIn content',
    lastRun: '2024-01-15T11:15:00Z',
    runs: 32,
    avgTime: '1m 12s'
  },
  {
    id: '3',
    name: 'Weekly Campaign Report',
    category: 'reporting',
    description: 'Generate comprehensive weekly campaign performance reports',
    lastRun: '2024-01-15T09:00:00Z',
    runs: 28,
    avgTime: '4m 56s'
  }
]

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-wl-bg">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-8">
          <PageHeader
            title="Welcome back, Juliana! 👋"
            description="Here's what's happening with your GTM automation today."
          />

          {/* KPI Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <KPIStat
              title="Runs Today"
              value={mockStats.runsToday}
              change={{ value: '+3', type: 'increase' }}
              icon={Play}
              description="vs yesterday"
            />
            <KPIStat
              title="Hours Saved"
              value={mockStats.timeSaved}
              change={{ value: '+8', type: 'increase' }}
              icon={Clock}
              description="this week"
            />
            <KPIStat
              title="Success Rate"
              value={`${mockStats.successRate}%`}
              change={{ value: '+2%', type: 'increase' }}
              icon={TrendingUp}
              description="last 7 days"
            />
            <KPIStat
              title="Active Templates"
              value={mockStats.activeTemplates}
              change={{ value: '2 new', type: 'increase' }}
              icon={Zap}
              description="this month"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Runs */}
            <Card className="wl-card">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Recent Runs
                  <Button variant="ghost" size="sm">
                    View All
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardTitle>
                <CardDescription>
                  Latest automation runs and their status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockRecentRuns.map((run) => (
                  <div key={run.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex-1">
                      <h4 className="font-medium text-wl-text">{run.template}</h4>
                      <p className="text-sm text-wl-muted">
                        Started {new Date(run.startedAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge 
                        variant={run.status === 'succeeded' ? 'success' : run.status === 'running' ? 'warning' : 'destructive'}
                      >
                        {run.status}
                      </Badge>
                      <span className="text-sm text-wl-muted">{run.duration}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Popular Templates */}
            <Card className="wl-card">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Popular Templates
                  <Button variant="ghost" size="sm">
                    View All
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardTitle>
                <CardDescription>
                  Most used automation templates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockTemplates.map((template, index) => (
                  <div key={template.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-wl-text">{template.name}</h4>
                        {index < 2 && (
                          <Badge variant="secondary" className="text-xs">
                            <Star className="h-3 w-3 mr-1" />
                            Popular
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-wl-muted mb-2">{template.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-wl-muted">
                        <span>{template.runs} runs</span>
                        <span>•</span>
                        <span>Avg: {template.avgTime}</span>
                      </div>
                    </div>
                    <Button size="sm" className="wl-button-primary">
                      Run
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="wl-card mt-8">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Get started with common automation tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button className="h-20 flex-col space-y-2 bg-gradient-to-br from-wl-accent to-wl-accent-2 text-white hover:from-wl-accent/90 hover:to-wl-accent-2/90">
                  <FileText className="h-6 w-6" />
                  <span>Create Content</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col space-y-2">
                  <TrendingUp className="h-6 w-6" />
                  <span>Generate Report</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col space-y-2">
                  <Zap className="h-6 w-6" />
                  <span>Run Playbook</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
