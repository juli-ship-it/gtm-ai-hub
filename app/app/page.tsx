'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth/context'
import { CardSkeleton } from '@/components/loading-skeleton'
import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function AppPage() {
  const { user, loading } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || loading) {
    return <CardSkeleton />
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-wl-bg">
        <Card className="w-full max-w-md p-8">
          <div className="text-center space-y-4">
            <Logo size="lg" />
            <h2 className="text-xl font-semibold text-wl-text">Access Denied</h2>
            <p className="text-wl-muted">Please sign in to access the application.</p>
            <Link href="/auth/login">
              <Button className="w-full">Sign In</Button>
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-wl-bg">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Logo size="lg" />
          <h1 className="text-3xl font-bold text-wl-text mt-4">Welcome to GTM AI Hub</h1>
          <p className="text-wl-muted mt-2">Centralize AI templates, GTM playbooks, intake, run history, and metrics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="wl-card-hover">
            <CardHeader>
              <CardTitle>Templates</CardTitle>
              <CardDescription>Manage and execute AI templates</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/templates">
                <Button className="w-full">View Templates</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="wl-card-hover">
            <CardHeader>
              <CardTitle>Intake Requests</CardTitle>
              <CardDescription>Review and manage automation requests</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/intake">
                <Button className="w-full">View Intake</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="wl-card-hover">
            <CardHeader>
              <CardTitle>Data Assistant</CardTitle>
              <CardDescription>AI-powered data analysis and insights</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/data-assistant">
                <Button className="w-full">Open Assistant</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="wl-card-hover">
            <CardHeader>
              <CardTitle>GPT Agents</CardTitle>
              <CardDescription>Manage and execute GPT agents</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/gpt-agents">
                <Button className="w-full">View Agents</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="wl-card-hover">
            <CardHeader>
              <CardTitle>Playbooks</CardTitle>
              <CardDescription>GTM playbooks and workflows</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/playbooks">
                <Button className="w-full">View Playbooks</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="wl-card-hover">
            <CardHeader>
              <CardTitle>HR University</CardTitle>
              <CardDescription>Learning modules and training</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/hr-university">
                <Button className="w-full">View Modules</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
