import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'

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
      
      <main className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link 
              href="/" 
              className="inline-flex items-center space-x-2 group focus-ring rounded-lg p-2"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <span className="text-white font-display font-bold text-xl">S</span>
              </div>
              <span className="font-display font-bold text-2xl text-primary dark:text-dark-text">
                Syrealize
              </span>
            </Link>
          </div>

          <form action={handleLogin} className="space-y-6">
            <div className="card p-8">
              <h1 className="text-3xl font-display font-bold text-primary dark:text-dark-text mb-2 text-center">
                Welcome Back
              </h1>
              <p className="text-text-light dark:text-dark-text-muted text-center mb-8">
                Sign in to your account to continue
              </p>

              {/* Error Message */}
              {params.error && (
                <div className="mb-6 rounded-lg bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-800 dark:text-red-200">
                        {params.error}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-text dark:text-dark-text mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="input"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-text dark:text-dark-text mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    required
                    className="input"
                    placeholder="Enter your password"
                  />
                </div>

                <button type="submit" className="btn btn-primary w-full">
                  Sign In
                </button>
              </div>
            </div>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-dark-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-background dark:bg-dark-bg text-text-light dark:text-dark-text-muted">
                Don&apos;t have an account?
              </span>
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/auth/signup"
              className="text-primary dark:text-primary-light hover:text-accent dark:hover:text-accent-light font-medium transition-colors focus-ring rounded px-2 py-1"
            >
              Create an account
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
