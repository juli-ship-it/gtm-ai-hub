'use client'

import { useEffect, useState } from 'react'
import { KPIStat } from '@/components/kpi-stat'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Play, 
  FileText, 
  Clock, 
  TrendingUp, 
  Zap,
  ArrowRight,
  Star
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'

type Template = Database['public']['Tables']['template']['Row']
type TemplateRun = Database['public']['Tables']['template_run']['Row']

export default function DashboardPage() {
  const [stats, setStats] = useState({
    runsToday: 0,
    timeSaved: 0,
    successRate: 0,
    activeTemplates: 0
  })
  const [recentRuns, setRecentRuns] = useState<TemplateRun[]>([])
  const [popularTemplates, setPopularTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      const supabase = createClient()
      
      try {
        // Get today's runs
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)

        const { data: runsToday, error: runsTodayError } = await supabase
          .from('template_run')
          .select('*')
          .gte('started_at', today.toISOString())
          .lt('started_at', tomorrow.toISOString())

        if (runsTodayError) throw runsTodayError

        // Get all runs for success rate calculation
        const { data: allRuns, error: allRunsError } = await supabase
          .from('template_run')
          .select('status, started_at, finished_at')

        if (allRunsError) throw allRunsError

        // Get recent runs (last 5)
        const { data: recentRunsData, error: recentRunsError } = await supabase
          .from('template_run')
          .select(`
            *,
            template:template_id (
              name
            )
          `)
          .order('started_at', { ascending: false })
          .limit(5)

        if (recentRunsError) throw recentRunsError

        // Get popular templates (most runs)
        const { data: templatesData, error: templatesError } = await supabase
          .from('template')
          .select(`
            *,
            template_runs:template_run(count)
          `)
          .eq('enabled', true)
          .order('created_at', { ascending: false })
          .limit(3)

        if (templatesError) throw templatesError

        // Calculate stats
        const runsTodayCount = runsToday?.length || 0
        const totalRuns = allRuns?.length || 0
        const successfulRuns = allRuns?.filter((run: any) => run.status === 'succeeded').length || 0
        const successRate = totalRuns > 0 ? Math.round((successfulRuns / totalRuns) * 100) : 0
        
        // Calculate time saved (rough estimate: 2 hours per successful run)
        const timeSaved = successfulRuns * 2

        setStats({
          runsToday: runsTodayCount,
          timeSaved,
          successRate,
          activeTemplates: templatesData?.length || 0
        })

        setRecentRuns(recentRunsData || [])
        setPopularTemplates(templatesData || [])
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

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
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-64 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-64 bg-gray-200 rounded-lg animate-pulse" />
        </div>
      </div>
    )
  }
  return (
    <>
      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPIStat
          title="Runs Today"
          value={stats.runsToday}
          change={{ value: '+3', type: 'increase' }}
          icon={Play}
          description="vs yesterday"
        />
        <KPIStat
          title="Hours Saved"
          value={stats.timeSaved}
          change={{ value: '+8', type: 'increase' }}
          icon={Clock}
          description="this week"
        />
        <KPIStat
          title="Success Rate"
          value={`${stats.successRate}%`}
          change={{ value: '+2%', type: 'increase' }}
          icon={TrendingUp}
          description="last 7 days"
        />
        <KPIStat
          title="Active Templates"
          value={stats.activeTemplates}
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
              <Button variant="ghost" size="sm" onClick={() => window.location.href = '/runs'}>
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardTitle>
            <CardDescription>
              Latest automation runs and their status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentRuns.length === 0 ? (
              <div className="text-center py-8 text-wl-muted">
                No runs yet. <Button variant="link" onClick={() => window.location.href = '/templates'}>Start with a template</Button>
              </div>
            ) : (
              recentRuns.map((run) => (
                <div key={run.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex-1">
                    <h4 className="font-medium text-wl-text">
                      {(run as any).template?.name || 'Unknown Template'}
                    </h4>
                    <p className="text-sm text-wl-muted">
                      Started {new Date(run.started_at).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge 
                      variant={run.status === 'succeeded' ? 'success' : run.status === 'running' ? 'warning' : 'destructive'}
                    >
                      {run.status}
                    </Badge>
                    <span className="text-sm text-wl-muted">
                      {formatDuration(run.started_at, run.finished_at)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Popular Templates */}
        <Card className="wl-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Popular Templates
              <Button variant="ghost" size="sm" onClick={() => window.location.href = '/templates'}>
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardTitle>
            <CardDescription>
              Most used automation templates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {popularTemplates.length === 0 ? (
              <div className="text-center py-8 text-wl-muted">
                No templates available. <Button variant="link" onClick={() => window.location.href = '/templates'}>Create one</Button>
              </div>
            ) : (
              popularTemplates.map((template, index) => (
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
                      <span>Category: {template.category}</span>
                      <span>•</span>
                      <span>Version: {template.version}</span>
                    </div>
                  </div>
                  <Button size="sm" className="wl-button-primary">
                    Run
                  </Button>
                </div>
              ))
            )}
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
    </>
  )
}
