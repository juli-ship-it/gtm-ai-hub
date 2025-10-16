'use client'

import { PageHeader } from '@/components/page-header'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BookOpen, Clock, Star, Users, Trophy, ArrowRight } from 'lucide-react'
import Link from 'next/link'

// Mock data for demonstration
const mockModules = [
  {
    id: '1',
    title: 'Foundations of Responsible AI in HR',
    description: 'Master the ethical foundations of AI in HR, including bias detection, fairness principles, and responsible implementation strategies.',
    difficulty: 'beginner',
    estimated_hours: 2,
    lessons: 2,
    progress: 0,
    rating: 0,
    ethics_required: true
  },
  {
    id: '2',
    title: 'AI for Recruiting & Talent Acquisition',
    description: 'Learn to leverage AI tools for sourcing, screening, and interviewing candidates while maintaining human-centered practices.',
    difficulty: 'intermediate',
    estimated_hours: 3,
    lessons: 1,
    progress: 0,
    rating: 0,
    ethics_required: true
  },
  {
    id: '3',
    title: 'Employee Engagement & Feedback',
    description: 'Use AI to analyze engagement data, predict turnover risk, and create personalized development plans.',
    difficulty: 'intermediate',
    estimated_hours: 2,
    lessons: 1,
    progress: 0,
    rating: 0,
    ethics_required: true
  }
]

export default function HRUniversityPage() {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <PageHeader
          title="AI in HR University"
          subtitle="Master AI-powered people management through hands-on training with real AI tools"
        />
        <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
          Coming Soon
        </Badge>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Modules Available</p>
              <p className="text-2xl font-bold text-gray-900">{mockModules.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Hours</p>
              <p className="text-2xl font-bold text-gray-900">
                {mockModules.reduce((sum, m) => sum + m.estimated_hours, 0)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Trophy className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Lessons Available</p>
              <p className="text-2xl font-bold text-gray-900">
                {mockModules.reduce((sum, m) => sum + m.lessons, 0)}
              </p>
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
              <p className="text-2xl font-bold text-gray-900">4.8</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Featured Modules */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Featured Modules</h2>
          <Link href="/hr-university/hr-university-temp/modules">
            <Button variant="outline" className="flex items-center space-x-2">
              <span>View All</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockModules.map((module) => (
            <Card key={module.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900">{module.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{module.description}</p>
                  </div>
                  <Badge className={getDifficultyColor(module.difficulty)}>
                    {module.difficulty}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span className="flex items-center space-x-1">
                      <BookOpen className="h-4 w-4" />
                      <span>{module.lessons} lessons</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{module.estimated_hours}h</span>
                    </span>
                  </div>

                  {module.ethics_required && (
                    <Badge className="bg-purple-100 text-purple-800">
                      Ethics Required
                    </Badge>
                  )}
                </div>

                <div className="pt-4">
                  <Link href={`/hr-university/hr-university-temp/modules/${module.id}`}>
                    <Button className="w-full">
                      Start Learning
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Ready to start learning?</h3>
            <p className="text-gray-600">Begin your AI in HR journey with our foundational modules</p>
          </div>
          <div className="flex space-x-3">
            <Link href="/hr-university/hr-university-temp/modules">
              <Button>Browse Modules</Button>
            </Link>
            <Link href="/hr-university/hr-university-temp/intake">
              <Button variant="outline">Request New Module</Button>
            </Link>
          </div>
        </div>
      </Card>

    </div>
  )
}