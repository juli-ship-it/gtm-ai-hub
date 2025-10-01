'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  FileText, 
  Play, 
  ClipboardList, 
  BookOpen, 
  MessageSquare,
  Settings,
  Zap
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Templates', href: '/templates', icon: FileText },
  { name: 'Runs', href: '/runs', icon: Play },
  { name: 'Intake', href: '/intake', icon: ClipboardList },
  { name: 'Playbooks', href: '/playbooks', icon: BookOpen },
  { name: 'Prompts', href: '/prompts', icon: MessageSquare },
  { name: 'Admin', href: '/admin', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-wl-accent rounded-xl">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-wl-text">GTM AI Hub</h1>
            <p className="text-xs text-wl-muted">Powered by AI</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200',
                isActive
                  ? 'bg-wl-accent text-white shadow-sm'
                  : 'text-wl-muted hover:bg-gray-100 hover:text-wl-text'
              )}
            >
              <item.icon
                className={cn(
                  'mr-3 h-5 w-5 flex-shrink-0',
                  isActive ? 'text-white' : 'text-wl-muted group-hover:text-wl-text'
                )}
              />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 bg-wl-accent rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-white">JR</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-wl-text truncate">
              Juliana Reyes
            </p>
            <p className="text-xs text-wl-muted truncate">
              GTM Architect
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
