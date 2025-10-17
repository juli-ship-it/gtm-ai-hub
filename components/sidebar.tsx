'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/logo'
import { useAuth } from '@/lib/auth/context'
import { Badge } from '@/components/ui/badge'
import {
  LayoutDashboard,
  FileText,
  Play,
  ClipboardList,
  BookOpen,
  MessageSquare,
  Settings,
  GraduationCap,
  BarChart3,
  Bot,
  Database,
  LogOut,
  X
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Templates', href: '/templates', icon: FileText },
  { name: 'Clones', href: '/runs', icon: Play, badge: 'Coming Soon' },
  { name: 'Intake', href: '/intake', icon: ClipboardList },
  { name: 'Playbooks', href: '/playbooks', icon: BookOpen, badge: 'Coming Soon' },
  { name: 'Prompts', href: '/prompts', icon: MessageSquare, badge: 'Coming Soon' },
  { name: 'GPT Agents', href: '/gpt-agents', icon: Bot },
  { name: 'Data Assistant', href: '/data-assistant', icon: Database, badge: 'Soon' },
  { name: 'HR University', href: '/hr-university', icon: GraduationCap, badge: 'Soon' },
  { name: 'Admin', href: '/admin', icon: Settings },
]

interface SidebarProps {
  onClose?: () => void
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname()
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut()
      // Redirect to login page or home page after logout
      window.location.href = '/'
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200">
        <Logo size="md" />
        {/* Mobile close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => onClose?.()}
              className={cn(
                'group flex items-center justify-between px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200',
                isActive
                  ? 'bg-wl-accent text-white shadow-sm'
                  : 'text-wl-muted hover:bg-gray-100 hover:text-wl-text'
              )}
            >
              <div className="flex items-center">
                <item.icon
                  className={cn(
                    'mr-3 h-5 w-5 flex-shrink-0',
                    isActive ? 'text-white' : 'text-wl-muted group-hover:text-wl-text'
                  )}
                />
                {item.name}
              </div>
              {item.badge && (
                <Badge
                  variant="secondary"
                  className={cn(
                    'text-[10px] px-1.5 py-0.5 h-4',
                    isActive
                      ? 'bg-white/20 text-white border-white/30'
                      : 'bg-blue-100 text-blue-800 border-blue-200'
                  )}
                >
                  Soon
                </Badge>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 mb-3">
          <div className="h-8 w-8 bg-wl-accent rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-white">
              {user?.email ?
                user.email.split('@')[0].split('.').map(part => part.charAt(0).toUpperCase()).join('') :
                'U'
              }
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-wl-text truncate">
              {user?.email ?
                user.email.split('@')[0].split('.').map(part =>
                  part.charAt(0).toUpperCase() + part.slice(1)
                ).join(' ') :
                'User'
              }
            </p>
          </div>
        </div>

        {/* Logout button */}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center px-3 py-2 text-sm text-wl-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
        >
          <LogOut className="mr-3 h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  )
}
