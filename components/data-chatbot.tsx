'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
// import { ScrollArea } from '@/components/ui/scroll-area' // Component not available
import { 
  Send, 
  Bot, 
  User, 
  Database, 
  Loader2, 
  AlertCircle, 
  CheckCircle, 
  BarChart3,
  Table,
  MessageSquare,
  Sparkles,
  Zap
} from 'lucide-react'

export interface ChatMessage {
  id: string
  type: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  metadata?: {
    query?: string
    dataSource?: string
    executionTime?: number
    rowCount?: number
    error?: string
  }
}

export interface DataSource {
  id: string
  name: string
  type: 'snowflake' | 'supabase' | 'hubspot' | 'mixpanel'
  status: 'connected' | 'disconnected' | 'error'
  description: string
  icon: React.ReactNode
}

interface DataChatbotProps {
  className?: string
}

const dataSources: DataSource[] = [
  {
    id: 'snowflake',
    name: 'Snowflake',
    type: 'snowflake',
    status: 'connected',
    description: 'Data warehouse with customer, sales, and analytics data',
    icon: <Database className="h-4 w-4" />
  },
  {
    id: 'supabase',
    name: 'Supabase',
    type: 'supabase',
    status: 'connected',
    description: 'Application database with templates, intakes, and user data',
    icon: <Database className="h-4 w-4" />
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    type: 'hubspot',
    status: 'connected',
    description: 'CRM data with contacts, deals, and marketing campaigns',
    icon: <BarChart3 className="h-4 w-4" />
  },
  {
    id: 'mixpanel',
    name: 'Mixpanel',
    type: 'mixpanel',
    status: 'connected',
    description: 'Analytics and user behavior tracking data',
    icon: <BarChart3 className="h-4 w-4" />
  }
]

export default function DataChatbot({ className }: DataChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hi! I'm your data assistant. I can help you query and analyze data from your connected sources including Snowflake, Supabase, HubSpot, and Mixpanel. What would you like to know?",
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedDataSource, setSelectedDataSource] = useState<string>('auto')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/data-chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputValue.trim(),
          dataSource: selectedDataSource,
          messageHistory: messages.slice(-10) // Send last 10 messages for context
        }),
      })

      if (!response.ok) {
        throw new Error(`API call failed: ${response.statusText}`)
      }

      const result = await response.json()
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: result.response,
        timestamp: new Date(),
        metadata: {
          query: result.query,
          dataSource: result.dataSource,
          executionTime: result.executionTime,
          rowCount: result.rowCount,
          error: result.error
        }
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `I'm sorry, I encountered an error while processing your request: ${error}`,
        timestamp: new Date(),
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const getMessageIcon = (type: ChatMessage['type']) => {
    switch (type) {
      case 'user':
        return <User className="h-4 w-4" />
      case 'assistant':
        return <Bot className="h-4 w-4" />
      case 'system':
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const getMessageStyle = (type: ChatMessage['type']) => {
    switch (type) {
      case 'user':
        return 'bg-blue-500 text-white ml-auto max-w-[80%]'
      case 'assistant':
        return 'bg-gray-100 text-gray-900 mr-auto max-w-[80%]'
      case 'system':
        return 'bg-yellow-100 text-yellow-800 mx-auto max-w-[90%]'
    }
  }

  const getDataSourceStatusColor = (status: DataSource['status']) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800'
      case 'disconnected':
        return 'bg-gray-100 text-gray-800'
      case 'error':
        return 'bg-red-100 text-red-800'
    }
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-6 w-6 text-blue-500" />
            <h2 className="text-xl font-bold">Data Assistant</h2>
          </div>
          <Badge variant="secondary" className="flex items-center space-x-1">
            <Sparkles className="h-3 w-3" />
            <span>AI Powered</span>
          </Badge>
        </div>
        
        {/* Data Source Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Query:</span>
          <select
            value={selectedDataSource}
            onChange={(e) => setSelectedDataSource(e.target.value)}
            className="px-3 py-1 border rounded-md text-sm"
          >
            <option value="auto">Auto-detect</option>
            {dataSources.map(source => (
              <option key={source.id} value={source.id}>
                {source.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Data Sources Status */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Connected Sources:</span>
          {dataSources.map(source => (
            <div key={source.id} className="flex items-center space-x-2">
              {source.icon}
              <span className="text-sm">{source.name}</span>
              <Badge className={getDataSourceStatusColor(source.status)}>
                {source.status}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                {getMessageIcon(message.type)}
              </div>
              <div className="flex-1">
                <div className={`rounded-lg p-3 ${getMessageStyle(message.type)}`}>
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  
                  {/* Message Metadata */}
                  {message.metadata && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        {message.metadata.dataSource && (
                          <div className="flex items-center space-x-1">
                            <Database className="h-3 w-3" />
                            <span>{message.metadata.dataSource}</span>
                          </div>
                        )}
                        {message.metadata.executionTime && (
                          <div className="flex items-center space-x-1">
                            <Zap className="h-3 w-3" />
                            <span>{message.metadata.executionTime}s</span>
                          </div>
                        )}
                        {message.metadata.rowCount && (
                          <div className="flex items-center space-x-1">
                            <Table className="h-3 w-3" />
                            <span>{message.metadata.rowCount} rows</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Show SQL Query */}
                      {message.metadata.query && (
                        <div className="mt-2 p-2 bg-gray-800 text-green-400 rounded text-xs font-mono">
                          <div className="text-gray-400 mb-1">Generated SQL:</div>
                          {message.metadata.query}
                        </div>
                      )}
                      
                      {/* Show Error */}
                      {message.metadata.error && (
                        <div className="mt-2 p-2 bg-red-100 text-red-800 rounded text-xs">
                          <div className="flex items-center space-x-1">
                            <AlertCircle className="h-3 w-3" />
                            <span>Error: {message.metadata.error}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          
          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <div className="bg-gray-100 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-gray-600">Analyzing your request...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex items-center space-x-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about your data... (e.g., 'Show me top customers by revenue')"
            className="flex-1"
            disabled={isLoading}
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="px-4"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        {/* Example Queries */}
        <div className="mt-2">
          <p className="text-xs text-gray-500 mb-1">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {[
              "Show me top 10 customers by revenue",
              "What's our monthly sales trend?",
              "How many leads did we generate last week?",
              "Which campaigns are performing best?"
            ].map((example, index) => (
              <button
                key={index}
                onClick={() => setInputValue(example)}
                className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
