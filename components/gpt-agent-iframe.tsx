'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, Settings, Play, Bot, Users, Clock, BarChart3, User, Sparkles } from 'lucide-react'
import { useGPTAgentInfo } from '@/hooks/useGPTAgentInfo'

interface GPTAgent {
  id: string
  name: string
  description: string
  iframeUrl: string
  category: 'content' | 'analysis' | 'automation' | 'support'
  status: 'active' | 'inactive' | 'maintenance'
  lastUsed?: string
  usageCount?: number
}

interface GPTAgentCardProps {
  agent: GPTAgent
  className?: string
  showControls?: boolean
  onAgentUsed?: (agentId: string) => void
}

export function GPTAgentCard({
  agent,
  className = '',
  showControls = true,
  onAgentUsed
}: GPTAgentCardProps) {
  const { agentInfo, loading: infoLoading } = useGPTAgentInfo(agent.iframeUrl)
  
  const handleOpenAgent = () => {
    // Open GPT Agent in new tab/window
    window.open(agent.iframeUrl, '_blank', 'noopener,noreferrer')
    onAgentUsed?.(agent.id)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'maintenance': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'content': return 'bg-blue-100 text-blue-800'
      case 'analysis': return 'bg-purple-100 text-purple-800'
      case 'automation': return 'bg-orange-100 text-orange-800'
      case 'support': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'content': return '📝'
      case 'analysis': return '📊'
      case 'automation': return '⚙️'
      case 'support': return '🤝'
      default: return '🤖'
    }
  }

  return (
    <Card className={`wl-card-hover group ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-wl-accent/10 rounded-xl">
              <Bot className="h-6 w-6 text-wl-accent" />
            </div>
                        <div>
                          <CardTitle className="text-lg">{agentInfo?.name || agent.name}</CardTitle>
                          <div className="flex items-center space-x-2 mt-1">
                <Badge variant="outline" className={getStatusColor(agent.status)}>
                  {agent.status}
                </Badge>
                <Badge variant="outline" className={getCategoryColor(agentInfo?.category || agent.category)}>
                  {getCategoryIcon(agentInfo?.category || agent.category)} {agentInfo?.category || agent.category}
                </Badge>
              </div>
            </div>
          </div>
          {showControls && (
            <Button variant="ghost" size="sm" onClick={handleOpenAgent}>
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      
          <CardContent className="space-y-4">
            {/* Rich Description */}
            <div className="space-y-2">
              <CardDescription className="text-sm">
                {agentInfo?.description || agent.description}
              </CardDescription>
              
              {/* Creator Info */}
              {agentInfo?.creator && (
                <div className="flex items-center text-xs text-wl-muted">
                  <User className="h-3 w-3 mr-1" />
                  <span>Created by {agentInfo.creator}</span>
                </div>
              )}
            </div>

            {/* Capabilities */}
            {agentInfo?.capabilities && agentInfo.capabilities.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center text-xs font-medium text-wl-muted">
                  <Sparkles className="h-3 w-3 mr-1" />
                  <span>Capabilities</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {agentInfo.capabilities.slice(0, 2).map((capability, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {capability}
                    </Badge>
                  ))}
                  {agentInfo.capabilities.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{agentInfo.capabilities.length - 2} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Usage Stats */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-wl-muted">Usage</p>
                <p className="font-semibold text-wl-text">{agent.usageCount || 0} times</p>
              </div>
              <div>
                <p className="text-wl-muted">Last Used</p>
                <p className="font-semibold text-wl-text">
                  {agent.lastUsed 
                    ? new Date(agent.lastUsed).toLocaleDateString()
                    : 'Never'
                  }
                </p>
              </div>
            </div>
        
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center text-sm text-wl-muted">
            <Clock className="h-4 w-4 mr-1" />
            <span>Opens in new tab</span>
          </div>
          <Button 
            size="sm" 
            className="wl-button-primary group-hover:shadow-lg transition-all duration-200"
            onClick={handleOpenAgent}
          >
            <Play className="mr-2 h-4 w-4" />
            Open GPT Agent
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Sample GPT Agents - users access these through their own ChatGPT accounts
export const mockGPTAgents: GPTAgent[] = [
  {
    id: '1',
    name: 'Workleap Content Assistant',
    description: 'Specialized content creation and strategy for Workleap products and GTM campaigns',
    iframeUrl: 'https://chatgpt.com/g/g-3TfXg9het-workleap-content-assistant',
    category: 'content',
    status: 'active',
    lastUsed: '2024-01-15T10:30:00Z',
    usageCount: 45
  },
  {
    id: '2',
    name: 'GTM Strategy Analyst',
    description: 'Analyzes market trends, competitor data, and provides strategic GTM insights',
    iframeUrl: 'https://chatgpt.com/g/g-gtm-strategy-analyst',
    category: 'analysis',
    status: 'active',
    lastUsed: '2024-01-14T15:45:00Z',
    usageCount: 23
  },
  {
    id: '3',
    name: 'Campaign Automation Expert',
    description: 'Helps automate marketing campaign setup, optimization, and workflow management',
    iframeUrl: 'https://chatgpt.com/g/g-campaign-automation-expert',
    category: 'automation',
    status: 'active',
    lastUsed: '2024-01-12T09:15:00Z',
    usageCount: 67
  },
  {
    id: '4',
    name: 'Customer Success Helper',
    description: 'Provides intelligent customer support, FAQ assistance, and success guidance',
    iframeUrl: 'https://chatgpt.com/g/g-customer-success-helper',
    category: 'support',
    status: 'active',
    lastUsed: '2024-01-15T14:20:00Z',
    usageCount: 89
  },
  {
    id: '5',
    name: 'HR Process Optimizer',
    description: 'Specializes in HR process improvement, compliance, and workflow optimization',
    iframeUrl: 'https://chatgpt.com/g/g-hr-process-optimizer',
    category: 'automation',
    status: 'active',
    lastUsed: '2024-01-13T11:30:00Z',
    usageCount: 34
  },
  {
    id: '6',
    name: 'Data Analysis Assistant',
    description: 'Helps analyze business metrics, create reports, and derive actionable insights',
    iframeUrl: 'https://chatgpt.com/g/g-data-analysis-assistant',
    category: 'analysis',
    status: 'active',
    lastUsed: '2024-01-14T16:20:00Z',
    usageCount: 56
  }
]
