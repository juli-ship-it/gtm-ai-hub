'use client'

import { PageHeader } from '@/components/page-header'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, CheckCircle, Circle, Play, Clock, Star } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

// Mock data for demonstration
const mockModule = {
  id: '1',
  title: 'Foundations of Responsible AI in HR',
  description: 'Master the ethical foundations of AI in HR, including bias detection, fairness principles, and responsible implementation strategies.',
  difficulty: 'beginner',
  estimated_hours: 2,
  ethics_required: true,
  lessons: [
    {
      id: '1',
      title: 'AI Ethics Principles in HR',
      estimated_minutes: 45,
      completed: false,
      score: undefined
    },
    {
      id: '2',
      title: 'Bias Detection & Mitigation Strategies',
      estimated_minutes: 40,
      completed: false,
      score: undefined
    }
  ],
  progress: {
    completed: 0,
    total: 2,
    percentage: 0
  },
  user_rating: undefined,
  user_feedback: undefined
}

export default function HRModuleDetailPage() {
  const params = useParams()
  const slug = params.slug as string

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const nextLesson = mockModule.lessons.find(lesson => !lesson.completed)

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-4">
        <Link href="/app/hr-university/modules">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Modules
          </Button>
        </Link>
      </div>

      <PageHeader
        title={mockModule.title}
        description={mockModule.description}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Module Overview */}
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Badge className={getDifficultyColor(mockModule.difficulty)}>
                  {mockModule.difficulty}
                </Badge>
                {mockModule.ethics_required && (
                  <Badge className="bg-purple-100 text-purple-800">
                    Ethics Required
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-gray-500" />
                  <span>{mockModule.lessons.length} lessons</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>{mockModule.estimated_hours}h total</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-gray-500" />
                  <span>{mockModule.progress.completed} completed</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-gray-500" />
                  <span>{mockModule.user_rating ? `${mockModule.user_rating}/5` : 'Not rated'}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Overall Progress</span>
                  <span className="font-medium">{mockModule.progress.percentage}%</span>
                </div>
                <Progress value={mockModule.progress.percentage} className="h-2" />
              </div>
            </div>
          </Card>

          {/* Lessons List */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Lessons</h3>
            <div className="space-y-3">
              {mockModule.lessons.map((lesson, index) => (
                <div
                  key={lesson.id}
                  className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50"
                >
                  <div className="flex-shrink-0">
                    {lesson.completed ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {index + 1}. {lesson.title}
                      </h4>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>{lesson.estimated_minutes}m</span>
                        {lesson.score !== undefined && (
                          <span className="text-green-600 font-medium">
                            {lesson.score}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <Link href={`/app/hr-university/lessons/${lesson.id}`}>
                      <Button size="sm" variant="outline">
                        <Play className="h-3 w-3 mr-1" />
                        {lesson.completed ? 'Review' : 'Start'}
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Progress Card */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Progress</h3>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">{mockModule.progress.percentage}%</div>
                <div className="text-sm text-gray-600">Complete</div>
              </div>
              <Progress value={mockModule.progress.percentage} className="h-3" />
              <div className="text-sm text-gray-600 text-center">
                {mockModule.progress.completed} of {mockModule.progress.total} lessons completed
              </div>
            </div>
          </Card>

          {/* Next Lesson */}
          {nextLesson && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Next Lesson</h3>
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">{nextLesson.title}</h4>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>{nextLesson.estimated_minutes} minutes</span>
                </div>
                <Link href={`/app/hr-university/lessons/${nextLesson.id}`}>
                  <Button className="w-full">
                    <Play className="h-4 w-4 mr-2" />
                    Continue Learning
                  </Button>
                </Link>
              </div>
            </Card>
          )}

          {/* Feedback */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Rate This Module</h3>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Complete the module to rate it and provide feedback.
              </p>
              <Button variant="outline" disabled className="w-full">
                Rate This Module
              </Button>
            </div>
          </Card>
        </div>
      </div>

    </div>
  )
}