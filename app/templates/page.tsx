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
  Star,
  FileText,
  BarChart3,
  ClipboardList,
  Shield
} from 'lucide-react'

// Mock data
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
  return (
    <div className="min-h-screen bg-wl-bg">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-8">
          <PageHeader
            title="Template Catalog"
            description="Discover and run AI-powered automation templates for your GTM workflows."
          >
            <Button className="wl-button-primary">
              <FileText className="mr-2 h-4 w-4" />
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
      </div>
    </div>
  )
}
