'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/page-header'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, ArrowRight, CheckCircle, Clock, Play, Star, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import ReactMarkdown from 'react-markdown'

// Mock data for demonstration
const mockLesson = {
  id: '1',
  title: 'AI Ethics Principles in HR',
  content_md: `# AI Ethics Principles in HR

## Learning Objectives
By the end of this lesson, you will understand:
- Core ethical principles for AI in HR
- Common bias patterns in AI systems
- How to implement fairness checks
- Legal and compliance considerations

## Key Concepts

### 1. The Four Pillars of AI Ethics in HR

**Fairness**: AI systems should not discriminate based on protected characteristics
**Transparency**: Decision-making processes should be explainable
**Accountability**: Clear responsibility for AI-driven decisions
**Privacy**: Protecting employee data and maintaining confidentiality

### 2. Common Bias Patterns

- **Historical Bias**: Past discriminatory practices reflected in training data
- **Representation Bias**: Underrepresented groups in training datasets
- **Measurement Bias**: Inaccurate or incomplete metrics
- **Aggregation Bias**: One-size-fits-all approaches ignoring individual differences

### 3. Practical Implementation

- Regular bias audits of AI systems
- Diverse training data collection
- Human oversight and review processes
- Continuous monitoring and adjustment

## Exercise
Review your current HR processes and identify potential bias points where AI could help or harm fairness.`,
  video_url: null,
  quiz: [
    {
      question: "What is the primary goal of fairness in AI ethics for HR?",
      options: [
        "Speed up hiring decisions",
        "Ensure AI systems do not discriminate based on protected characteristics",
        "Reduce costs",
        "Automate all HR processes"
      ],
      correct_index: 1
    },
    {
      question: "Which type of bias occurs when past discriminatory practices are reflected in training data?",
      options: [
        "Representation bias",
        "Historical bias",
        "Measurement bias",
        "Aggregation bias"
      ],
      correct_index: 1
    },
    {
      question: "What should be the first step when implementing AI in HR processes?",
      options: [
        "Deploy immediately",
        "Conduct a bias audit",
        "Train all staff",
        "Update policies"
      ],
      correct_index: 1
    }
  ],
  estimated_minutes: 45,
  module: {
    id: '1',
    title: 'Foundations of Responsible AI in HR',
    difficulty: 'beginner',
    ethics_required: true
  },
  completed: false,
  score: undefined
}

export default function HRLessonPage() {
  const [quizAnswers, setQuizAnswers] = useState<number[]>([])
  const [showQuiz, setShowQuiz] = useState(false)
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [quizScore, setQuizScore] = useState<number | null>(null)
  const [submittingProgress, setSubmittingProgress] = useState(false)

  const params = useParams()
  const slug = params.slug as string

  // Initialize quiz answers
  useState(() => {
    if (mockLesson.quiz) {
      setQuizAnswers(new Array(mockLesson.quiz.length).fill(-1))
    }
  })

  const submitQuiz = () => {
    if (!mockLesson.quiz) return

    let correct = 0
    mockLesson.quiz.forEach((question, index) => {
      if (quizAnswers[index] === question.correct_index) {
        correct++
      }
    })

    const score = Math.round((correct / mockLesson.quiz.length) * 100)
    setQuizScore(score)
    setQuizSubmitted(true)
  }

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
      <div className="flex items-center space-x-4">
        <Link href={`/app/hr-university/modules/${mockLesson.module.id}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Module
          </Button>
        </Link>
      </div>

      <PageHeader
        title={mockLesson.title}
        subtitle={`Part of: ${mockLesson.module.title}`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Lesson Info */}
          <Card className="p-6">
            <div className="flex items-center space-x-4 mb-4">
              <Badge className={getDifficultyColor(mockLesson.module.difficulty)}>
                {mockLesson.module.difficulty}
              </Badge>
              {mockLesson.module.ethics_required && (
                <Badge className="bg-purple-100 text-purple-800">
                  Ethics Required
                </Badge>
              )}
              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>{mockLesson.estimated_minutes} minutes</span>
              </div>
              {mockLesson.completed && (
                <div className="flex items-center space-x-1 text-sm text-green-600">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Completed</span>
                </div>
              )}
            </div>

            {mockLesson.video_url && (
              <div className="mb-6">
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Play className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Video content would be embedded here</p>
                    <p className="text-sm text-gray-500">URL: {mockLesson.video_url}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Lesson Content */}
            {mockLesson.content_md && (
              <div className="prose max-w-none">
                <ReactMarkdown>{mockLesson.content_md}</ReactMarkdown>
              </div>
            )}

            {/* Quiz Section */}
            {mockLesson.quiz && mockLesson.quiz.length > 0 && (
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Knowledge Check</h3>
                  {quizSubmitted && (
                    <div className="flex items-center space-x-2">
                      <Star className="h-5 w-5 text-yellow-400" />
                      <span className="font-medium">
                        Score: {quizScore}%
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  {mockLesson.quiz.map((question, questionIndex) => (
                    <div key={questionIndex} className="space-y-3">
                      <h4 className="font-medium text-gray-900">
                        {questionIndex + 1}. {question.question}
                      </h4>
                      <div className="space-y-2">
                        {question.options.map((option, optionIndex) => (
                          <label
                            key={optionIndex}
                            className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer hover:bg-gray-50 ${
                              quizSubmitted
                                ? optionIndex === question.correct_index
                                  ? 'border-green-500 bg-green-50'
                                  : quizAnswers[questionIndex] === optionIndex
                                  ? 'border-red-500 bg-red-50'
                                  : 'border-gray-200'
                                : quizAnswers[questionIndex] === optionIndex
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`question-${questionIndex}`}
                              checked={quizAnswers[questionIndex] === optionIndex}
                              onChange={() => {
                                const newAnswers = [...quizAnswers]
                                newAnswers[questionIndex] = optionIndex
                                setQuizAnswers(newAnswers)
                              }}
                              disabled={quizSubmitted}
                              className="h-4 w-4"
                            />
                            <span className="text-sm">{option}</span>
                            {quizSubmitted && optionIndex === question.correct_index && (
                              <CheckCircle className="h-4 w-4 text-green-600 ml-auto" />
                            )}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}

                  {!quizSubmitted ? (
                    <div className="pt-4">
                      <Button
                        onClick={submitQuiz}
                        disabled={quizAnswers.some(answer => answer === -1)}
                        className="w-full"
                      >
                        Submit Quiz
                      </Button>
                    </div>
                  ) : (
                    <div className="pt-4 space-y-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900 mb-2">
                          {quizScore! >= 70 ? 'Congratulations!' : 'Keep Learning!'}
                        </div>
                        <p className="text-gray-600">
                          {quizScore! >= 70
                            ? 'You passed the quiz! Great job on mastering this lesson.'
                            : 'You scored below 70%. Consider reviewing the lesson content and trying again.'}
                        </p>
                      </div>
                      {quizScore! >= 70 && (
                        <Button
                          onClick={() => setSubmittingProgress(true)}
                          disabled={submittingProgress || mockLesson.completed}
                          className="w-full"
                        >
                          {submittingProgress ? 'Saving...' : 'Mark as Complete'}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* No Quiz - Manual Completion */}
            {(!mockLesson.quiz || mockLesson.quiz.length === 0) && !mockLesson.completed && (
              <div className="mt-8 pt-6 border-t">
                <Button
                  onClick={() => setSubmittingProgress(true)}
                  disabled={submittingProgress}
                  className="w-full"
                >
                  {submittingProgress ? 'Saving...' : 'Mark as Complete'}
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Progress Card */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Lesson Progress</h3>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">
                  {mockLesson.completed ? '100%' : '0%'}
                </div>
                <div className="text-sm text-gray-600">Complete</div>
              </div>
              <Progress value={mockLesson.completed ? 100 : 0} className="h-3" />
              {mockLesson.score !== undefined && (
                <div className="text-center text-sm text-gray-600">
                  Quiz Score: {mockLesson.score}%
                </div>
              )}
            </div>
          </Card>

          {/* Module Info */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Module Info</h3>
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-gray-900">{mockLesson.module.title}</h4>
                <p className="text-sm text-gray-600">Difficulty: {mockLesson.module.difficulty}</p>
              </div>
              <Link href={`/app/hr-university/modules/${mockLesson.module.id}`}>
                <Button variant="outline" className="w-full">
                  View Module
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* Setup Notice */}
      <Card className="p-6 border-amber-200 bg-amber-50">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-amber-100 rounded-lg">
            <BookOpen className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-amber-900">Database Setup Required</h3>
            <p className="text-amber-800 mt-1">
              To enable full functionality with progress tracking, quiz scoring, and completion certificates, please run the database migrations.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}