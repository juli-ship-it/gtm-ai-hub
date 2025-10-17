import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

// Single client instance to prevent multiple GoTrueClient instances
let supabaseClient: ReturnType<typeof createBrowserClient<Database>> | null = null

export const createClientSupabase = () => {
  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Supabase environment variables not found. Using placeholder values.')
    }
    
    supabaseClient = createBrowserClient<Database>(
      supabaseUrl || 'https://placeholder.supabase.co',
      supabaseAnonKey || 'placeholder-key'
    )
  }
  return supabaseClient
}

// For backward compatibility
export const supabase = createClientSupabase()

// Export createClient for compatibility with existing code
export const createClient = createClientSupabase
