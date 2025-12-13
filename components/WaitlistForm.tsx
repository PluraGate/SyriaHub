'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, User, Building, MessageSquare, Loader2, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface WaitlistFormProps {
    onSuccess?: () => void
}

export function WaitlistForm({ onSuccess }: WaitlistFormProps) {
    const [email, setEmail] = useState('')
    const [name, setName] = useState('')
    const [affiliation, setAffiliation] = useState('')
    const [reason, setReason] = useState('')
    const [referralSource, setReferralSource] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const response = await fetch('/api/waitlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    name,
                    affiliation,
                    reason,
                    referralSource,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to join waitlist')
            }

            setSuccess(true)
            onSuccess?.()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-text dark:text-dark-text mb-2">
                    You're on the list!
                </h3>
                <p className="text-text-light dark:text-dark-text-muted mb-6">
                    We'll notify you at <strong>{email}</strong> when a spot opens up.
                </p>
                <p className="text-sm text-text-light dark:text-dark-text-muted">
                    Already have an invite code?{' '}
                    <Link href="/auth/signup" className="text-primary hover:underline">
                        Sign up here
                    </Link>
                </p>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                </div>
            )}

            {/* Email */}
            <div>
                <label className="block text-sm font-medium text-text dark:text-dark-text mb-1.5">
                    Email *
                </label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-light dark:text-dark-text-muted" />
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="researcher@university.edu"
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg text-text dark:text-dark-text placeholder:text-text-light/50 dark:placeholder:text-dark-text-muted/50 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                </div>
            </div>

            {/* Name */}
            <div>
                <label className="block text-sm font-medium text-text dark:text-dark-text mb-1.5">
                    Full Name
                </label>
                <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-light dark:text-dark-text-muted" />
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Dr. Jane Smith"
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg text-text dark:text-dark-text placeholder:text-text-light/50 dark:placeholder:text-dark-text-muted/50 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                </div>
            </div>

            {/* Affiliation */}
            <div>
                <label className="block text-sm font-medium text-text dark:text-dark-text mb-1.5">
                    University / Organization
                </label>
                <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-light dark:text-dark-text-muted" />
                    <input
                        type="text"
                        value={affiliation}
                        onChange={(e) => setAffiliation(e.target.value)}
                        placeholder="Damascus University"
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg text-text dark:text-dark-text placeholder:text-text-light/50 dark:placeholder:text-dark-text-muted/50 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                </div>
            </div>

            {/* Reason */}
            <div>
                <label className="block text-sm font-medium text-text dark:text-dark-text mb-1.5">
                    Why do you want to join?
                </label>
                <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-text-light dark:text-dark-text-muted" />
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Tell us about your research interests..."
                        rows={3}
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg text-text dark:text-dark-text placeholder:text-text-light/50 dark:placeholder:text-dark-text-muted/50 focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                    />
                </div>
            </div>

            {/* Referral Source */}
            <div>
                <label className="block text-sm font-medium text-text dark:text-dark-text mb-1.5">
                    How did you hear about us?
                </label>
                <select
                    value={referralSource}
                    onChange={(e) => setReferralSource(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg text-text dark:text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                >
                    <option value="">Select an option</option>
                    <option value="colleague">Colleague / Friend</option>
                    <option value="social_media">Social Media</option>
                    <option value="search">Search Engine</option>
                    <option value="conference">Conference / Event</option>
                    <option value="other">Other</option>
                </select>
            </div>

            {/* Submit */}
            <Button
                type="submit"
                disabled={loading || !email}
                className="w-full py-3 gap-2"
            >
                {loading ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Joining waitlist...
                    </>
                ) : (
                    <>
                        Join Waitlist
                        <ArrowRight className="w-4 h-4" />
                    </>
                )}
            </Button>

            <p className="text-center text-sm text-text-light dark:text-dark-text-muted">
                Already have an invite code?{' '}
                <Link href="/auth/signup" className="text-primary hover:underline font-medium">
                    Sign up here
                </Link>
            </p>
        </form>
    )
}
