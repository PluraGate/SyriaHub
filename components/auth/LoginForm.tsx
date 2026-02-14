'use client'

import { useState } from 'react'
import { Turnstile } from '@/components/ui/Turnstile'

interface LoginFormProps {
    action: (formData: FormData) => Promise<void>
}

export function LoginForm({ action }: LoginFormProps) {
    const [turnstileToken, setTurnstileToken] = useState<string>('')
    const [captchaError, setCaptchaError] = useState(false)
    const [rememberMe, setRememberMe] = useState(true)

    const handleSubmit = async (formData: FormData) => {
        // Add turnstile token to form data
        if (turnstileToken) {
            formData.append('cf-turnstile-response', turnstileToken)
        }

        // Add remember-me preference
        formData.append('rememberMe', rememberMe ? 'true' : 'false')

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

            {/* Stay signed in */}
            <div className="flex items-center gap-2">
                <input
                    id="rememberMe"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 dark:border-dark-border text-primary focus:ring-primary/20 accent-primary cursor-pointer"
                />
                <label
                    htmlFor="rememberMe"
                    className="text-sm text-text-light dark:text-dark-text-muted select-none cursor-pointer"
                >
                    Stay signed in
                </label>
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
                    Please complete the security check
                </p>
            )}

            <button
                type="submit"
                className="w-full py-3.5 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-all shadow-sm hover:shadow-md"
            >
                Sign In
            </button>
        </form>
    )
}
