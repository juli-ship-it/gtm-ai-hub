'use client'

import { ProtectedRoute } from '@/components/auth/protected-route'
import { Sidebar } from '@/components/sidebar'
import { UserProfile } from '@/components/auth/user-profile'
import { useAuth } from '@/lib/auth/context'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = useAuth()
  
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-wl-bg">
        <div className="flex">
          <Sidebar />
          <div className="flex-1 p-8">
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold text-wl-text wl-hand-drawn">
                    Welcome back{user?.email ? `, ${user.email.split('@')[0].split('.')[0].charAt(0).toUpperCase() + user.email.split('@')[0].split('.')[0].slice(1)}!` : '!'} 👋
                  </h1>
                  <p className="text-lg text-wl-muted max-w-2xl">
                    Here's what's happening with your GTM automation today.
                  </p>
                </div>
                <UserProfile />
              </div>
            </div>
            {children}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}