'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth/context'
import { CardSkeleton } from '@/components/loading-skeleton'
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

  // Extract and format the user's name from email
  const getUserName = () => {
    if (!user?.email) return 'User'
    const emailName = user.email.split('@')[0]
    const firstName = emailName.split('.')[0]
    return firstName.charAt(0).toUpperCase() + firstName.slice(1)
  }

  return (
    <div className="p-4 lg:p-8">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Welcome back, {getUserName()}! 👋</h1>
        <p className="text-gray-600 mt-2 text-sm lg:text-base">Here's what's happening with your GTM automation today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
        <Card className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardDescription className="text-gray-600">Clones Today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">0</div>
            <p className="text-sm text-green-600 mt-1">↑ +3 vs last period</p>
            <p className="text-xs text-gray-500 mt-1">vs yesterday</p>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardDescription className="text-gray-600">Hours Saved</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">0</div>
            <p className="text-sm text-green-600 mt-1">↑ +8 vs last period</p>
            <p className="text-xs text-gray-500 mt-1">this week</p>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardDescription className="text-gray-600">Success Rate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">0%</div>
            <p className="text-sm text-green-600 mt-1">↑ +2% vs last period</p>
            <p className="text-xs text-gray-500 mt-1">last 7 days</p>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardDescription className="text-gray-600">Active Templates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">1</div>
            <p className="text-sm text-green-600 mt-1">↑ 2 new vs last period</p>
            <p className="text-xs text-gray-500 mt-1">this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Recent Clones */}
        <Card className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Clones</CardTitle>
              <Link href="/runs" className="text-sm text-blue-600 hover:text-blue-700">
                View All →
              </Link>
            </div>
            <CardDescription>Latest automation clones and their status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No clones yet.</p>
              <Link href="/templates">
                <Button>Start with a template</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Popular Templates */}
        <Card className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Popular Templates</CardTitle>
              <Link href="/templates" className="text-sm text-blue-600 hover:text-blue-700">
                View All →
              </Link>
            </div>
            <CardDescription>Most used automation templates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">Hubspot Segment List to Excel</h3>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">Popular</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">This workflow automatically exports demo request leads from a HubSpot email campaign list to an Excel spreadsheet. It runs daily at 9 AM to capture new demo requests, enriches the contact data with additional details, and exports the information to a Microsoft Excel sheet for further processing by the sales team.</p>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    <span>Category: content</span>
                    <span className="mx-2">•</span>
                    <span>Version: v1</span>
                  </div>
                  <Link href="/templates">
                    <Button size="sm">Clone</Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
