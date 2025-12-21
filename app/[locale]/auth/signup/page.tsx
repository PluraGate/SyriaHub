import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { CheckCircle2, AlertCircle, Sparkles, Users, BookOpen, Ticket, Gift } from 'lucide-react'

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string; code?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/feed')
  }

  // Pre-validate invite code if provided in URL
  let preValidatedCode = ''
  let inviterName = ''
  if (params.code) {
    const { data } = await supabase.rpc('validate_invite_code', {
      p_code: params.code.toUpperCase().trim(),
    })
    if (data?.valid) {
      preValidatedCode = params.code.toUpperCase().trim()
      // Get inviter name
      if (data.inviter_id) {
        const { data: inviter } = await supabase
          .from('users')
          .select('name, email')
          .eq('id', data.inviter_id)
          .single()
        if (inviter) {
          inviterName = inviter.name || inviter.email?.split('@')[0] || ''
        }
      }
    }
  }

  async function handleSignup(formData: FormData) {
    'use server'

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const inviteCode = formData.get('inviteCode') as string

    if (!email || !password) {
      redirect('/auth/signup?error=Email and password are required')
    }

    if (!inviteCode) {
      redirect('/auth/signup?error=Invite code is required')
    }

    if (password.length < 6) {
      redirect('/auth/signup?error=Password must be at least 6 characters')
    }

    const supabase = await createClient()

    // Validate invite code first
    const { data: inviteValidation, error: inviteError } = await supabase.rpc('validate_invite_code', {
      p_code: inviteCode.toUpperCase().trim(),
    })

    if (inviteError || !inviteValidation?.valid) {
      redirect(`/auth/signup?error=${inviteValidation?.error || 'Invalid invite code'}`)
    }

    // Create the account
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
        data: {
          invite_code: inviteCode.toUpperCase().trim(),
          invited_by: inviteValidation.inviter_id,
        },
      },
    })

    if (error) {
      console.error('Signup error:', error)
      redirect(`/auth/signup?error=${error.message}&code=${inviteCode}`)
    }

    // Mark invite as used
    if (data.user) {
      await supabase.rpc('use_invite_code', {
        p_code: inviteCode.toUpperCase().trim(),
        p_user_id: data.user.id,
      })
    }

    if (data.user && !data.session) {
      redirect('/auth/signup?success=check-email')
    }

    if (data.session) {
      redirect('/feed')
    }

    redirect('/auth/signup?success=check-email')
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
              Join by Invitation
            </h1>
            <p className="text-xl text-white/80 mb-12 max-w-md">
              SyriaHub is currently invite-only to ensure a high-quality research community.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Ticket className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Invite Required</h3>
                  <p className="text-sm text-white/70">Get an invite from an existing member</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Quality Community</h3>
                  <p className="text-sm text-white/70">Connect with verified researchers</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Gift className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Pay It Forward</h3>
                  <p className="text-sm text-white/70">Each member can invite 5 colleagues</p>
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

            {/* Invited by banner */}
            {inviterName && (
              <div className="mb-6 p-4 rounded-2xl bg-primary/10 border border-primary/20">
                <div className="flex items-center gap-3">
                  <Gift className="w-5 h-5 text-primary" />
                  <p className="text-sm text-text dark:text-dark-text">
                    You&apos;ve been invited by <strong>{inviterName}</strong>
                  </p>
                </div>
              </div>
            )}

            {/* Success Message */}
            {params.success === 'check-email' && (
              <div className="mb-6 p-4 rounded-2xl bg-secondary/10 border border-secondary/20">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-secondary-dark mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-text dark:text-dark-text">Check your email</h3>
                    <p className="text-sm text-text-light dark:text-dark-text-muted mt-1">
                      We&apos;ve sent you a confirmation link. Please check your inbox to verify your account.
                    </p>
                  </div>
                </div>
              </div>
            )}

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
                Create your account
              </h2>
              <p className="text-text-light dark:text-dark-text-muted mb-8">
                Already have an account?{' '}
                <Link href="/auth/login" className="font-semibold text-primary hover:text-primary-dark transition-colors">
                  Sign in
                </Link>
              </p>

              <form className="space-y-5" action={handleSignup}>
                {/* Invite Code */}
                <div>
                  <label htmlFor="inviteCode" className="block text-sm font-semibold text-text dark:text-dark-text mb-2">
                    Invite Code *
                  </label>
                  <input
                    id="inviteCode"
                    name="inviteCode"
                    type="text"
                    required
                    defaultValue={preValidatedCode}
                    placeholder="XXXX-XXXX"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-text dark:text-dark-text placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-white dark:focus:bg-dark-surface transition-all uppercase tracking-widest font-mono text-center text-lg"
                  />
                  <p className="text-xs text-text-light dark:text-dark-text-muted mt-1.5">
                    Don&apos;t have a code?{' '}
                    <Link href="/waitlist" className="text-primary hover:underline">
                      Join the waitlist
                    </Link>
                  </p>
                </div>

                <hr className="border-gray-200 dark:border-dark-border" />

                {/* Email */}
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

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-text dark:text-dark-text mb-2">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={6}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-text dark:text-dark-text placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-white dark:focus:bg-dark-surface transition-all"
                    placeholder="At least 6 characters"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-all shadow-sm hover:shadow-md"
                >
                  Create Account
                </button>
              </form>

              <p className="mt-6 text-xs text-center text-text-light dark:text-dark-text-muted">
                By signing up, you agree to our terms of service and privacy policy.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

