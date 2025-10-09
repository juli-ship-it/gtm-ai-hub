import { PageHeader } from '@/components/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sidebar } from '@/components/sidebar'
import { 
  Settings, 
  Users, 
  Key, 
  Database,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react'

// Role color mapping
const roleColors = {
  admin: 'bg-red-100 text-red-800',
  editor: 'bg-blue-100 text-blue-800',
  runner: 'bg-green-100 text-green-800'
}

// Mock data
const mockUsers = [
  {
    id: '1',
    name: 'Juliana Reyes',
    email: 'juliana@workleap.com',
    role: 'admin',
    lastActive: '2024-01-15T14:30:00Z',
    status: 'active'
  },
  {
    id: '2',
    name: 'Sarah Chen',
    email: 'sarah@workleap.com',
    role: 'editor',
    lastActive: '2024-01-15T12:15:00Z',
    status: 'active'
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike@workleap.com',
    role: 'runner',
    lastActive: '2024-01-14T16:45:00Z',
    status: 'active'
  }
]

const mockIntegrations = [
  {
    name: 'n8n',
    status: 'connected',
    lastSync: '2024-01-15T14:30:00Z',
    description: 'Workflow orchestration'
  },
  {
    name: 'HubSpot',
    status: 'connected',
    lastSync: '2024-01-15T13:20:00Z',
    description: 'CRM and marketing automation'
  },
  {
    name: 'Snowflake',
    status: 'disconnected',
    lastSync: null,
    description: 'Data warehouse'
  },
  {
    name: 'Snowflake MCP',
    status: 'connected',
    lastSync: '2024-01-15T15:00:00Z',
    description: 'Model Context Protocol for AI agents'
  },
  {
    name: 'Google Analytics',
    status: 'error',
    lastSync: '2024-01-14T09:15:00Z',
    description: 'Web analytics'
  }
]

const statusColors = {
  connected: 'bg-green-100 text-green-800',
  disconnected: 'bg-gray-100 text-gray-800',
  error: 'bg-red-100 text-red-800'
}

const statusIcons = {
  connected: CheckCircle,
  disconnected: Clock,
  error: AlertTriangle
}

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-wl-bg">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-8">
          <PageHeader
            title="Admin Dashboard"
            description="Manage users, integrations, and system settings."
          />

          {/* System Status */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="wl-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-wl-muted">Active Users</p>
                    <p className="text-2xl font-bold text-wl-text">3</p>
                  </div>
                  <Users className="h-8 w-8 text-wl-accent" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="wl-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-wl-muted">Templates</p>
                    <p className="text-2xl font-bold text-wl-text">6</p>
                  </div>
                  <Settings className="h-8 w-8 text-wl-accent-2" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="wl-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-wl-muted">Integrations</p>
                    <p className="text-2xl font-bold text-wl-text">2/4</p>
                  </div>
                  <Database className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="wl-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-wl-muted">System Health</p>
                    <p className="text-2xl font-bold text-wl-text">98%</p>
                  </div>
                  <Shield className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* User Management */}
            <Card className="wl-card">
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Manage user roles and permissions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-wl-accent rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-wl-text">{user.name}</h4>
                        <p className="text-sm text-wl-muted">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={roleColors[user.role as keyof typeof roleColors]}>
                        {user.role}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
                <Button className="w-full" variant="outline">
                  <Users className="mr-2 h-4 w-4" />
                  Add User
                </Button>
              </CardContent>
            </Card>

            {/* Integration Status */}
            <Card className="wl-card">
              <CardHeader>
                <CardTitle>Integration Status</CardTitle>
                <CardDescription>
                  Monitor external service connections
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockIntegrations.map((integration) => {
                  const StatusIcon = statusIcons[integration.status as keyof typeof statusIcons]
                  return (
                    <div key={integration.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-wl-accent/10 rounded-xl">
                          <StatusIcon className="h-5 w-5 text-wl-accent" />
                        </div>
                        <div>
                          <h4 className="font-medium text-wl-text">{integration.name}</h4>
                          <p className="text-sm text-wl-muted">{integration.description}</p>
                          {integration.lastSync && (
                            <p className="text-xs text-wl-muted">
                              Last sync: {new Date(integration.lastSync).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={statusColors[integration.status as keyof typeof statusColors]}>
                          {integration.status}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          Configure
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>

          {/* System Settings */}
          <Card className="wl-card mt-8">
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>
                Configure global application settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-wl-text">Default Timeout (minutes)</label>
                  <Input type="number" defaultValue="30" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-wl-text">Max Concurrent Runs</label>
                  <Input type="number" defaultValue="10" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-wl-text">Retention Period (days)</label>
                  <Input type="number" defaultValue="90" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-wl-text">Notification Email</label>
                  <Input type="email" defaultValue="admin@workleap.com" />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-wl-text">System Message</label>
                <Textarea 
                  placeholder="Enter a system-wide message for users..."
                  rows={3}
                />
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="text-sm text-wl-muted">
                  Changes are saved automatically
                </div>
                <Button className="wl-button-primary">
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
