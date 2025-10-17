'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createClientSupabase } from '@/lib/supabase/client'
import type { Database } from '@/types/database'

type AppUser = Database['public']['Tables']['app_user']['Row']

interface AuthContextType {
  user: User | null
  appUser: AppUser | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, companyDomain?: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Create a single Supabase client instance outside the component
// This is created once and reused across all auth operations
const supabaseClient = createClientSupabase()

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [appUser, setAppUser] = useState<AppUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  // Domain restriction for workleap.com emails
  const ALLOWED_DOMAINS = ['workleap.com']
  const RESTRICT_TO_DOMAINS = true

  const refreshUser = async () => {
    try {
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Auth timeout')), 10000)
      )

      const sessionPromise = supabaseClient.auth.getSession()
      const { data: { session }, error: sessionError } = await Promise.race([
        sessionPromise,
        timeoutPromise
      ]) as any

      if (sessionError) {
        setLoading(false)
        return
      }

      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        // Skip app user fetch for now to prevent 500 errors
        // This will be handled after user confirms email
        setAppUser(null)
      } else {
        setAppUser(null)
      }
    } catch (error) {
      console.error('Error refreshing user:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Mark as mounted to prevent hydration mismatch
    setMounted(true)

    // Only run on client
    if (typeof window === 'undefined') return

    refreshUser()

    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setAppUser(null) // Skip app user for now
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { error }
      }

      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const signUp = async (email: string, password: string, companyDomain?: string) => {
    try {
      // Check domain restriction
      if (RESTRICT_TO_DOMAINS && ALLOWED_DOMAINS.length > 0) {
        const emailDomain = email.split('@')[1]
        if (!ALLOWED_DOMAINS.includes(emailDomain)) {
          return {
            error: {
              message: `Signup is restricted to workleap.com email addresses only.`
            }
          }
        }
      }

      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            company_domain: companyDomain || email.split('@')[1]
          }
        }
      })

      if (error) {
        return { error }
      }

      // If signup is successful and user is created, create app_user record
      if (data.user && !data.user.email_confirmed_at) {
        // User needs to confirm email, app_user will be created after confirmation
        return { error: null }
      }

      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const signOut = async () => {
    await supabaseClient.auth.signOut()
    setUser(null)
    setAppUser(null)
    setSession(null)
  }

  const value = {
    user,
    appUser,
    session,
    loading: !mounted || loading,
    signIn,
    signUp,
    signOut,
    refreshUser,
  }

  // Prevent hydration mismatch by not rendering until mounted on client
  if (!mounted) {
    return null
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}