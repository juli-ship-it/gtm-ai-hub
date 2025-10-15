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

// Types for admin data
interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'editor' | 'runner'
  lastActive: string
  status: 'active' | 'inactive'
}

interface Integration {
  name: string
  status: 'connected' | 'disconnected' | 'error'
  lastSync: string | null
  description: string
}

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
  // TODO: Replace with actual data fetching
  const activeUsersCount = 0 // Will be fetched from database
  const templatesCount = 0 // Will be fetched from database
  const connectedIntegrations = 0 // Will be calculated from integrations
  const totalIntegrations = 0 // Will be fetched from integrations
  const systemHealth = 100 // Will be calculated from system metrics

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
                    <p className="text-2xl font-bold text-wl-text">{activeUsersCount}</p>
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
                    <p className="text-2xl font-bold text-wl-text">{templatesCount}</p>
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
                    <p className="text-2xl font-bold text-wl-text">{connectedIntegrations}/{totalIntegrations}</p>
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
                    <p className="text-2xl font-bold text-wl-text">{systemHealth}%</p>
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
                {/* TODO: Replace with actual users data fetching */}
                {activeUsersCount === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-wl-muted mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-wl-text mb-2">No users found</h3>
                    <p className="text-wl-muted mb-4">
                      Get started by adding your first user to the system.
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-wl-muted mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-wl-text mb-2">User data loading...</h3>
                    <p className="text-wl-muted">
                      Fetching user information from the database.
                    </p>
                  </div>
                )}
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
                {/* TODO: Replace with actual integrations data fetching */}
                {totalIntegrations === 0 ? (
                  <div className="text-center py-8">
                    <Database className="h-12 w-12 text-wl-muted mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-wl-text mb-2">No integrations configured</h3>
                    <p className="text-wl-muted mb-4">
                      Connect external services to enhance your workflow automation.
                    </p>
                    <Button variant="outline" className="mt-4">
                      <Database className="mr-2 h-4 w-4" />
                      Add Integration
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Database className="h-12 w-12 text-wl-muted mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-wl-text mb-2">Loading integrations...</h3>
                    <p className="text-wl-muted">
                      Fetching integration status from the system.
                    </p>
                  </div>
                )}
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
