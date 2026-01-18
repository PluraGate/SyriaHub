'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, User, Building, MessageSquare, Loader2, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useTranslations } from 'next-intl'

interface WaitlistFormProps {
    onSuccess?: () => void
}

export function WaitlistForm({ onSuccess }: WaitlistFormProps) {
    const t = useTranslations('Waitlist')
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
                    {t('onTheList')}
                </h3>
                <div className="text-text-light dark:text-dark-text-muted mb-6">
                    {t.rich('successNotification', {
                        email: email,
                        bold: (chunks) => <strong className="font-semibold text-text dark:text-dark-text">{chunks}</strong>
                    })}
                </div>
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
                    {t('email')} *
                </label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-light dark:text-dark-text-muted" />
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder={t('placeholders.email')}
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg text-text dark:text-dark-text placeholder:text-text-light/50 dark:placeholder:text-dark-text-muted/50 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                </div>
            </div>

            {/* Name */}
            <div>
                <label className="block text-sm font-medium text-text dark:text-dark-text mb-1.5">
                    {t('fullName')}
                </label>
                <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-light dark:text-dark-text-muted" />
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={t('placeholders.name')}
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg text-text dark:text-dark-text placeholder:text-text-light/50 dark:placeholder:text-dark-text-muted/50 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                </div>
            </div>

            {/* Affiliation */}
            <div>
                <label className="block text-sm font-medium text-text dark:text-dark-text mb-1.5">
                    {t('organization')}
                </label>
                <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-light dark:text-dark-text-muted" />
                    <input
                        type="text"
                        value={affiliation}
                        onChange={(e) => setAffiliation(e.target.value)}
                        placeholder={t('placeholders.org')}
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg text-text dark:text-dark-text placeholder:text-text-light/50 dark:placeholder:text-dark-text-muted/50 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                </div>
            </div>

            {/* Reason */}
            <div>
                <label className="block text-sm font-medium text-text dark:text-dark-text mb-1.5">
                    {t('whyJoin')}
                </label>
                <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-text-light dark:text-dark-text-muted" />
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder={t('placeholders.reason')}
                        rows={3}
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg text-text dark:text-dark-text placeholder:text-text-light/50 dark:placeholder:text-dark-text-muted/50 focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                    />
                </div>
            </div>

            {/* Referral Source */}
            <div>
                <label className="block text-sm font-medium text-text dark:text-dark-text mb-1.5">
                    {t('referralSource')}
                </label>
                <Select value={referralSource} onValueChange={setReferralSource}>
                    <SelectTrigger className="w-full bg-white dark:bg-dark-bg">
                        <SelectValue placeholder={t('referralOptions.placeholder')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="colleague">{t('referralOptions.colleague')}</SelectItem>
                        <SelectItem value="social_media">{t('referralOptions.social_media')}</SelectItem>
                        <SelectItem value="search">{t('referralOptions.search')}</SelectItem>
                        <SelectItem value="conference">{t('referralOptions.conference')}</SelectItem>
                        <SelectItem value="other">{t('referralOptions.other')}</SelectItem>
                    </SelectContent>
                </Select>
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
                        {t('joining')}
                    </>
                ) : (
                    <>
                        {t('joinWaitlist')}
                        <ArrowRight className="w-4 h-4" />
                    </>
                )}
            </Button>

            <p className="text-center text-sm text-text-light dark:text-dark-text-light">
                {t('alreadyHaveCode')}{' '}
                <Link href="/auth/signup" className="text-primary dark:text-primary-light hover:underline font-medium">
                    {t('signUpHere')}
                </Link>
            </p>
        </form>
    )
}
