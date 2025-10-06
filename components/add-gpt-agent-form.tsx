'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Plus, Link, CheckCircle } from 'lucide-react'

interface GPTAgentFormData {
  name: string
  description: string
  iframeUrl: string
  category: 'content' | 'analysis' | 'automation' | 'support'
}

interface AddGPTAgentFormProps {
  onAgentAdded?: (agent: GPTAgentFormData) => void
  className?: string
}

export function AddGPTAgentForm({ onAgentAdded, className = '' }: AddGPTAgentFormProps) {
  const [formData, setFormData] = useState<GPTAgentFormData>({
    name: '',
    description: '',
    iframeUrl: '',
    category: 'content'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // In a real implementation, you would save to database here
      // For now, we'll just call the callback
      onAgentAdded?.(formData)
      
      setShowSuccess(true)
      setFormData({
        name: '',
        description: '',
        iframeUrl: '',
        category: 'content'
      })
      
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (error) {
      console.error('Error adding GPT Agent:', error)
    } finally {
      setIsSubmitting(false)
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

  if (showSuccess) {
    return (
      <Card className={`wl-card ${className}`}>
        <div className="p-6 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-wl-text mb-2">GPT Agent Added!</h3>
          <p className="text-wl-muted">Your GPT Agent has been successfully added to the system.</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className={`wl-card ${className}`}>
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-6">
          <div className="p-2 bg-wl-accent/10 rounded-xl">
            <Plus className="h-5 w-5 text-wl-accent" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-wl-text">Add GPT Agent</h3>
            <p className="text-sm text-wl-muted">Add a new GPT Agent to your collection</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-wl-text mb-2">
              Agent Name
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Workleap Content Assistant"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-wl-text mb-2">
              Description
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what this agent does and how it helps your team..."
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-wl-text mb-2">
              GPT Agent URL
            </label>
            <div className="relative">
              <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-wl-muted" />
              <Input
                value={formData.iframeUrl}
                onChange={(e) => setFormData({ ...formData, iframeUrl: e.target.value })}
                placeholder="https://chatgpt.com/g/g-your-agent-id"
                className="pl-10"
                required
              />
            </div>
            <p className="text-xs text-wl-muted mt-1">
              Get this URL from your GPT Agent's share settings in ChatGPT
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-wl-text mb-2">
              Category
            </label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value as any })}
            >
              <option value="content">Content</option>
              <option value="analysis">Analysis</option>
              <option value="automation">Automation</option>
              <option value="support">Support</option>
            </Select>
          </div>

          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-wl-muted">Category:</span>
              <Badge className={getCategoryColor(formData.category)}>
                {formData.category}
              </Badge>
            </div>
            
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Agent
                </>
              )}
            </Button>
          </div>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">How to get your GPT Agent URL:</h4>
          <ol className="text-sm text-blue-800 space-y-1">
            <li>1. Go to ChatGPT and open your GPT Agent</li>
            <li>2. Click the share button (usually in the top right)</li>
            <li>3. Copy the "Share link" URL</li>
            <li>4. Paste it in the URL field above</li>
          </ol>
        </div>
      </div>
    </Card>
  )
}
