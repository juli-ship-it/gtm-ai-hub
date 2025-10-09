'use client'

import { useState, useEffect } from 'react'
import { SnowflakeQueryResult, ConnectionStatus } from '@/lib/integrations/snowflake-mcp'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Database, Table, Search, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react'

interface SnowflakeMCPDemoProps {
  className?: string
}

export default function SnowflakeMCPDemo({ className }: SnowflakeMCPDemoProps) {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus | null>(null)
  const [query, setQuery] = useState('SELECT COUNT(*) FROM customers')
  const [queryResult, setQueryResult] = useState<SnowflakeQueryResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [databases, setDatabases] = useState<string[]>([])
  const [schemas, setSchemas] = useState<string[]>([])
  const [tables, setTables] = useState<string[]>([])
  const [selectedDatabase, setSelectedDatabase] = useState('')
  const [selectedSchema, setSelectedSchema] = useState('')

  useEffect(() => {
    initializeClient()
  }, [])

  const initializeClient = async () => {
    try {
      // Get connection status
      const status = await callAPI('getConnectionStatus')
      setConnectionStatus(status)
      
      // Load initial data
      await loadDatabases()
    } catch (err) {
      setError(`Failed to initialize Snowflake MCP client: ${err}`)
    }
  }

  const callAPI = async (action: string, params: any = {}) => {
    const response = await fetch('/api/snowflake-mcp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action, ...params }),
    })

    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`)
    }

    const result = await response.json()
    if (!result.success) {
      throw new Error(result.error || 'API call failed')
    }

    return result.data
  }

  const loadDatabases = async () => {
    try {
      const dbList = await callAPI('listDatabases')
      setDatabases(dbList)
      if (dbList.length > 0) {
        setSelectedDatabase(dbList[0])
        await loadSchemas(dbList[0])
      }
    } catch (err) {
      setError(`Failed to load databases: ${err}`)
    }
  }

  const loadSchemas = async (database: string) => {
    try {
      const schemaList = await callAPI('listSchemas', { database })
      setSchemas(schemaList)
      if (schemaList.length > 0) {
        setSelectedSchema(schemaList[0])
        await loadTables(database, schemaList[0])
      }
    } catch (err) {
      setError(`Failed to load schemas: ${err}`)
    }
  }

  const loadTables = async (database: string, schema: string) => {
    try {
      const tableList = await callAPI('listTables', { database, schema })
      setTables(tableList)
    } catch (err) {
      setError(`Failed to load tables: ${err}`)
    }
  }

  const executeQuery = async () => {
    if (!query.trim()) return
    
    setIsLoading(true)
    setError(null)
    setQueryResult(null)
    
    try {
      const result = await callAPI('executeQuery', { query })
      setQueryResult(result)
    } catch (err) {
      setError(`Query execution failed: ${err}`)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = () => {
    if (!connectionStatus) return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    return connectionStatus.connected ? 
      <CheckCircle className="h-4 w-4 text-green-500" /> : 
      <XCircle className="h-4 w-4 text-red-500" />
  }

  const getStatusColor = () => {
    if (!connectionStatus) return 'bg-yellow-100 text-yellow-800'
    return connectionStatus.connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Snowflake MCP Integration</h2>
          <p className="text-gray-600">Query and explore your Snowflake data using Model Context Protocol</p>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <Badge className={getStatusColor()}>
            {connectionStatus?.connected ? 'Connected' : 'Disconnected'}
          </Badge>
        </div>
      </div>

      {/* Connection Status */}
      {connectionStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>Connection Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-gray-500">Account</Label>
                <p className="font-mono">{connectionStatus.account}</p>
              </div>
              <div>
                <Label className="text-gray-500">User</Label>
                <p className="font-mono">{connectionStatus.user}</p>
              </div>
              <div>
                <Label className="text-gray-500">Role</Label>
                <p className="font-mono">{connectionStatus.role}</p>
              </div>
              <div>
                <Label className="text-gray-500">Warehouse</Label>
                <p className="font-mono">{connectionStatus.warehouse}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Database Explorer */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Table className="h-5 w-5" />
            <span>Database Explorer</span>
          </CardTitle>
          <CardDescription>Browse your Snowflake databases, schemas, and tables</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="database">Database</Label>
              <select
                id="database"
                value={selectedDatabase}
                onChange={(e) => {
                  setSelectedDatabase(e.target.value)
                  loadSchemas(e.target.value)
                }}
                className="w-full p-2 border rounded-md"
              >
                {databases.map(db => (
                  <option key={db} value={db}>{db}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="schema">Schema</Label>
              <select
                id="schema"
                value={selectedSchema}
                onChange={(e) => {
                  setSelectedSchema(e.target.value)
                  loadTables(selectedDatabase, e.target.value)
                }}
                className="w-full p-2 border rounded-md"
              >
                {schemas.map(schema => (
                  <option key={schema} value={schema}>{schema}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="tables">Tables</Label>
              <select
                id="tables"
                className="w-full p-2 border rounded-md"
                multiple
                size={4}
              >
                {tables.map(table => (
                  <option key={table} value={table}>{table}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Query Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>SQL Query Interface</span>
          </CardTitle>
          <CardDescription>Execute SQL queries against your Snowflake data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="query">SQL Query</Label>
            <Textarea
              id="query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter your SQL query here..."
              className="min-h-[100px] font-mono"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              onClick={executeQuery} 
              disabled={isLoading || !query.trim()}
              className="flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Clock className="h-4 w-4 animate-spin" />
                  <span>Executing...</span>
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  <span>Execute Query</span>
                </>
              )}
            </Button>
            
            {isLoading && (
              <div className="flex-1">
                <Progress value={undefined} className="w-full" />
              </div>
            )}
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center space-x-2 text-red-800">
                <XCircle className="h-4 w-4" />
                <span className="font-medium">Error</span>
              </div>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Query Results */}
      {queryResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Query Results</span>
            </CardTitle>
            <CardDescription>
              Execution time: {queryResult.executionTime}s | Rows: {queryResult.rowCount} | Query ID: {queryResult.queryId}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {queryResult.data.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      {queryResult.columns.map((column, index) => (
                        <th key={index} className="border border-gray-300 px-4 py-2 text-left font-medium">
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {queryResult.data.slice(0, 100).map((row, rowIndex) => (
                      <tr key={rowIndex} className="hover:bg-gray-50">
                        {queryResult.columns.map((column, colIndex) => (
                          <td key={colIndex} className="border border-gray-300 px-4 py-2">
                            {typeof row[column] === 'object' ? 
                              JSON.stringify(row[column]) : 
                              String(row[column] || '')
                            }
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {queryResult.data.length > 100 && (
                  <p className="text-sm text-gray-500 mt-2">
                    Showing first 100 rows of {queryResult.data.length} total rows
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No data returned</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
