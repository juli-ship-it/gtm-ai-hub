'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/page-header'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BookOpen, Clock, Star, Search, Filter, ArrowRight } from 'lucide-react'
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
    ethics_required: true,
    status: 'published'
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
    ethics_required: true,
    status: 'published'
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
    ethics_required: true,
    status: 'published'
  },
  {
    id: '4',
    title: 'Performance & Growth',
    description: 'Implement AI-driven performance management, goal setting, and career development strategies.',
    difficulty: 'intermediate',
    estimated_hours: 2,
    lessons: 1,
    progress: 0,
    rating: 0,
    ethics_required: true,
    status: 'published'
  },
  {
    id: '5',
    title: 'Compensation & Fairness',
    description: 'Ensure pay equity and fair compensation practices using AI analytics and bias detection tools.',
    difficulty: 'advanced',
    estimated_hours: 2,
    lessons: 1,
    progress: 0,
    rating: 0,
    ethics_required: true,
    status: 'published'
  }
]

export default function HRModulesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (percentage: number) => {
    if (percentage === 100) return 'bg-green-100 text-green-800'
    if (percentage > 0) return 'bg-blue-100 text-blue-800'
    return 'bg-gray-100 text-gray-800'
  }

  const getStatusText = (percentage: number) => {
    if (percentage === 100) return 'Completed'
    if (percentage > 0) return 'In Progress'
    return 'Not Started'
  }

  const filteredModules = mockModules.filter(module => {
    const matchesSearch = !searchTerm ||
      module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      module.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesDifficulty = difficultyFilter === 'all' || module.difficulty === difficultyFilter
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'completed' && module.progress === 100) ||
      (statusFilter === 'in_progress' && module.progress > 0 && module.progress < 100) ||
      (statusFilter === 'not_started' && module.progress === 0)

    return matchesSearch && matchesDifficulty && matchesStatus
  })

  return (
    <div className="space-y-8">
      <PageHeader
        title="HR University Modules"
        description="Explore our comprehensive AI in HR curriculum"
      />

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search modules..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="not_started">Not Started</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          Showing {filteredModules.length} of {mockModules.length} modules
        </p>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredModules.map((module) => (
          <Card key={module.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{module.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-3">{module.description}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Badge className={getDifficultyColor(module.difficulty)}>
                  {module.difficulty}
                </Badge>
                <Badge className={getStatusColor(module.progress)}>
                  {getStatusText(module.progress)}
                </Badge>
                {module.ethics_required && (
                  <Badge className="bg-purple-100 text-purple-800">
                    Ethics Required
                  </Badge>
                )}
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

                {module.rating > 0 && (
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600">{module.rating}/5</span>
                  </div>
                )}
              </div>

              <div className="pt-4">
                <Link href={`/app/hr-university/modules/${module.id}`}>
                  <Button className="w-full flex items-center justify-center space-x-2">
                    <span>
                      {module.progress === 100 ? 'Review Module' :
                       module.progress > 0 ? 'Continue Learning' : 'Start Module'}
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredModules.length === 0 && (
        <Card className="p-12 text-center">
          <div className="space-y-4">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto" />
            <h3 className="text-lg font-semibold text-gray-900">No modules found</h3>
            <p className="text-gray-600">
              Try adjusting your search criteria or filters to find what you're looking for.
            </p>
          </div>
        </Card>
      )}

    </div>
  )
}