'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/page-header'
import { GPTAgentCard, mockGPTAgents } from '@/components/gpt-agent-iframe'
import { GPTAgentEditModal } from '@/components/gpt-agent-edit-modal'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sidebar } from '@/components/sidebar'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Settings,
  BarChart3,
  Users,
  Clock,
  Bot,
  Play,
  ExternalLink
} from 'lucide-react'

type ViewMode = 'grid' | 'list'
type CategoryFilter = 'all' | 'content' | 'analysis' | 'automation' | 'support'
type StatusFilter = 'all' | 'active' | 'inactive' | 'maintenance'

type GPTAgent = {
  id: string
  name: string
  description: string | null
  category: 'content' | 'analysis' | 'automation' | 'support'
  status: 'active' | 'inactive' | 'maintenance'
  iframe_url?: string
  last_used?: string
  usage_count?: number
  configuration?: {
    source?: string
    [key: string]: any
  }
  created_at: string
  updated_at: string
}

export default function GPTAgentsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)
  const [agents, setAgents] = useState<GPTAgent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingAgent, setEditingAgent] = useState<any | null>(null)
  const [currentUser, setCurrentUser] = useState<string | null>(null)

  useEffect(() => {
    fetchGPTAgents()
    fetchCurrentUser()
  }, [])

  const fetchCurrentUser = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user?.email || null)
    } catch (error) {
      console.error('Error fetching current user:', error)
    }
  }

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         agent.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || agent.category === categoryFilter
    const matchesStatus = statusFilter === 'all' || agent.status === statusFilter
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  const handleAgentUsed = (agentId: string) => {
    // Track agent usage - could send to analytics or update database
    console.log(`Agent ${agentId} was used`)
  }

  const handleAgentEdit = async (agentId: string, updatedAgent?: any) => {
    if (updatedAgent) {
      // Quick save for inline editing
      try {
        await handleSaveAgent(updatedAgent)
      } catch (error) {
        console.error('Error saving agent:', error)
      }
    } else {
      // Open edit modal
      const agent = agents.find(a => a.id === agentId)
      if (agent) {
        setEditingAgent(agent)
      }
    }
  }

  const handleSaveAgent = async (updatedAgent: any) => {
    try {
      console.log('🔄 Saving agent:', updatedAgent.id, 'with data:', updatedAgent)

      // Use direct Supabase client instead of API route
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('gpt_agent')
        .update({
          name: updatedAgent.name,
          description: updatedAgent.description,
          category: updatedAgent.category,
          status: updatedAgent.status,
          configuration: updatedAgent.configuration,
          updated_at: new Date().toISOString()
        })
        .eq('id', updatedAgent.id)
        .select()
        .single()

      if (error) {
        console.error('❌ Supabase Error:', error)
        throw new Error(`Failed to update agent: ${error.message}`)
      }

      console.log('✅ Supabase Success:', data)

      // Update the local state
      setAgents(prevAgents => 
        prevAgents.map(agent => 
          agent.id === updatedAgent.id ? { ...agent, ...data } : agent
        )
      )

      // Refresh the agents list
      await fetchGPTAgents()
      console.log('✅ Agent saved successfully and list refreshed')
    } catch (error) {
      console.error('❌ Error saving agent:', error)
      throw error
    }
  }


  const fetchGPTAgents = async () => {
    const supabase = createClient()
    
    try {
      console.log('🔍 Fetching GPT agents from database...')
      const { data, error } = await supabase
        .from('gpt_agent')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Error fetching GPT agents:', error)
        console.error('Error details:', JSON.stringify(error, null, 2))
        // Don't fall back to mock data - show error state instead
        console.log('🚫 Database error - showing error state')
        setAgents([])
        setError(`Database error: ${error.message}`)
      } else {
        console.log('✅ GPT agents data fetched successfully:', data)
        console.log(`📊 Found ${data?.length || 0} agents`)
        setAgents(data || [])
        setError(null)
      }
    } catch (error) {
      console.error('❌ Exception fetching GPT agents:', error)
      console.error('Exception details:', JSON.stringify(error, null, 2))
      // Don't fall back to mock data - show error state instead
      console.log('🚫 Exception - showing error state')
      setAgents([])
      setError(`Exception: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-wl-bg">
        <div className="flex">
          <Sidebar />
          <div className="flex-1 p-8">
            <PageHeader
              title="GPT Agents"
              description="Manage and interact with your custom AI agents"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse" />
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
            title="GPT Agents"
            description="Manage and interact with your custom AI agents"
          >
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => {
                  setLoading(true)
                  fetchGPTAgents()
                }}
                disabled={loading}
              >
                <Search className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <div className="flex items-center space-x-2 text-sm text-wl-muted">
                <Bot className="h-4 w-4" />
                <span>Add agents via <code className="bg-wl-surface px-2 py-1 rounded text-wl-accent">/gtm-intake</code> in Slack</span>
              </div>
            </div>
          </PageHeader>


          {/* Stats */}
          <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Bot className="h-8 w-8 text-wl-accent" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-wl-muted">Total Agents</p>
                    <p className="text-2xl font-bold text-wl-text">{agents.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-wl-muted">From Slack</p>
                    <p className="text-2xl font-bold text-wl-text">
                      {agents.filter(agent => agent.configuration?.source === 'slack_intake').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <BarChart3 className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-wl-muted">Active</p>
                    <p className="text-2xl font-bold text-wl-text">
                      {agents.filter(agent => agent.status === 'active').length}
                    </p>
                  </div>
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
                  placeholder="Search agents..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as CategoryFilter)}>
              <SelectTrigger className="w-48">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="content">Content</SelectItem>
                <SelectItem value="analysis">Analysis</SelectItem>
                <SelectItem value="automation">Automation</SelectItem>
                <SelectItem value="support">Support</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
              <SelectTrigger className="w-48">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex border border-gray-200 rounded-lg">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Error State */}
          {error ? (
            <div className="text-center py-12">
              <Bot className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-wl-text mb-2">Database Error</h3>
              <p className="text-wl-muted mb-4">{error}</p>
              <Button 
                className="wl-button-primary" 
                onClick={() => {
                  setError(null)
                  setLoading(true)
                  fetchGPTAgents()
                }}
              >
                <Search className="mr-2 h-4 w-4" />
                Retry
              </Button>
            </div>
          ) : filteredAgents.length === 0 ? (
            <div className="text-center py-12">
              <Bot className="h-12 w-12 text-wl-muted mx-auto mb-4" />
              <h3 className="text-lg font-medium text-wl-text mb-2">No agents found</h3>
              <p className="text-wl-muted mb-4">
                {searchQuery || categoryFilter !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'No GPT agents found. Add agents through the GTM-intake Slack command.'
                }
              </p>
              <div className="flex items-center justify-center space-x-2 text-sm text-wl-muted bg-wl-surface/50 p-4 rounded-lg">
                <Bot className="h-5 w-5 text-wl-accent" />
                <span>Use <code className="bg-wl-surface px-2 py-1 rounded text-wl-accent font-mono">/gtm-intake</code> in Slack to add GPT agents</span>
              </div>
            </div>
          ) : (
            <div className={
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
                : 'space-y-4'
            }>
              {filteredAgents.map((agent) => (
                <GPTAgentCard
                  key={agent.id}
                  agent={{
                    id: agent.id,
                    name: agent.name || 'Unnamed Agent',
                    description: agent.description || 'No description available',
                    iframeUrl: agent.iframe_url || '',
                    category: agent.category || 'support',
                    status: agent.status || 'active',
                    lastUsed: agent.last_used,
                    usageCount: agent.usage_count || 0
                  }}
                  databaseAgent={agent}
                  currentUser={currentUser}
                  onAgentUsed={handleAgentUsed}
                  onAgentEdited={handleAgentEdit}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <GPTAgentEditModal
        isOpen={!!editingAgent}
        onClose={() => setEditingAgent(null)}
        agent={editingAgent}
        onSave={handleSaveAgent}
      />
    </div>
  )
}
