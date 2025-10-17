'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Search, TrendingUp, Target, Users, AlertTriangle, Newspaper, BarChart3 } from 'lucide-react'

interface CrayonResponse {
  success: boolean
  operation: string
  data: any
  timestamp: string
}

interface ApiInfo {
  name: string
  version: string
  description: string
  enabled: boolean
  supportedOperations: string[]
  rateLimit: {
    windowMs: number
    maxRequests: number
  }
  timestamp: string
}

export default function CrayonMCPPage() {
  const [apiInfo, setApiInfo] = useState<ApiInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<CrayonResponse | null>(null)

  // Form states
  const [operation, setOperation] = useState('get_battlecard')
  const [competitor, setCompetitor] = useState('')
  const [product, setProduct] = useState('')
  const [useCase, setUseCase] = useState('')
  const [timeRange, setTimeRange] = useState('last_quarter')
  const [market, setMarket] = useState('')
  const [prospect, setProspect] = useState('')
  const [dealStage, setDealStage] = useState('')
  const [objection, setObjection] = useState('')
  const [context, setContext] = useState('')

  useEffect(() => {
    fetchApiInfo()
  }, [])

  const fetchApiInfo = async () => {
    try {
      const response = await fetch('/api/crayon')
      if (!response.ok) {
        throw new Error('Failed to fetch API info')
      }
      const info = await response.json()
      setApiInfo(info)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch API info')
    }
  }

  const executeQuery = async () => {
    setLoading(true)
    setError(null)
    setResults(null)

    try {
      const params: any = {}
      const options: any = {}

      // Build parameters based on operation
      switch (operation) {
        case 'get_battlecard':
          params.competitor = competitor
          options.product = product
          options.useCase = useCase
          break

        case 'get_competitor_profile':
          params.competitor = competitor
          options.include = ['products', 'pricing', 'recent_news']
          break

        case 'get_win_loss_stories':
          options.competitor = competitor
          options.timeRange = timeRange
          break

        case 'get_objection_handling':
          options.competitor = competitor
          options.objection = objection
          options.context = context
          break

        case 'get_competitive_positioning':
          options.yourProduct = product
          options.competitor = competitor
          options.market = market
          break

        case 'get_deal_intelligence':
          options.prospect = prospect
          options.competitors = competitor ? [competitor] : []
          options.dealStage = dealStage
          break

        case 'get_market_alerts':
          options.competitors = competitor ? [competitor] : []
          options.alertTypes = ['product_launch', 'pricing_change']
          options.timeRange = timeRange
          break

        case 'get_competitor_news':
          options.competitor = competitor
          options.timeRange = timeRange
          options.categories = ['product', 'funding', 'partnership']
          break

        case 'get_market_trends':
          options.market = market
          options.timeRange = timeRange
          options.include = ['competitor_analysis', 'pricing_trends']
          break
      }

      if (Object.keys(options).length > 0) {
        params.options = options
      }

      const response = await fetch('/api/crayon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operation,
          params
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Request failed')
      }

      const result = await response.json()
      setResults(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getOperationIcon = (op: string) => {
    switch (op) {
      case 'get_battlecard': return <Target className="h-4 w-4" />
      case 'get_win_loss_stories': return <TrendingUp className="h-4 w-4" />
      case 'get_competitor_profile': return <Users className="h-4 w-4" />
      case 'get_objection_handling': return <AlertTriangle className="h-4 w-4" />
      case 'get_competitive_positioning': return <Target className="h-4 w-4" />
      case 'get_deal_intelligence': return <BarChart3 className="h-4 w-4" />
      case 'get_market_alerts': return <AlertTriangle className="h-4 w-4" />
      case 'get_competitor_news': return <Newspaper className="h-4 w-4" />
      case 'get_market_trends': return <TrendingUp className="h-4 w-4" />
      default: return <Search className="h-4 w-4" />
    }
  }

  const getOperationDescription = (op: string) => {
    switch (op) {
      case 'get_battlecard': return 'Get competitive battlecards and positioning'
      case 'get_win_loss_stories': return 'Retrieve win/loss analysis and insights'
      case 'get_competitor_profile': return 'Get detailed competitor information'
      case 'get_objection_handling': return 'Get competitive objection handling strategies'
      case 'get_competitive_positioning': return 'Get positioning recommendations'
      case 'get_deal_intelligence': return 'Get competitive context for specific deals'
      case 'get_market_alerts': return 'Get real-time competitive alerts'
      case 'get_competitor_news': return 'Get recent competitor news and updates'
      case 'get_market_trends': return 'Get market trend analysis'
      default: return 'Execute competitive intelligence query'
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Crayon MCP Integration</h1>
          <p className="text-muted-foreground">
            Competitive intelligence powered by Crayon MCP
          </p>
        </div>
        {apiInfo && (
          <Badge variant={apiInfo.enabled ? "default" : "destructive"}>
            {apiInfo.enabled ? "Enabled" : "Disabled"}
          </Badge>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="query" className="space-y-4">
        <TabsList>
          <TabsTrigger value="query">Query Interface</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="info">API Info</TabsTrigger>
        </TabsList>

        <TabsContent value="query" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Competitive Intelligence Query</CardTitle>
              <CardDescription>
                Execute competitive intelligence queries using Crayon MCP
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="operation">Operation</Label>
                  <Select value={operation} onValueChange={setOperation}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select operation" />
                    </SelectTrigger>
                    <SelectContent>
                      {apiInfo?.supportedOperations.map((op) => (
                        <SelectItem key={op} value={op}>
                          <div className="flex items-center gap-2">
                            {getOperationIcon(op)}
                            {op.replace('get_', '').replace('_', ' ')}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="competitor">Competitor</Label>
                  <Input
                    id="competitor"
                    value={competitor}
                    onChange={(e) => setCompetitor(e.target.value)}
                    placeholder="Enter competitor name"
                  />
                </div>

                {operation === 'get_battlecard' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="product">Product</Label>
                      <Input
                        id="product"
                        value={product}
                        onChange={(e) => setProduct(e.target.value)}
                        placeholder="Enter product name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="useCase">Use Case</Label>
                      <Input
                        id="useCase"
                        value={useCase}
                        onChange={(e) => setUseCase(e.target.value)}
                        placeholder="e.g., enterprise_sales"
                      />
                    </div>
                  </>
                )}

                {operation === 'get_competitive_positioning' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="product">Your Product</Label>
                      <Input
                        id="product"
                        value={product}
                        onChange={(e) => setProduct(e.target.value)}
                        placeholder="Enter your product name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="market">Market</Label>
                      <Input
                        id="market"
                        value={market}
                        onChange={(e) => setMarket(e.target.value)}
                        placeholder="e.g., enterprise_software"
                      />
                    </div>
                  </>
                )}

                {operation === 'get_deal_intelligence' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="prospect">Prospect</Label>
                      <Input
                        id="prospect"
                        value={prospect}
                        onChange={(e) => setProspect(e.target.value)}
                        placeholder="Enter prospect company name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dealStage">Deal Stage</Label>
                      <Select value={dealStage} onValueChange={setDealStage}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select deal stage" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="prospecting">Prospecting</SelectItem>
                          <SelectItem value="qualification">Qualification</SelectItem>
                          <SelectItem value="proposal">Proposal</SelectItem>
                          <SelectItem value="negotiation">Negotiation</SelectItem>
                          <SelectItem value="closed_won">Closed Won</SelectItem>
                          <SelectItem value="closed_lost">Closed Lost</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {operation === 'get_objection_handling' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="objection">Objection</Label>
                      <Input
                        id="objection"
                        value={objection}
                        onChange={(e) => setObjection(e.target.value)}
                        placeholder="e.g., pricing_concern"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="context">Context</Label>
                      <Input
                        id="context"
                        value={context}
                        onChange={(e) => setContext(e.target.value)}
                        placeholder="e.g., enterprise_deal"
                      />
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="timeRange">Time Range</Label>
                  <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="last_week">Last Week</SelectItem>
                      <SelectItem value="last_month">Last Month</SelectItem>
                      <SelectItem value="last_quarter">Last Quarter</SelectItem>
                      <SelectItem value="last_year">Last Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={executeQuery}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Executing Query...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Execute Query
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          {results ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getOperationIcon(results.operation)}
                  Query Results
                </CardTitle>
                <CardDescription>
                  {getOperationDescription(results.operation)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="outline">{results.operation}</Badge>
                    <span>Executed at: {new Date(results.timestamp).toLocaleString()}</span>
                  </div>

                  <div className="bg-muted p-4 rounded-lg">
                    <pre className="text-sm overflow-auto">
                      {JSON.stringify(results.data, null, 2)}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center space-y-2">
                  <Search className="h-8 w-8 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">No results yet. Execute a query to see results here.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="info" className="space-y-4">
          {apiInfo ? (
            <Card>
              <CardHeader>
                <CardTitle>API Information</CardTitle>
                <CardDescription>
                  Crayon MCP API status and configuration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Name</Label>
                    <p className="text-sm text-muted-foreground">{apiInfo.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Version</Label>
                    <p className="text-sm text-muted-foreground">{apiInfo.version}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <Badge variant={apiInfo.enabled ? "default" : "destructive"}>
                      {apiInfo.enabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Last Updated</Label>
                    <p className="text-sm text-muted-foreground">
                      {new Date(apiInfo.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="text-sm text-muted-foreground">{apiInfo.description}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium">Supported Operations</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {apiInfo.supportedOperations.map((op) => (
                      <Badge key={op} variant="outline" className="text-xs">
                        {op}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Rate Limits</Label>
                  <p className="text-sm text-muted-foreground">
                    {apiInfo.rateLimit.maxRequests} requests per {apiInfo.rateLimit.windowMs / 1000 / 60} minutes
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center space-y-2">
                  <Loader2 className="h-8 w-8 mx-auto animate-spin text-muted-foreground" />
                  <p className="text-muted-foreground">Loading API information...</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}