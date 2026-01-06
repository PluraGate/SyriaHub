import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, CheckCircle, ArrowLeft, Mail } from 'lucide-react'
import { logAuthEvent } from '@/lib/auditLog'

export default async function ForgotPasswordPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string; success?: string }>
}) {
    const params = await searchParams
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
        redirect('/insights')
    }

    async function handleResetRequest(formData: FormData) {
        'use server'

        const email = formData.get('email') as string

        if (!email) {
            redirect('/auth/forgot-password?error=Email is required')
        }

        const supabase = await createClient()
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${siteUrl}/auth/reset-password`,
        })

        // Log the password reset request
        await logAuthEvent('password_reset_requested', null, { email })

        if (error) {
            console.error('Password reset error:', error)
            redirect(`/auth/forgot-password?error=${error.message}`)
        }

        // Always show success message (even if email doesn't exist - security best practice)
        redirect('/auth/forgot-password?success=true')
    }

    return (
        <div className="min-h-screen flex flex-col bg-background dark:bg-dark-bg">
            <Navbar user={null} />

            <main className="flex-1 flex items-center justify-center px-6 py-12">
                <div className="w-full max-w-md">
                    {/* Back Link */}
                    <Link
                        href="/auth/login"
                        className="inline-flex items-center gap-2 text-sm text-text-light dark:text-dark-text-muted hover:text-primary transition-colors mb-8"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to login
                    </Link>

                    {/* Success Message */}
                    {params.success && (
                        <div className="mb-6 p-4 rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                            <div className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                                <div>
                                    <h3 className="font-semibold text-green-800 dark:text-green-300">Check your email</h3>
                                    <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                                        If an account exists with that email, we&apos;ve sent a password reset link.
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
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-6">
                            <Mail className="w-6 h-6 text-primary" />
                        </div>

                        <h2 className="text-2xl font-bold text-text dark:text-dark-text mb-2">
                            Forgot your password?
                        </h2>
                        <p className="text-text-light dark:text-dark-text-muted mb-8">
                            Enter your email address and we&apos;ll send you a link to reset your password.
                        </p>

                        <form action={handleResetRequest} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email address</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    required
                                    autoComplete="email"
                                />
                            </div>

                            <Button type="submit" className="w-full">
                                Send reset link
                            </Button>
                        </form>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
