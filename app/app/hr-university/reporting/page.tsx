'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/page-header'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BookOpen, Clock, Star, Users, Trophy, TrendingUp, Download, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

// Mock data for demonstration
const mockUserStats = {
  total_modules: 5,
  completed_modules: 0,
  total_lessons: 6,
  completed_lessons: 0,
  total_hours: 11,
  average_rating: 0,
  badges_earned: 0,
  completion_rate: 0
}

const mockModuleStats = [
  {
    id: '1',
    title: 'Foundations of Responsible AI in HR',
    total_lessons: 2,
    completed_lessons: 0,
    completion_rate: 0,
    average_rating: 0,
    total_feedback: 0,
    total_hours: 2
  },
  {
    id: '2',
    title: 'AI for Recruiting & Talent Acquisition',
    total_lessons: 1,
    completed_lessons: 0,
    completion_rate: 0,
    average_rating: 0,
    total_feedback: 0,
    total_hours: 3
  },
  {
    id: '3',
    title: 'Employee Engagement & Feedback',
    total_lessons: 1,
    completed_lessons: 0,
    completion_rate: 0,
    average_rating: 0,
    total_feedback: 0,
    total_hours: 2
  },
  {
    id: '4',
    title: 'Performance & Growth',
    total_lessons: 1,
    completed_lessons: 0,
    completion_rate: 0,
    average_rating: 0,
    total_feedback: 0,
    total_hours: 2
  },
  {
    id: '5',
    title: 'Compensation & Fairness',
    total_lessons: 1,
    completed_lessons: 0,
    completion_rate: 0,
    average_rating: 0,
    total_feedback: 0,
    total_hours: 2
  }
]

export default function HRReportingPage() {
  const [timeFilter, setTimeFilter] = useState('all')

  const getCompletionColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600'
    if (rate >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600'
    if (rating >= 3) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/hr-university">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to HR University
            </Button>
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Time Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
              <SelectItem value="1y">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <PageHeader
        title="HR University Analytics"
        subtitle="Track learning progress and engagement metrics"
      />

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Modules Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {mockUserStats.completed_modules}/{mockUserStats.total_modules}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Trophy className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Lessons Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {mockUserStats.completed_lessons}/{mockUserStats.total_lessons}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Hours Invested</p>
              <p className="text-2xl font-bold text-gray-900">{mockUserStats.total_hours}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Average Rating</p>
              <p className="text-2xl font-bold text-gray-900">
                {mockUserStats.average_rating > 0 ? mockUserStats.average_rating.toFixed(1) : 'N/A'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Progress Overview */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Progress</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Learning Progress</span>
            <span className="text-sm text-gray-600">{mockUserStats.completion_rate}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${mockUserStats.completion_rate}%` }}
            ></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="font-semibold text-gray-900">{mockUserStats.badges_earned}</div>
              <div className="text-gray-600">Badges Earned</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-900">{mockUserStats.completed_modules}</div>
              <div className="text-gray-600">Modules Completed</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-900">{mockUserStats.completed_lessons}</div>
              <div className="text-gray-600">Lessons Completed</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-900">{mockUserStats.total_hours}h</div>
              <div className="text-gray-600">Total Time</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Module Performance */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Module Performance</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Module
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Feedback
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hours
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mockModuleStats.map((module) => (
                <tr key={module.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{module.title}</div>
                    <div className="text-sm text-gray-500">
                      {module.completed_lessons}/{module.total_lessons} lessons
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${module.completion_rate}%` }}
                        ></div>
                      </div>
                      <span className={`text-sm font-medium ${getCompletionColor(module.completion_rate)}`}>
                        {module.completion_rate}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400" />
                      <span className={`text-sm font-medium ${getRatingColor(module.average_rating)}`}>
                        {module.average_rating > 0 ? module.average_rating.toFixed(1) : 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {module.total_feedback} reviews
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {module.total_hours}h
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Insights */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Top Performing Modules</h4>
            <div className="space-y-2">
              {mockModuleStats
                .sort((a, b) => b.completion_rate - a.completion_rate)
                .slice(0, 3)
                .map((module, index) => (
                  <div key={module.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{index + 1}. {module.title}</span>
                    <Badge className={getCompletionColor(module.completion_rate)}>
                      {module.completion_rate}%
                    </Badge>
                  </div>
                ))}
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Highest Rated Modules</h4>
            <div className="space-y-2">
              {mockModuleStats
                .filter(m => m.average_rating > 0)
                .sort((a, b) => b.average_rating - a.average_rating)
                .slice(0, 3)
                .map((module, index) => (
                  <div key={module.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{index + 1}. {module.title}</span>
                    <div className="flex items-center space-x-1">
                      <Star className="h-3 w-3 text-yellow-400" />
                      <span className={getRatingColor(module.average_rating)}>
                        {module.average_rating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Setup Notice */}
      <Card className="p-6 border-amber-200 bg-amber-50">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-amber-100 rounded-lg">
            <TrendingUp className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-amber-900">Database Setup Required</h3>
            <p className="text-amber-800 mt-1">
              To enable full functionality with real-time analytics, progress tracking, and user data, please run the database migrations.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}