import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

// Single client instance to prevent multiple GoTrueClient instances
let supabaseClient: ReturnType<typeof createBrowserClient<Database>> | null = null

export const createClientSupabase = () => {
  if (!supabaseClient) {
    supabaseClient = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
    )
  }
  return supabaseClient
}

// For backward compatibility
export const supabase = createClientSupabase()

// Export createClient for compatibility with existing code
export const createClient = createClientSupabase
