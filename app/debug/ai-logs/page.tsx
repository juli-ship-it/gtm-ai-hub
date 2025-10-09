'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function AILogsPage() {
  const [logs, setLogs] = useState<string[]>([])
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // This would connect to your logging service
    // For now, we'll show how to view logs
    console.log('AI Logs page loaded')
  }, [])

  const testAIAnalysis = async () => {
    try {
      console.log('🧪 Testing AI analysis...')
      
      // Test with a simple workflow
      const testWorkflow = {
        name: 'Test Workflow',
        nodes: [
          {
            name: 'Schedule Trigger',
            type: 'n8n-nodes-base.scheduleTrigger',
            parameters: {
              rule: {
                interval: [{ field: 'cronExpression', value: '0 9 * * *' }]
              }
            }
          }
        ],
        connections: {}
      }
      
      const response = await fetch('/api/analyze-workflow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: 'Test prompt',
          workflow: testWorkflow
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log('✅ Test successful:', result)
        alert('AI analysis test successful! Check console for details.')
      } else {
        console.error('❌ Test failed:', response.status)
        alert('AI analysis test failed! Check console for details.')
      }
    } catch (error) {
      console.error('❌ Test error:', error)
      alert('Test error! Check console for details.')
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">AI Analysis Logs</h1>
        <p className="text-gray-600">Monitor AI workflow analysis in real-time</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>AI Analysis Status</CardTitle>
            <CardDescription>Current AI analysis configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Badge variant={process.env.OPENAI_API_KEY ? "default" : "secondary"}>
                {process.env.OPENAI_API_KEY ? "OpenAI Configured" : "OpenAI Not Configured"}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge variant={process.env.ANTHROPIC_API_KEY ? "default" : "secondary"}>
                {process.env.ANTHROPIC_API_KEY ? "Claude Configured" : "Claude Not Configured"}
              </Badge>
            </div>

            <Button onClick={testAIAnalysis} className="w-full">
              Test AI Analysis
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How to View Logs</CardTitle>
            <CardDescription>Where to find AI analysis logs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Browser Console</h4>
              <p className="text-sm text-gray-600">
                Open Developer Tools (F12) → Console tab
                Look for logs starting with [requestId] 🚀
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Terminal/Server Logs</h4>
              <p className="text-sm text-gray-600">
                Run your Next.js app and watch the terminal output
                for detailed AI analysis logs
              </p>
            </div>

            <div>
              <h4 className="font-medium mb-2">Log Format</h4>
              <div className="bg-gray-100 p-2 rounded text-sm font-mono">
                [abc123] 🚀 AI Workflow Analysis Started<br/>
                [abc123] 📝 Workflow Info: {"{name: 'Hubspot list to Excel', nodeCount: 12}"}<br/>
                [abc123] ✅ OpenAI API key found<br/>
                [abc123] 🤖 Calling OpenAI API...<br/>
                [abc123] ⏱️ OpenAI API call took 2500ms<br/>
                [abc123] 📊 OpenAI Response: {"{usage: {...}, responseLength: 1200}"}<br/>
                [abc123] ✅ AI Analysis Complete: {"{variablesFound: 7, systems: ['hubspot', 'excel']}"}<br/>
                [abc123] 🎉 Total analysis time: 3000ms
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recent Logs</CardTitle>
          <CardDescription>AI analysis activity (simulated)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-green-600">✅</span>
              <span>AI analysis completed successfully</span>
              <span className="text-gray-500">2 minutes ago</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-blue-600">🤖</span>
              <span>OpenAI API call took 2.3s</span>
              <span className="text-gray-500">2 minutes ago</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-yellow-600">📝</span>
              <span>Workflow analyzed: Hubspot list to Excel</span>
              <span className="text-gray-500">2 minutes ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
