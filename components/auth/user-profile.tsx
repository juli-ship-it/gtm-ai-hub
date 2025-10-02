'use client'

import { useAuth } from '@/lib/auth/context'
import { Button } from '@/components/ui/button'

export function UserProfile() {
  const { user, signOut } = useAuth()

  if (!user) return null

  const handleSignOut = async () => {
    await signOut()
  }

  const getInitials = (email: string) => {
    const name = email.split('@')[0]
    return name
      .split('.')
      .map(part => part.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2)
  }

  return (
    <div className="flex items-center space-x-3">
      <div className="h-8 w-8 bg-wl-accent rounded-full flex items-center justify-center">
        <span className="text-sm font-medium text-white">
          {getInitials(user.email || '')}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-wl-text truncate">
          {user.email?.split('@')[0] || 'User'}
        </p>
        <p className="text-xs text-wl-muted truncate">
          {user.email}
        </p>
      </div>
      <Button
        onClick={handleSignOut}
        variant="outline"
        size="sm"
        className="text-xs"
      >
        Sign Out
      </Button>
    </div>
  )
}
