'use client'

import { useEffect, useState } from 'react'
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
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'

type TemplateRun = Database['public']['Tables']['template_run']['Row'] & {
  template?: Database['public']['Tables']['template']['Row']
  triggered_by_user?: Database['public']['Tables']['app_user']['Row']
}

export default function RunsPage() {
  const [runs, setRuns] = useState<TemplateRun[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    const fetchRuns = async () => {
      const supabase = createClient()
      
      try {
        const { data, error } = await supabase
          .from('template_run')
          .select(`
            *,
            template:template_id (
              name,
              category
            ),
            triggered_by_user:triggered_by (
              email
            )
          `)
          .order('started_at', { ascending: false })

        if (error) throw error

        setRuns(data || [])
      } catch (error) {
        console.error('Error fetching runs:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRuns()
  }, [])

  const filteredRuns = runs.filter(run => {
    const matchesSearch = 
      run.template?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      run.triggered_by_user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || run.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const formatDuration = (startedAt: string, finishedAt: string | null) => {
    if (!finishedAt) return 'Running...'
    
    const start = new Date(startedAt)
    const end = new Date(finishedAt)
    const diffMs = end.getTime() - start.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffSecs = Math.floor((diffMs % 60000) / 1000)
    
    return `${diffMins}m ${diffSecs}s`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-wl-bg">
        <div className="flex">
          <Sidebar />
          <div className="flex-1 p-8">
            <PageHeader
              title="Run History"
              description="Track and monitor all your automation runs, their status, and artifacts."
            />
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
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
            title="Run History"
            description="Track and monitor all your automation runs, their status, and artifacts."
          >
            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                Coming Soon
              </Badge>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
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
                <SelectItem value="succeeded">Succeeded</SelectItem>
                <SelectItem value="running">Running</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="queued">Queued</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Runs Table */}
          {filteredRuns.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-wl-muted mx-auto mb-4" />
              <h3 className="text-lg font-medium text-wl-text mb-2">No runs found</h3>
              <p className="text-wl-muted mb-4">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Get started by running a template from the Templates page.'
                }
              </p>
              <Button className="wl-button-primary" onClick={() => window.location.href = '/templates'}>
                <FileText className="mr-2 h-4 w-4" />
                Browse Templates
              </Button>
            </div>
          ) : (
            <Card className="wl-card">
              <CardHeader>
                <CardTitle>Recent Runs</CardTitle>
                <CardDescription>
                  {filteredRuns.length} runs found
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredRuns.map((run) => (
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
                              {run.template?.name || 'Unknown Template'}
                            </h4>
                            <StatusBadge status={run.status} />
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-wl-muted">
                            <div className="flex items-center space-x-1">
                              <User className="h-4 w-4" />
                              <span>{run.triggered_by_user?.email || 'Unknown User'}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>
                                {new Date(run.started_at).toLocaleString()}
                              </span>
                            </div>
                            <span>•</span>
                            <span>{formatDuration(run.started_at, run.finished_at)}</span>
                          </div>
                          
                          {run.error_message && (
                            <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded-lg">
                              {run.error_message}
                            </div>
                          )}
                          
                          {run.artifacts && (
                            <div className="mt-2 flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs">
                                {Object.keys(run.artifacts as object).length} artifacts
                              </Badge>
                              {run.artifacts && typeof run.artifacts === 'object' && 'blog_post_id' in run.artifacts && (
                                <Badge variant="outline" className="text-xs">
                                  Blog Post
                                </Badge>
                              )}
                              {run.artifacts && typeof run.artifacts === 'object' && 'report_url' in run.artifacts && (
                                <Badge variant="outline" className="text-xs">
                                  Report
                                </Badge>
                              )}
                              {run.artifacts && typeof run.artifacts === 'object' && 'campaign_id' in run.artifacts && (
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
          )}
        </div>
      </div>
    </div>
  )
}
