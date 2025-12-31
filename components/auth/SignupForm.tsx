'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Turnstile } from '@/components/ui/Turnstile'
import { useTranslations } from 'next-intl'

interface SignupFormProps {
    preValidatedCode: string
    action: (formData: FormData) => Promise<void>
}

export function SignupForm({ preValidatedCode, action }: SignupFormProps) {
    const [turnstileToken, setTurnstileToken] = useState<string>('')
    const [captchaError, setCaptchaError] = useState(false)
    const t = useTranslations('Auth.signupPage')
    const ta = useTranslations('Auth')

    const handleSubmit = async (formData: FormData) => {
        // Add turnstile token to form data
        if (turnstileToken) {
            formData.append('cf-turnstile-response', turnstileToken)
        }

        // Check if CAPTCHA is required (only if env var is set)
        const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
        if (siteKey && !turnstileToken) {
            setCaptchaError(true)
            return
        }

        setCaptchaError(false)
        await action(formData)
    }

    return (
        <form className="space-y-5" action={handleSubmit}>
            {/* Invite Code */}
            <div>
                <label htmlFor="inviteCode" className="block text-sm font-semibold text-text dark:text-dark-text mb-2">
                    {ta('inviteCode')} *
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
                    {t('dontHaveCode')}{' '}
                    <Link href="/waitlist" className="text-primary hover:underline">
                        {t('waitlistLink')}
                    </Link>
                </p>
            </div>

            <hr className="border-gray-200 dark:border-dark-border" />

            {/* Email */}
            <div>
                <label htmlFor="email" className="block text-sm font-semibold text-text dark:text-dark-text mb-2">
                    {t('emailAddress')}
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
                    {ta('password')}
                </label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={6}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-text dark:text-dark-text placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-white dark:focus:bg-dark-surface transition-all"
                    placeholder={t('atLeast6Chars')}
                />
            </div>

            {/* Turnstile CAPTCHA */}
            <div className="flex justify-center">
                <Turnstile
                    onSuccess={(token) => {
                        setTurnstileToken(token)
                        setCaptchaError(false)
                    }}
                    onExpire={() => setTurnstileToken('')}
                    onError={() => setTurnstileToken('')}
                />
            </div>

            {captchaError && (
                <p className="text-sm text-red-500 text-center">
                    {t('securityCheckError')}
                </p>
            )}

            <button
                type="submit"
                className="w-full py-3.5 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-all shadow-sm hover:shadow-md"
            >
                {ta('createAccount')}
            </button>
        </form>
    )
}
