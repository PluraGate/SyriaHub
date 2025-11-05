'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AuthFormProps {
  mode: 'login' | 'signup'
  onSubmit?: (email: string, password: string) => Promise<void>
  className?: string
}

export function AuthForm({ mode, onSubmit, className }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const isLogin = mode === 'login'

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    
    // Basic validation
    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setIsLoading(true)

    try {
      if (onSubmit) {
        await onSubmit(email, password)
      } else {
        // Default form submission (for server actions)
        e.currentTarget.submit()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('w-full', className)}>
      <div className="card p-8 md:p-10 max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold text-primary dark:text-dark-text mb-2">
            {isLogin ? 'Welcome Back' : 'Get Started'}
          </h1>
          <p className="text-text-light dark:text-dark-text-muted">
            {isLogin
              ? 'Sign in to your account to continue'
              : 'Create your account to start sharing'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div
            className="mb-6 p-4 bg-accent/10 dark:bg-accent-light/10 border border-accent/20 dark:border-accent-light/20 rounded-lg flex items-start gap-3"
            role="alert"
            aria-live="polite"
          >
            <AlertCircle className="w-5 h-5 text-accent dark:text-accent-light flex-shrink-0 mt-0.5" />
            <p className="text-sm text-accent-dark dark:text-accent-light">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-text dark:text-dark-text mb-2"
            >
              Email Address
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light dark:text-dark-text-muted">
                <Mail className="w-5 h-5" aria-hidden="true" />
              </div>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input pl-11"
                required
                aria-required="true"
                aria-invalid={error ? 'true' : 'false'}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-text dark:text-dark-text mb-2"
            >
              Password
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light dark:text-dark-text-muted">
                <Lock className="w-5 h-5" aria-hidden="true" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isLogin ? 'Enter your password' : 'At least 6 characters'}
                className="input pl-11 pr-11"
                required
                aria-required="true"
                aria-invalid={error ? 'true' : 'false'}
                disabled={isLoading}
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light dark:text-dark-text-muted hover:text-primary dark:hover:text-accent-light transition-colors p-1 focus-ring rounded"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Forgot Password (Login only) */}
          {isLogin && (
            <div className="text-right">
              <Link
                href="/auth/reset-password"
                className="text-sm text-primary dark:text-primary-light hover:text-accent dark:hover:text-accent-light transition-colors focus-ring rounded px-1"
              >
                Forgot password?
              </Link>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary w-full relative"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                {isLogin ? 'Signing in...' : 'Creating account...'}
              </>
            ) : (
              <>{isLogin ? 'Sign In' : 'Create Account'}</>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-dark-border"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-background-white dark:bg-dark-surface text-text-light dark:text-dark-text-muted">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
            </span>
          </div>
        </div>

        {/* Switch Mode Link */}
        <div className="text-center">
          <Link
            href={isLogin ? '/auth/signup' : '/auth/login'}
            className="text-primary dark:text-primary-light hover:text-accent dark:hover:text-accent-light font-medium transition-colors focus-ring rounded px-2 py-1"
          >
            {isLogin ? 'Create an account' : 'Sign in instead'}
          </Link>
        </div>
      </div>

      {/* Terms Note (Signup only) */}
      {!isLogin && (
        <p className="mt-6 text-center text-sm text-text-light dark:text-dark-text-muted max-w-md mx-auto">
          By creating an account, you agree to our{' '}
          <Link href="/terms" className="link">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="link">
            Privacy Policy
          </Link>
          .
        </p>
      )}
    </div>
  )
}
