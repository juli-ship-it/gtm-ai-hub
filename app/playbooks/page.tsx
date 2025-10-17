import { PageHeader } from '@/components/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sidebar } from '@/components/sidebar'
import {
  Search,
  Filter,
  Play,
  Clock,
  Users,
  Target,
  ArrowRight,
  BookOpen,
  Zap
} from 'lucide-react'

// Mock data
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

export default function PlaybooksPage() {
  return (
    <div className="min-h-screen bg-wl-bg">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-8">
          <PageHeader
            title="Playbook Catalog"
            description="Create and manage multi-step automation workflows with human checkpoints."
          >
            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                Coming Soon
              </Badge>
              <Button className="wl-button-primary" disabled>
                <BookOpen className="mr-2 h-4 w-4" />
                Create Playbook
              </Button>
            </div>
          </PageHeader>

          {/* Filters */}
          <div className="mb-8 flex flex-col sm:flex-row gap-4">
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
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="sales">Sales</SelectItem>
                <SelectItem value="reporting">Reporting</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Playbooks Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {mockPlaybooks.map((playbook) => (
              <Card key={playbook.id} className="wl-card-hover group">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-wl-accent/10 rounded-xl">
                        <BookOpen className="h-6 w-6 text-wl-accent" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{playbook.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {playbook.description}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {playbook.runs} runs
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Templates Included */}
                  <div>
                    <h4 className="font-medium text-wl-text mb-2">Templates Included</h4>
                    <div className="flex flex-wrap gap-2">
                      {playbook.templatesIncluded.map((template, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          <Zap className="h-3 w-3 mr-1" />
                          {template}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Human Steps */}
                  <div>
                    <h4 className="font-medium text-wl-text mb-2">Human Checkpoints</h4>
                    <div className="flex items-center space-x-2 text-sm text-wl-muted">
                      <Users className="h-4 w-4" />
                      <span>{playbook.humanSteps} manual steps</span>
                      <span>•</span>
                      <Clock className="h-4 w-4" />
                      <span>{playbook.estimatedTime}</span>
                    </div>
                  </div>

                  {/* KPIs */}
                  <div>
                    <h4 className="font-medium text-wl-text mb-2">Key Metrics</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {Object.entries(playbook.kpis).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                          <span className="text-wl-muted capitalize">
                            {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                          </span>
                          <span className="font-medium text-wl-text">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-wl-text">{playbook.runs}</p>
                      <p className="text-xs text-wl-muted">Total Runs</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-wl-text">{playbook.successRate}%</p>
                      <p className="text-xs text-wl-muted">Success Rate</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-wl-text">
                        {new Date(playbook.lastRun).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-wl-muted">Last Run</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center text-sm text-wl-muted">
                      <Target className="h-4 w-4 mr-1" />
                      <span>Ready to run</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        View Details
                      </Button>
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
      </div>
    </div>
  )
}
