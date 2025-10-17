'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  X,
  Send,
  AlertCircle,
  CheckCircle,
  MessageSquare,
  Star,
  Zap,
  FileText,
  Users,
  BarChart3,
  Target
} from 'lucide-react'

interface IntakeFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (intakeId: string) => void
  userId?: string
}

const categoryIcons = {
  mkt_campaign_execution: Target,
  mkt_content_creation: FileText,
  mkt_lead_nurturing: Users,
  mkt_reporting_analytics: BarChart3,
  mkt_other: Zap
}

const requestTypeInfo = {
  real: {
    label: 'Request',
    description: 'Submit an actual automation request for your team',
    icon: MessageSquare,
    color: 'bg-blue-100 text-blue-800',
    badgeColor: 'bg-blue-100 text-blue-800'
  },
  showcase: {
    label: 'Showcase Example',
    description: 'Create a demo example to showcase the intake system',
    icon: Star,
    color: 'bg-purple-100 text-purple-800',
    badgeColor: 'bg-purple-100 text-purple-800'
  }
}

export function IntakeForm({ isOpen, onClose, onSuccess, userId }: IntakeFormProps) {
  const [formData, setFormData] = useState({
    request_type: 'real' as 'real' | 'showcase',
    title: '',
    problem_statement: '',
    automation_idea: '',
    category: 'mkt_other' as 'mkt_campaign_execution' | 'mkt_content_creation' | 'mkt_lead_nurturing' | 'mkt_reporting_analytics' | 'mkt_other',
    current_process: '',
    pain_points: '',
    frequency: 'adhoc' as 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'adhoc',
    time_friendly: '',
    systems: [] as string[],
    sensitivity: 'low' as 'low' | 'med' | 'high' | 'confidential',
    links: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    ethics_considerations: ''
  })

  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSystemToggle = (system: string) => {
    setFormData(prev => ({
      ...prev,
      systems: prev.systems.includes(system)
        ? prev.systems.filter(s => s !== system)
        : [...prev.systems, system]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/intake', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          user_id: userId
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create intake request')
      }

      setSubmitted(true)
      if (onSuccess) {
        onSuccess(result.intake_request_id)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      request_type: 'real',
      title: '',
      problem_statement: '',
      automation_idea: '',
      category: 'mkt_other',
      current_process: '',
      pain_points: '',
      frequency: 'adhoc',
      time_friendly: '',
      systems: [],
      sensitivity: 'low',
      links: '',
      priority: 'medium',
      ethics_considerations: ''
    })
    setSubmitted(false)
    setError('')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  if (!isOpen) return null

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-wl-text mb-2">Request Submitted!</h3>
            <p className="text-wl-muted mb-6">
              Your {formData.request_type === 'real' ? 'intake request' : 'showcase example'} has been created successfully.
            </p>
            <div className="space-y-3">
              <Button onClick={handleClose} className="w-full">
                Close
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  resetForm()
                  setSubmitted(false)
                }}
                className="w-full"
              >
                Submit Another
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const RequestTypeIcon = requestTypeInfo[formData.request_type].icon
  const CategoryIcon = categoryIcons[formData.request_type === 'showcase' ? 'other' : formData.category]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <Card className="w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <RequestTypeIcon className="h-5 w-5" />
              <span>New Intake Request</span>
            </CardTitle>
            <CardDescription>
              {requestTypeInfo[formData.request_type].description}
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Request Type Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-wl-text">Request Type *</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(requestTypeInfo).map(([key, info]) => {
                  const Icon = info.icon
                  const isSelected = formData.request_type === key
                  return (
                    <div
                      key={key}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        isSelected
                          ? 'border-wl-accent bg-wl-accent/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleInputChange('request_type', key)}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className={`h-5 w-5 ${isSelected ? 'text-wl-accent' : 'text-gray-400'}`} />
                        <div>
                          <p className={`font-medium ${isSelected ? 'text-wl-accent' : 'text-wl-text'}`}>
                            {info.label}
                          </p>
                          <p className="text-sm text-wl-muted">{info.description}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-wl-text mb-2 block">Title *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Brief title for your request"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-wl-text mb-2 block">Category *</label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <div className="flex items-center space-x-2">
                      <CategoryIcon className="h-4 w-4" />
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mkt_campaign_execution">Campaign Execution</SelectItem>
                    <SelectItem value="mkt_content_creation">Content Creation</SelectItem>
                    <SelectItem value="mkt_lead_nurturing">Lead Management</SelectItem>
                    <SelectItem value="mkt_reporting_analytics">Reporting</SelectItem>
                    <SelectItem value="mkt_other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Problem Statement */}
            <div>
              <label className="text-sm font-medium text-wl-text mb-2 block">Problem Statement *</label>
              <Textarea
                value={formData.problem_statement}
                onChange={(e) => handleInputChange('problem_statement', e.target.value)}
                placeholder="Describe the problem or job-to-be-done. What specific challenge are you trying to solve?"
                rows={4}
                required
              />
            </div>

            {/* Automation Idea */}
            <div>
              <label className="text-sm font-medium text-wl-text mb-2 block">Automation Idea *</label>
              <Textarea
                value={formData.automation_idea}
                onChange={(e) => handleInputChange('automation_idea', e.target.value)}
                placeholder="Describe your proposed automation solution. How would you like to automate this process?"
                rows={4}
                required
              />
            </div>

            {/* Current Process */}
            <div>
              <label className="text-sm font-medium text-wl-text mb-2 block">Current Process</label>
              <Textarea
                value={formData.current_process}
                onChange={(e) => handleInputChange('current_process', e.target.value)}
                placeholder="Describe how this process is currently handled manually"
                rows={3}
              />
            </div>

            {/* Pain Points */}
            <div>
              <label className="text-sm font-medium text-wl-text mb-2 block">Pain Points</label>
              <Textarea
                value={formData.pain_points}
                onChange={(e) => handleInputChange('pain_points', e.target.value)}
                placeholder="What specific pain points or challenges do you face with the current process?"
                rows={3}
              />
            </div>

            {/* Additional Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="text-sm font-medium text-wl-text mb-2 block">Frequency</label>
                <Select value={formData.frequency} onValueChange={(value) => handleInputChange('frequency', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="adhoc">Ad Hoc</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-wl-text mb-2 block">Time Estimate</label>
                <Input
                  value={formData.time_friendly}
                  onChange={(e) => handleInputChange('time_friendly', e.target.value)}
                  placeholder="e.g., 2 hours per week"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-wl-text mb-2 block">Priority</label>
                <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Systems Used */}
            <div>
              <label className="text-sm font-medium text-wl-text mb-2 block">Systems Used</label>
              <div className="flex flex-wrap gap-2">
                {['hubspot', 'salesforce', 'slack', 'google_analytics', 'zapier', 'notion', 'jira', 'confluence'].map(system => (
                  <button
                    key={system}
                    type="button"
                    onClick={() => handleSystemToggle(system)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      formData.systems.includes(system)
                        ? 'bg-wl-accent text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {system}
                  </button>
                ))}
              </div>
            </div>

            {/* Data Sensitivity */}
            <div>
              <label className="text-sm font-medium text-wl-text mb-2 block">Data Sensitivity</label>
              <Select value={formData.sensitivity} onValueChange={(value) => handleInputChange('sensitivity', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low - Public data</SelectItem>
                  <SelectItem value="med">Medium - Internal data</SelectItem>
                  <SelectItem value="high">High - Sensitive data</SelectItem>
                  <SelectItem value="confidential">Confidential - Restricted data</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Links */}
            <div>
              <label className="text-sm font-medium text-wl-text mb-2 block">Related Links</label>
              <Textarea
                value={formData.links}
                onChange={(e) => handleInputChange('links', e.target.value)}
                placeholder="Any relevant links, documentation, or examples"
                rows={2}
              />
            </div>

            {/* Ethics Considerations */}
            <div>
              <label className="text-sm font-medium text-wl-text mb-2 block">Ethics Considerations</label>
              <Textarea
                value={formData.ethics_considerations}
                onChange={(e) => handleInputChange('ethics_considerations', e.target.value)}
                placeholder="Any ethical considerations, bias concerns, or compliance requirements"
                rows={3}
              />
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Create {formData.request_type === 'real' ? 'Request' : 'Showcase'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
