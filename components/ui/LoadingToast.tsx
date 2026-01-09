'use client'

import { useEffect, useState, useRef } from 'react'
import { Loader2, CheckCircle2, XCircle, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export type LoadingToastStatus = 'loading' | 'success' | 'error' | 'idle'

interface LoadingToastProps {
    status: LoadingToastStatus
    message?: string
    duration?: number // Auto-dismiss duration in ms (default: 3000 for success/error)
    onClose?: () => void
}

/**
 * Non-intrusive loading toast that appears in the top-right corner.
 * Shows only after 1 second of loading to avoid flash for quick operations.
 */
export function LoadingToast({
    status,
    message,
    duration = 3000,
    onClose
}: LoadingToastProps) {
    const [visible, setVisible] = useState(false)
    const [shouldRender, setShouldRender] = useState(false)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)
    const showDelayRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        // Clear any existing timeouts
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        if (showDelayRef.current) clearTimeout(showDelayRef.current)

        if (status === 'loading') {
            // Show after 1 second delay to avoid flash for quick operations
            showDelayRef.current = setTimeout(() => {
                setShouldRender(true)
                // Small delay for animation
                requestAnimationFrame(() => setVisible(true))
            }, 1000)
        } else if (status === 'success' || status === 'error') {
            // Show immediately for success/error
            // Wrap in timeout to avoid setting state synchronously in effect
            timeoutRef.current = setTimeout(() => {
                setShouldRender(true)
                requestAnimationFrame(() => setVisible(true))

                // Auto dismiss after duration
                timeoutRef.current = setTimeout(() => {
                    setVisible(false)
                    setTimeout(() => {
                        setShouldRender(false)
                        onClose?.()
                    }, 300) // Wait for exit animation
                }, duration)
            }, 0)
        } else {
            // Idle - hide
            // Wrap in timeout to avoid setting state synchronously in effect
            timeoutRef.current = setTimeout(() => {
                setVisible(false)
                setTimeout(() => setShouldRender(false), 300)
            }, 0)
        }

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
            if (showDelayRef.current) clearTimeout(showDelayRef.current)
        }
    }, [status, duration, onClose])

    if (!shouldRender) return null

    const Icon = status === 'loading'
        ? Loader2
        : status === 'success'
            ? CheckCircle2
            : XCircle

    const defaultMessages = {
        loading: 'Working...',
        success: 'Done!',
        error: 'Something went wrong',
        idle: ''
    }

    return (
        <div
            className={cn(
                'fixed top-20 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border transition-all duration-300',
                'bg-white dark:bg-dark-surface border-gray-200 dark:border-dark-border',
                visible
                    ? 'opacity-100 translate-x-0'
                    : 'opacity-0 translate-x-4'
            )}
        >
            <Icon
                className={cn(
                    'w-5 h-5 flex-shrink-0',
                    status === 'loading' && 'animate-spin text-primary',
                    status === 'success' && 'text-green-500',
                    status === 'error' && 'text-red-500'
                )}
            />
            <span className="text-sm font-medium text-text dark:text-dark-text">
                {message || defaultMessages[status]}
            </span>
            {status !== 'loading' && (
                <button
                    onClick={() => {
                        setVisible(false)
                        setTimeout(() => {
                            setShouldRender(false)
                            onClose?.()
                        }, 300)
                    }}
                    className="p-1 -mr-1 rounded-md hover:bg-gray-100 dark:hover:bg-dark-border transition-colors"
                >
                    <X className="w-4 h-4 text-text-light dark:text-dark-text-muted" />
                </button>
            )}
        </div>
    )
}

/**
 * Hook to manage loading toast state
 */
export function useLoadingToast() {
    const [toastState, setToastState] = useState<{
        status: LoadingToastStatus
        message?: string
    }>({ status: 'idle' })

    const startLoading = (message?: string) => {
        setToastState({ status: 'loading', message })
    }

    const showSuccess = (message?: string) => {
        setToastState({ status: 'success', message })
    }

    const showError = (message?: string) => {
        setToastState({ status: 'error', message })
    }

    const reset = () => {
        setToastState({ status: 'idle' })
    }

    return {
        ...toastState,
        startLoading,
        showSuccess,
        showError,
        reset,
    }
}
