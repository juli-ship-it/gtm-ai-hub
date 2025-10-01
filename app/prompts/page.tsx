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
  Plus, 
  Copy,
  Edit,
  MessageSquare,
  Tag,
  Clock,
  User
} from 'lucide-react'

// Mock data
const mockPrompts = [
  {
    id: '1',
    name: 'Content Writer',
    role: 'writer',
    body: 'You are a skilled content writer specializing in {brand_voice} content for {persona}. Create engaging, informative content that resonates with {audience} and drives {goal}. Always include a clear call-to-action: {cta}.',
    version: 'v1.0',
    tags: ['content', 'writing', 'marketing'],
    createdBy: 'Juliana Reyes',
    createdAt: '2024-01-10T10:30:00Z',
    usage: 45
  },
  {
    id: '2',
    name: 'Content Editor',
    role: 'editor',
    body: 'You are an expert content editor with a focus on {brand_voice} tone. Review and refine content for {persona} to ensure it is clear, compelling, and aligned with our brand guidelines. Pay special attention to grammar, flow, and the call-to-action: {cta}.',
    version: 'v1.0',
    tags: ['editing', 'review', 'quality'],
    createdBy: 'Juliana Reyes',
    createdAt: '2024-01-10T11:15:00Z',
    usage: 32
  },
  {
    id: '3',
    name: 'Compliance Checker',
    role: 'compliance',
    body: 'You are a compliance specialist ensuring all content meets legal and regulatory requirements. Review content for {persona} to ensure it complies with industry standards, data protection regulations, and brand guidelines. Flag any potential issues with {cta} or claims.',
    version: 'v1.0',
    tags: ['compliance', 'legal', 'review'],
    createdBy: 'Juliana Reyes',
    createdAt: '2024-01-10T12:00:00Z',
    usage: 28
  },
  {
    id: '4',
    name: 'SEO Researcher',
    role: 'seo_researcher',
    body: 'You are an SEO expert who researches and identifies high-value keywords and content opportunities. Analyze {target_keywords} and {competitor_content} to provide strategic recommendations for {content_type} that will rank well for {persona} searches.',
    version: 'v1.1',
    tags: ['seo', 'research', 'keywords'],
    createdBy: 'Juliana Reyes',
    createdAt: '2024-01-12T14:20:00Z',
    usage: 67
  },
  {
    id: '5',
    name: 'Email Subject Line Generator',
    role: 'writer',
    body: 'You are a specialist in crafting compelling email subject lines that drive opens and clicks. Create {subject_count} subject line variations for {email_type} targeting {persona}. Focus on {key_benefit} and use {tone} tone. Avoid spam triggers.',
    version: 'v2.0',
    tags: ['email', 'subject-lines', 'conversion'],
    createdBy: 'Juliana Reyes',
    createdAt: '2024-01-14T09:45:00Z',
    usage: 89
  }
]

const roleColors = {
  writer: 'bg-blue-100 text-blue-800',
  editor: 'bg-green-100 text-green-800',
  classifier: 'bg-purple-100 text-purple-800',
  seo_researcher: 'bg-orange-100 text-orange-800',
  compliance: 'bg-red-100 text-red-800'
}

export default function PromptsPage() {
  return (
    <div className="min-h-screen bg-wl-bg">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-8">
          <PageHeader
            title="Prompt Library"
            description="Manage and version your AI prompts for consistent, high-quality outputs."
          >
            <Button className="wl-button-primary">
              <Plus className="mr-2 h-4 w-4" />
              New Prompt
            </Button>
          </PageHeader>

          {/* Filters */}
          <div className="mb-8 flex flex-col sm:flex-row gap-4">
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {mockPrompts.map((prompt) => (
              <Card key={prompt.id} className="wl-card-hover group">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-wl-accent/10 rounded-xl">
                        <MessageSquare className="h-6 w-6 text-wl-accent" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{prompt.name}</CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={roleColors[prompt.role as keyof typeof roleColors]}>
                            {prompt.role.replace('_', ' ')}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {prompt.version}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button variant="ghost" size="sm">
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Prompt Body */}
                  <div>
                    <h4 className="font-medium text-wl-text mb-2">Prompt</h4>
                    <div className="bg-gray-50 rounded-lg p-3 text-sm text-wl-muted font-mono">
                      {prompt.body.length > 200 
                        ? `${prompt.body.substring(0, 200)}...` 
                        : prompt.body
                      }
                    </div>
                  </div>
                  
                  {/* Tags */}
                  <div>
                    <h4 className="font-medium text-wl-text mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {prompt.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-wl-text">{prompt.usage}</p>
                      <p className="text-xs text-wl-muted">Times Used</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-wl-text">
                        {new Date(prompt.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-wl-muted">Created</p>
                    </div>
                  </div>
                  
                  {/* Metadata */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-sm text-wl-muted">
                    <div className="flex items-center space-x-1">
                      <User className="h-4 w-4" />
                      <span>{prompt.createdBy}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>Updated 2 days ago</span>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <Button variant="ghost" size="sm">
                      View Full Prompt
                    </Button>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Copy className="mr-2 h-4 w-4" />
                        Copy
                      </Button>
                      <Button size="sm" className="wl-button-primary">
                        Use Prompt
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
