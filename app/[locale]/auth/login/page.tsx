import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { AlertCircle, BookOpen, Users, Sparkles } from 'lucide-react'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/feed')
  }

  async function handleLogin(formData: FormData) {
    'use server'

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
      redirect('/auth/login?error=Email and password are required')
    }

    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('Login error:', error)
      redirect(`/auth/login?error=${error.message}`)
    }

    redirect('/feed')
  }

  return (
    <div className="min-h-screen flex flex-col bg-background dark:bg-dark-bg">
      <Navbar user={null} />

      <main className="flex-1 flex">
        {/* Left - Branding Panel */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary-dark to-primary relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 right-20 w-72 h-72 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-20 left-20 w-96 h-96 bg-secondary rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 flex flex-col justify-center px-16 py-12">
            <Link href="/" className="flex items-center gap-3 mb-12">
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-2xl">S</span>
              </div>
              <span className="font-bold text-2xl text-white">SyriaHub</span>
            </Link>

            <h1 className="text-4xl font-bold text-white mb-4">
              Welcome Back
            </h1>
            <p className="text-xl text-white/80 mb-12 max-w-md">
              Continue your research journey and connect with your community.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Your Research Feed</h3>
                  <p className="text-sm text-white/70">See updates from researchers you follow</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Group Discussions</h3>
                  <p className="text-sm text-white/70">Participate in collaborative research</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">New Insights</h3>
                  <p className="text-sm text-white/70">Discover trending research in your field</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right - Form Panel */}
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="text-center mb-8 lg:hidden">
              <Link href="/" className="inline-flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">S</span>
                </div>
                <span className="font-bold text-2xl text-text dark:text-dark-text">SyriaHub</span>
              </Link>
            </div>

            {/* Error Message */}
            {params.error && (
              <div className="mb-6 p-4 rounded-2xl bg-accent/10 border border-accent/20">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-accent mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-text dark:text-dark-text">Error</h3>
                    <p className="text-sm text-text-light dark:text-dark-text-muted mt-1">{params.error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Form Card */}
            <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-200 dark:border-dark-border p-8">
              <h2 className="text-2xl font-bold text-text dark:text-dark-text mb-2">
                Sign in to your account
              </h2>
              <p className="text-text-light dark:text-dark-text-muted mb-8">
                Don&apos;t have an account?{' '}
                <Link href="/auth/signup" className="font-semibold text-primary hover:text-primary-dark transition-colors">
                  Sign up
                </Link>
              </p>

              <form className="space-y-5" action={handleLogin}>
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-text dark:text-dark-text mb-2">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-text dark:text-dark-text placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-white dark:focus:bg-dark-surface transition-all"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-text dark:text-dark-text mb-2">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-text dark:text-dark-text placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-white dark:focus:bg-dark-surface transition-all"
                    placeholder="Enter your password"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-all shadow-sm hover:shadow-md"
                >
                  Sign In
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link href="/auth/forgot-password" className="text-sm text-text-light dark:text-dark-text-muted hover:text-primary transition-colors">
                  Forgot your password?
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
