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
  Zap,
  Headphones,
  Phone,
  TrendingUp,
  Users,
  Target,
  Search
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
  type: 'intercom' | 'hubspot' | 'gong' | 'mixpanel' | 'crayon' | 'clay' | 'snowflake' | 'supabase'
  status: 'connected' | 'disconnected' | 'error'
  description: string
  icon: React.ReactNode
  color: string
}

interface DataChatbotProps {
  className?: string
}

const dataSources: DataSource[] = [
  {
    id: 'intercom',
    name: 'Intercom',
    type: 'intercom',
    status: 'connected',
    description: 'Customer support conversations, tickets, and contact data',
    icon: <MessageSquare className="h-4 w-4" />,
    color: 'bg-blue-100 text-blue-800'
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    type: 'hubspot',
    status: 'connected',
    description: 'CRM data with contacts, deals, and marketing campaigns',
    icon: <BarChart3 className="h-4 w-4" />,
    color: 'bg-orange-100 text-orange-800'
  },
  {
    id: 'gong',
    name: 'Gong',
    type: 'gong',
    status: 'connected',
    description: 'Sales call recordings, transcripts, and conversation analytics',
    icon: <Phone className="h-4 w-4" />,
    color: 'bg-purple-100 text-purple-800'
  },
  {
    id: 'mixpanel',
    name: 'Mixpanel',
    type: 'mixpanel',
    status: 'connected',
    description: 'Analytics and user behavior tracking data',
    icon: <TrendingUp className="h-4 w-4" />,
    color: 'bg-green-100 text-green-800'
  },
  {
    id: 'crayon',
    name: 'Crayon',
    type: 'crayon',
    status: 'connected',
    description: 'Competitive intelligence, battlecards, and market insights',
    icon: <Target className="h-4 w-4" />,
    color: 'bg-red-100 text-red-800'
  },
  {
    id: 'clay',
    name: 'Clay',
    type: 'clay',
    status: 'connected',
    description: 'Data enrichment, lead generation, and company intelligence',
    icon: <Search className="h-4 w-4" />,
    color: 'bg-yellow-100 text-yellow-800'
  },
  {
    id: 'snowflake',
    name: 'Snowflake',
    type: 'snowflake',
    status: 'connected',
    description: 'Data warehouse with customer, sales, and analytics data',
    icon: <Database className="h-4 w-4" />,
    color: 'bg-sky-100 text-sky-800'
  },
  {
    id: 'supabase',
    name: 'Supabase',
    type: 'supabase',
    status: 'connected',
    description: 'Application database with templates, intakes, and user data',
    icon: <Database className="h-4 w-4" />,
    color: 'bg-emerald-100 text-emerald-800'
  }
]

export default function DataChatbot({ className }: DataChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hi! I'm your data assistant. I can help you query and analyze data from your 8 connected sources. What would you like to know?",
      timestamp: new Date('2024-01-01T00:00:00Z') // Fixed timestamp to prevent hydration issues
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
      {/* Header - Simplified */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center space-x-3">
          <Badge variant="secondary" className="flex items-center space-x-2 px-3 py-1">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm">AI Powered</span>
          </Badge>
        </div>
        
        {/* Data Source Selector */}
        <div className="flex items-center space-x-3">
          <span className="text-sm font-medium text-gray-700">Query Source:</span>
          <select
            value={selectedDataSource}
            onChange={(e) => setSelectedDataSource(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

      {/* Data Sources Status - Minimal */}
      <div className="border-b bg-gray-50">
        <div className="px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-medium text-gray-600">Sources:</span>
              <div className="flex items-center space-x-1">
                {dataSources.slice(0, 3).map(source => (
                  <div key={source.id} className="flex items-center space-x-1 px-2 py-1 rounded bg-white border">
                    <div className={`p-0.5 rounded ${source.color}`}>
                      {source.icon}
                    </div>
                    <span className="text-xs font-medium text-gray-900">{source.name}</span>
                  </div>
                ))}
                {dataSources.length > 3 && (
                  <div className="flex items-center px-2 py-1 rounded bg-gray-100 border">
                    <span className="text-xs text-gray-600">+{dataSources.length - 3}</span>
                  </div>
                )}
              </div>
            </div>
            <Badge variant="secondary" className="flex items-center space-x-1 text-xs">
              <CheckCircle className="h-3 w-3" />
              <span>{dataSources.length} Active</span>
            </Badge>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                {getMessageIcon(message.type)}
              </div>
              <div className="flex-1">
                <div className={`rounded-xl p-4 ${getMessageStyle(message.type)}`}>
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  
                  {/* Message Metadata */}
                  {message.metadata && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
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
                        <div className="mt-3 p-3 bg-gray-800 text-green-400 rounded-lg text-sm font-mono">
                          <div className="text-gray-400 mb-2 text-xs">Generated SQL:</div>
                          {message.metadata.query}
                        </div>
                      )}
                      
                      {/* Show Error */}
                      {message.metadata.error && (
                        <div className="mt-3 p-3 bg-red-50 text-red-800 rounded-lg text-sm border border-red-200">
                          <div className="flex items-center space-x-2">
                            <AlertCircle className="h-4 w-4" />
                            <span>Error: {message.metadata.error}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-400 mt-2 ml-14">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          
          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <Bot className="h-5 w-5" />
              </div>
              <div className="bg-gray-100 rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                  <span className="text-gray-700">Analyzing your request...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-white">
        <div className="flex items-center space-x-3">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about your data... (e.g., 'Show me top customers by revenue')"
            className="flex-1 h-12 text-base"
            disabled={isLoading}
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="px-6 h-12"
            size="lg"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
        
        {/* Example Queries - Simplified */}
        <div className="mt-3">
          <p className="text-xs text-gray-500 mb-2">Quick examples:</p>
          <div className="flex flex-wrap gap-2">
            {[
              "Recent Intercom conversations",
              "HubSpot deals closing this month",
              "Top Gong call topics",
              "Mixpanel user engagement",
              "Crayon competitor insights",
              "Clay prospect data",
              "Snowflake revenue trends"
            ].map((example, index) => (
              <button
                key={index}
                onClick={() => setInputValue(example)}
                className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full transition-colors"
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
