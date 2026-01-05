'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, CheckCircle, Lock, Loader2 } from 'lucide-react'

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    async function handleResetPassword(e: React.FormEvent) {
        e.preventDefault()
        setError(null)

        if (password.length < 8) {
            setError('Password must be at least 8 characters')
            return
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        setLoading(true)

        try {
            const { error } = await supabase.auth.updateUser({
                password: password,
            })

            if (error) {
                setError(error.message)
                setLoading(false)
                return
            }

            setSuccess(true)

            // Redirect to login after 3 seconds
            setTimeout(() => {
                router.push('/auth/login')
            }, 3000)
        } catch (err) {
            setError('An unexpected error occurred')
            setLoading(false)
        }
    }

    if (success) {
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

    return (
        <div className="min-h-screen flex flex-col bg-background dark:bg-dark-bg">
            <Navbar />

            <main className="flex-1 flex items-center justify-center px-6 py-12">
                <div className="w-full max-w-md">
                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 rounded-2xl bg-accent/10 border border-accent/20">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-accent mt-0.5" />
                                <div>
                                    <h3 className="font-semibold text-text dark:text-dark-text">Error</h3>
                                    <p className="text-sm text-text-light dark:text-dark-text-muted mt-1">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Form Card */}
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

                        <form onSubmit={handleResetPassword} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="password">New password</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="At least 8 characters"
                                    required
                                    minLength={8}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm password</Label>
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Re-enter your password"
                                    required
                                />
                            </div>

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                {loading ? 'Updating...' : 'Update password'}
                            </Button>
                        </form>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
