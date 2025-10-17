'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/page-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Send, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function HRIntakePage() {
  const [formData, setFormData] = useState({
    jtbd: '',
    desired_module: '',
    notes: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    setSubmitted(true)
    setFormData({ jtbd: '', desired_module: '', notes: '' })
    setSubmitting(false)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (submitted) {
    return (
      <div className="space-y-8">
        <div className="flex items-center space-x-4">
          <Link href="/app/hr-university">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to HR University
            </Button>
          </Link>
        </div>

        <PageHeader
          title="Request Submitted"
          subtitle="Thank you for your input! We'll review your request and get back to you."
        />

        <Card className="p-12 text-center">
          <div className="space-y-4">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
            <h3 className="text-2xl font-semibold text-gray-900">Request Submitted Successfully!</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Your module request has been received and will be reviewed by our team.
              We'll notify you when we start working on it or if we need more information.
            </p>
            <div className="flex space-x-4 justify-center">
              <Link href="/app/hr-university">
                <Button>Back to HR University</Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => setSubmitted(false)}
              >
                Submit Another Request
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-4">
        <Link href="/app/hr-university">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to HR University
          </Button>
        </Link>
      </div>

      <PageHeader
        title="Request New Module"
        subtitle="Help us expand the HR University curriculum by suggesting new modules"
      />

      <div className="max-w-2xl mx-auto">
        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What are you trying to accomplish? *
              </label>
              <Textarea
                value={formData.jtbd}
                onChange={(e) => handleInputChange('jtbd', e.target.value)}
                placeholder="Describe the job-to-be-done. What specific HR challenge or opportunity are you trying to address with AI? For example: 'I need to reduce bias in our resume screening process' or 'I want to predict which employees are at risk of leaving'"
                rows={4}
                required
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                Be specific about the business outcome you're trying to achieve.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Desired Module Title (Optional)
              </label>
              <Input
                value={formData.desired_module}
                onChange={(e) => handleInputChange('desired_module', e.target.value)}
                placeholder="e.g., 'AI for Diversity & Inclusion' or 'Predictive Analytics for Employee Retention'"
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                If you have a specific module title in mind, let us know!
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Context (Optional)
              </label>
              <Textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Any additional context, specific tools you're using, industry considerations, or other details that would help us create the perfect module for you..."
                rows={3}
                className="w-full"
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">What happens next?</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Our team will review your request within 2-3 business days</li>
                <li>• We'll reach out if we need more information</li>
                <li>• If approved, we'll add it to our development roadmap</li>
                <li>• You'll be notified when the module is ready</li>
              </ul>
            </div>

            <div className="flex space-x-4">
              <Button
                type="submit"
                disabled={submitting || !formData.jtbd.trim()}
                className="flex-1"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Request
                  </>
                )}
              </Button>
              <Link href="/app/hr-university">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </Card>

        {/* Examples */}
        <Card className="p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Example Requests</h3>
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-medium text-gray-900">AI for Performance Reviews</h4>
              <p className="text-sm text-gray-600">
                "I need help using AI to analyze performance review data and identify patterns that could indicate bias or inconsistency in our review process. We have 500+ employees and manual analysis is taking too long."
              </p>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-medium text-gray-900">Predictive Turnover Analysis</h4>
              <p className="text-sm text-gray-600">
                "We're losing too many good employees unexpectedly. I want to learn how to use AI to predict which employees are at risk of leaving so we can take proactive retention measures."
              </p>
            </div>
            <div className="border-l-4 border-purple-500 pl-4">
              <h4 className="font-medium text-gray-900">AI-Powered Learning & Development</h4>
              <p className="text-sm text-gray-600">
                "I need to create personalized learning paths for our employees using AI. We have different skill levels and career goals, and one-size-fits-all training isn't working."
              </p>
            </div>
          </div>
        </Card>

        {/* Setup Notice */}
        <Card className="p-6 border-amber-200 bg-amber-50">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Send className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-amber-900">Database Setup Required</h3>
              <p className="text-amber-800 mt-1">
                To enable full functionality with request tracking and Slack integration, please run the database migrations.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}