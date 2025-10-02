'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Logo } from '@/components/logo'

export function SignupForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const { signUp } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    // Validate password length
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    // Validate workleap.com email
    if (!email.endsWith('@workleap.com')) {
      setError('Please use a workleap.com email address')
      setLoading(false)
      return
    }

    try {
      const { error } = await signUp(email, password)
      
      if (error) {
        setError(error.message || 'An error occurred during signup')
      } else {
        setSuccess(true)
        // Redirect to login after successful signup
        setTimeout(() => {
          router.push('/auth/login')
        }, 2000)
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-wl-bg">
        <Card className="w-full max-w-md p-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-wl-text">Check your email!</h2>
            <p className="text-wl-muted">
              We've sent a confirmation link to <strong>{email}</strong>
            </p>
            <p className="text-sm text-wl-muted">
              Please check your email and click the link to confirm your account.
            </p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-wl-bg">
      <Card className="w-full max-w-md p-8">
        <div className="space-y-6">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Logo size="lg" />
            </div>
            <h2 className="text-xl font-semibold text-wl-text">Create your account</h2>
            <p className="text-wl-muted">Sign up with your workleap.com email</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-wl-text mb-1">
                Work Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@workleap.com"
                required
                className="w-full"
              />
              <p className="text-xs text-wl-muted mt-1">Only workleap.com emails are allowed</p>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-wl-text mb-1">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                required
                className="w-full"
              />
              <p className="text-xs text-wl-muted mt-1">Must be at least 6 characters</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-wl-text mb-1">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
                className="w-full"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-wl-accent hover:bg-wl-accent/90 text-white"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-sm text-wl-muted">
              Already have an account?{' '}
              <a href="/auth/login" className="text-wl-accent hover:text-wl-accent/80 font-medium">
                Sign in
              </a>
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
