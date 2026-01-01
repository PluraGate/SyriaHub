'use client'

import { Turnstile as TurnstileWidget, TurnstileInstance } from '@marsidev/react-turnstile'
import { useRef, forwardRef, useImperativeHandle } from 'react'
import { useTheme } from 'next-themes'

export interface TurnstileRef {
    reset: () => void
    getToken: () => string | undefined
}

interface TurnstileProps {
    onSuccess?: (token: string) => void
    onError?: () => void
    onExpire?: () => void
    className?: string
}

const Turnstile = forwardRef<TurnstileRef, TurnstileProps>(
    ({ onSuccess, onError, onExpire, className }, ref) => {
        const turnstileRef = useRef<TurnstileInstance>(null)
        const tokenRef = useRef<string | undefined>(undefined)
        const { theme } = useTheme()

        useImperativeHandle(ref, () => ({
            reset: () => {
                turnstileRef.current?.reset()
                tokenRef.current = undefined
            },
            getToken: () => tokenRef.current
        }))

        const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

        // In development without keys, skip rendering
        if (!siteKey) {
            console.warn('Turnstile: NEXT_PUBLIC_TURNSTILE_SITE_KEY not set')
            return null
        }

        return (
            <div className={className}>
                <TurnstileWidget
                    ref={turnstileRef}
                    siteKey={siteKey}
                    options={{
                        theme: theme === 'dark' ? 'dark' : 'light',
                        size: 'normal'
                    }}
                    onSuccess={(token) => {
                        tokenRef.current = token
                        onSuccess?.(token)
                    }}
                    onError={() => {
                        tokenRef.current = undefined
                        onError?.()
                    }}
                    onExpire={() => {
                        tokenRef.current = undefined
                        onExpire?.()
                    }}
                />
            </div>
        )
    }
)

Turnstile.displayName = 'Turnstile'

export { Turnstile }
