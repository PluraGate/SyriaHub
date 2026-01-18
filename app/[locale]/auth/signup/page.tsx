import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { SignupForm } from '@/components/auth/SignupForm'
import { verifyTurnstileToken } from '@/lib/turnstile'
import { getTranslations } from 'next-intl/server'
import { CheckCircle2, AlertCircle, Sparkles, Users, BookOpen, Ticket, Gift } from 'lucide-react'
import Image from 'next/image'

export default async function SignupPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ error?: string; success?: string; code?: string; email?: string }>
}) {
  const { locale } = await params
  const search = await searchParams
  const t = await getTranslations({ locale, namespace: 'Auth.signupPage' })
  const ta = await getTranslations({ locale, namespace: 'Auth' })
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/insights')
  }

  // Pre-validate invite code if provided in URL
  let preValidatedCode = ''
  let inviterName = ''
  if (search.code) {
    const { data } = await supabase.rpc('validate_invite_code', {
      p_code: search.code.toUpperCase().trim(),
    })
    if (data?.valid) {
      preValidatedCode = search.code.toUpperCase().trim()
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
    const turnstileToken = formData.get('cf-turnstile-response') as string

    // Verify CAPTCHA if configured
    const captchaValid = await verifyTurnstileToken(turnstileToken)
    if (!captchaValid) {
      redirect(`/${locale}/auth/signup?error=${encodeURIComponent('Security verification failed. Please try again.')}`)
    }

    if (!email || !password) {
      redirect(`/${locale}/auth/signup?error=${encodeURIComponent('Email and password are required')}`)
    }

    if (!inviteCode) {
      redirect(`/${locale}/auth/signup?error=${encodeURIComponent('Invite code is required')}`)
    }

    if (password.length < 6) {
      redirect(`/${locale}/auth/signup?error=${encodeURIComponent('Password must be at least 6 characters')}`)
    }

    const supabase = await createClient()

    // Validate invite code first
    const { data: inviteValidation, error: inviteError } = await supabase.rpc('validate_invite_code', {
      p_code: inviteCode.toUpperCase().trim(),
    })

    if (inviteError || !inviteValidation?.valid) {
      redirect(`/${locale}/auth/signup?error=${encodeURIComponent(inviteValidation?.error || 'Invalid invite code')}`)
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
      redirect(`/${locale}/auth/signup?error=${encodeURIComponent(error.message)}&code=${encodeURIComponent(inviteCode)}`)
    }

    // Mark invite as used
    if (data.user) {
      await supabase.rpc('use_invite_code', {
        p_code: inviteCode.toUpperCase().trim(),
        p_user_id: data.user.id,
      })
    }

    if (data.user && !data.session) {
      redirect(`/${locale}/auth/signup?success=${encodeURIComponent('check-email')}`)
    }

    if (data.session) {
      redirect(`/${locale}/insights`)
    }

    redirect(`/${locale}/auth/signup?success=${encodeURIComponent('check-email')}`)
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
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center overflow-hidden">
                <Image src="/icons/icon-512x512.png" alt="SyriaHub" width={40} height={40} className="object-contain" />
              </div>
              <span className="font-bold text-2xl text-white">SyriaHub</span>
            </Link>

            <h1 className="text-4xl font-bold text-white mb-4">
              {t('joinTitle')}
            </h1>
            <p className="text-xl text-white/80 mb-12 max-w-md">
              {t('joinSubtitle')}
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Ticket className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{t('inviteRequiredTitle')}</h3>
                  <p className="text-sm text-white/70">{t('inviteRequiredDesc')}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{t('qualityCommunityTitle')}</h3>
                  <p className="text-sm text-white/70">{t('qualityCommunityDesc')}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Gift className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{t('payItForwardTitle')}</h3>
                  <p className="text-sm text-white/70">{t('payItForwardDesc')}</p>
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
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center overflow-hidden">
                  <Image src="/icons/icon-512x512.png" alt="SyriaHub" width={32} height={32} className="object-contain" />
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
                    {t.rich('invitedBy', {
                      name: (chunks) => <strong>{chunks}</strong>,
                      name_val: inviterName
                    })}
                  </p>
                </div>
              </div>
            )}

            {/* Success Message */}
            {search.success === 'check-email' && (
              <div className="mb-6 p-4 rounded-2xl bg-secondary/10 border border-secondary/20">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-secondary-dark mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-text dark:text-dark-text">{t('checkEmailTitle')}</h3>
                    <p className="text-sm text-text-light dark:text-dark-text-muted mt-1">
                      {t('checkEmailDesc')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {search.error && (
              <div className="mb-6 p-4 rounded-2xl bg-accent/10 border border-accent/20">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-accent mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-text dark:text-dark-text">{t('errorTitle')}</h3>
                    <p className="text-sm text-text-light dark:text-dark-text-muted mt-1">{search.error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Form Card - Only show if not success */}
            {search.success !== 'check-email' && (
              <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-200 dark:border-dark-border p-8">
                <h2 className="text-2xl font-bold text-text dark:text-dark-text mb-2">
                  {t('createAccountTitle')}
                </h2>
                <p className="text-text-light dark:text-dark-text/90 mb-8">
                  {t('alreadyHaveAccount')}{' '}
                  <Link href="/auth/login" className="font-semibold text-primary dark:text-secondary-dark hover:text-primary-dark dark:hover:text-secondary transition-colors">
                    {ta('login')}
                  </Link>
                </p>

                <SignupForm preValidatedCode={preValidatedCode} preFilledEmail={search.email || ''} action={handleSignup} />

                <p className="mt-6 text-xs text-center text-text-light dark:text-dark-text/70">
                  {t('termsAgreeLong')}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

