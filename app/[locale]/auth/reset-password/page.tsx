'use client'

export const dynamic = 'force-dynamic'

import { useActionState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { handlePasswordReset } from './actions'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, CheckCircle, Lock, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

const initialState = { error: null, success: false }

export default function ResetPasswordPage() {
    const router = useRouter()
    const [state, formAction, isPending] = useActionState(handlePasswordReset, initialState)
    const t = useTranslations('Auth')
    const tCommon = useTranslations('Common')

    useEffect(() => {
        if (state.success) {
            const timer = setTimeout(() => {
                router.push('/auth/login')
            }, 3000)
            return () => clearTimeout(timer)
        }
    }, [state.success, router])

    if (state.success) {
        return (
            <div className="min-h-screen flex flex-col bg-background dark:bg-dark-bg">
                <Navbar />
                <main className="flex-1 flex items-center justify-center px-6 py-12">
                    <div className="w-full max-w-md text-center">
                        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-text dark:text-dark-text mb-2">
                            Password updated!
                        </h2>
                        <p className="text-text-light dark:text-dark-text-muted mb-6">
                            Your password has been successfully reset. Redirecting to login...
                        </p>
                        <Link href="/auth/login">
                            <Button>Go to login</Button>
                        </Link>
                    </div>
                </main>
                <Footer />
            </div>
        )
    }

    // Detect expired/missing session error to show a helpful recovery message
    const isExpiredLink = state.error?.toLowerCase().includes('expired') ||
        state.error?.toLowerCase().includes('invalid') ||
        state.error?.toLowerCase().includes('session')

    return (
        <div className="min-h-screen flex flex-col bg-background dark:bg-dark-bg">
            <Navbar />

            <main className="flex-1 flex items-center justify-center px-6 py-12">
                <div className="w-full max-w-md">
                    {state.error && (
                        <div className="mb-6 p-4 rounded-2xl bg-accent/10 border border-accent/20">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                                <div>
                                    <h3 className="font-semibold text-text dark:text-dark-text">Error</h3>
                                    <p className="text-sm text-text-light dark:text-dark-text-muted mt-1">{state.error}</p>
                                    {isExpiredLink && (
                                        <Link
                                            href="/auth/forgot-password"
                                            className="inline-block mt-2 text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
                                        >
                                            Request a new reset link
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-200 dark:border-dark-border p-8">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-6">
                            <Lock className="w-6 h-6 text-primary" />
                        </div>

                        <h2 className="text-2xl font-bold text-text dark:text-dark-text mb-2">
                            Set new password
                        </h2>
                        <p className="text-text-light dark:text-dark-text-muted mb-8">
                            Enter your new password below.
                        </p>

                        <form action={formAction} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="password">New password</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder={t('passwordRequirements')}
                                    required
                                    minLength={8}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    placeholder={t('confirmPassword')}
                                    required
                                />
                            </div>

                            <Button type="submit" className="w-full" disabled={isPending}>
                                {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                {isPending ? tCommon('updating') : t('updatePassword')}
                            </Button>
                        </form>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
