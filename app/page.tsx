'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/context'
import { CardSkeleton } from '@/components/loading-skeleton'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch by only rendering after client mount
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !loading) {
      if (user) {
        router.push('/app')
      } else {
        router.push('/auth/login')
      }
    }
  }, [user, loading, router, mounted])

  // Always show loading until mounted to prevent hydration mismatch
  if (!mounted || loading) {
    return <CardSkeleton />
  }

  return <CardSkeleton />
}