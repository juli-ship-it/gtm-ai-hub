'use client'

import { GPTAgentCard, mockGPTAgents } from '@/components/gpt-agent-iframe'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Bot, ExternalLink, ArrowRight } from 'lucide-react'

export function GPTAgentsDemo() {
  const handleAgentUsed = (agentId: string) => {
    console.log(`Agent ${agentId} was used`)
    // In a real implementation, you would track this usage
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Bot className="h-8 w-8 text-wl-accent" />
          <h2 className="text-2xl font-bold text-wl-text">GPT Agents</h2>
        </div>
        <p className="text-wl-muted max-w-2xl mx-auto">
          Access your custom AI agents directly from your GTM Hub. Click any agent to open it in a new tab where you can use your ChatGPT account.
        </p>
      </div>

      {/* How it works */}
      <Card className="wl-card">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-wl-text mb-4">How it works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-wl-accent/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-wl-accent font-bold">1</span>
              </div>
              <h4 className="font-medium text-wl-text mb-2">Browse Agents</h4>
              <p className="text-sm text-wl-muted">See all available GPT Agents organized by category</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-wl-accent/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-wl-accent font-bold">2</span>
              </div>
              <h4 className="font-medium text-wl-text mb-2">Click to Open</h4>
              <p className="text-sm text-wl-muted">Click "Open GPT Agent" to launch in a new tab</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-wl-accent/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-wl-accent font-bold">3</span>
              </div>
              <h4 className="font-medium text-wl-text mb-2">Use ChatGPT</h4>
              <p className="text-sm text-wl-muted">Sign in to your ChatGPT account and start using the agent</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Sample Agents */}
      <div>
        <h3 className="text-lg font-semibold text-wl-text mb-4">Available Agents</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockGPTAgents.slice(0, 3).map((agent) => (
            <GPTAgentCard
              key={agent.id}
              agent={agent}
              onAgentUsed={handleAgentUsed}
            />
          ))}
        </div>
      </div>

      {/* CTA */}
      <Card className="wl-card bg-gradient-to-r from-wl-accent/5 to-wl-accent/10">
        <div className="p-6 text-center">
          <h3 className="text-lg font-semibold text-wl-text mb-2">Ready to get started?</h3>
          <p className="text-wl-muted mb-4">
            Add your own GPT Agents and start using them with your team
          </p>
          <Button className="group">
            <ExternalLink className="mr-2 h-4 w-4" />
            Go to GPT Agents
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </Card>
    </div>
  )
}

