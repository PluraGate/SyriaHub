'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home, ArrowLeft, WifiOff, ShieldX, FileX } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorBoundaryProps {
    children: ReactNode
    fallback?: ReactNode
    onReset?: () => void
}

interface ErrorBoundaryState {
    hasError: boolean
    error: Error | null
    errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props)
        this.state = { hasError: false, error: null, errorInfo: null }
    }

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Error caught by boundary:', error, errorInfo)
        this.setState({ errorInfo })

        // Optional: Send to error tracking service
        // logErrorToService(error, errorInfo)
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null })
        this.props.onReset?.()
    }

    handleReload = () => {
        window.location.reload()
    }

    handleGoHome = () => {
        window.location.href = '/feed'
    }

    handleGoBack = () => {
        window.history.back()
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback
            }

            return (
                <ErrorFallback
                    error={this.state.error}
                    onRetry={this.handleReset}
                    onReload={this.handleReload}
                    onGoHome={this.handleGoHome}
                    onGoBack={this.handleGoBack}
                />
            )
        }

        return this.props.children
    }
}

// Error type detection
type ErrorType = 'network' | 'auth' | 'notFound' | 'generic'

function detectErrorType(error: Error | null | any): ErrorType {
    if (!error) return 'generic'

    // Safeguard against non-standard error objects
    const message = error.message ? String(error.message).toLowerCase() : ''
    const name = error.name ? String(error.name).toLowerCase() : ''

    if (message.includes('network') || message.includes('fetch') || message.includes('failed to load')) {
        return 'network'
    }
    if (message.includes('unauthorized') || message.includes('403') || message.includes('401') || message.includes('auth')) {
        return 'auth'
    }
    if (message.includes('not found') || message.includes('404')) {
        return 'notFound'
    }
    return 'generic'
}

interface ErrorFallbackProps {
    error: Error | null
    onRetry?: () => void
    onReload?: () => void
    onGoHome?: () => void
    onGoBack?: () => void
}

function ErrorFallback({ error, onRetry, onReload, onGoHome, onGoBack }: ErrorFallbackProps) {
    const errorType = detectErrorType(error)

    const errorConfig = {
        network: {
            icon: WifiOff,
            title: 'Connection Lost',
            description: 'It seems you are offline. Check your internet connection and try again.',
            color: 'text-amber-500',
            bgGradient: 'from-amber-500/20 to-orange-500/5',
            borderColor: 'border-amber-200 dark:border-amber-900/30',
        },
        auth: {
            icon: ShieldX,
            title: 'Access Restricted',
            description: "You don't have permission to access this area. Please sign in or contact an administrator.",
            color: 'text-red-500',
            bgGradient: 'from-red-500/20 to-rose-500/5',
            borderColor: 'border-red-200 dark:border-red-900/30',
        },
        notFound: {
            icon: FileX,
            title: 'Page Not Found',
            description: "The page you're looking for doesn't exist or has been moved.",
            color: 'text-blue-500',
            bgGradient: 'from-blue-500/20 to-cyan-500/5',
            borderColor: 'border-blue-200 dark:border-blue-900/30',
        },
        generic: {
            icon: AlertTriangle,
            title: 'Something Went Wrong',
            description: 'We encountered an unexpected error. Our team has been notified.',
            color: 'text-rose-500',
            bgGradient: 'from-rose-500/20 to-pink-500/5',
            borderColor: 'border-rose-200 dark:border-rose-900/30',
        },
    }

    const config = errorConfig[errorType]
    const Icon = config.icon

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50/50 dark:bg-dark-bg relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-grid-slate-900/[0.04] dark:bg-grid-slate-100/[0.04] [mask-image:radial-gradient(ellipse_at_center,black_70%,transparent_100%)] pointer-events-none" />

            <div className="relative max-w-lg w-full text-center">
                {/* Main Card */}
                <div className="bg-white dark:bg-dark-surface/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-gray-200/50 dark:shadow-black/20 border border-gray-200 dark:border-dark-border p-8 md:p-12 overflow-hidden">

                    {/* Decorative Background Blob */}
                    <div className={`absolute top-0 inset-x-0 h-32 bg-gradient-to-b ${config.bgGradient} opacity-30`} />

                    {/* Icon Halo */}
                    <div className="relative mb-8 inline-flex">
                        <div className={`absolute inset-0 ${config.color} blur-2xl opacity-20 transform scale-150 animate-pulse`} />
                        <div className={`relative px-6 py-6 rounded-2xl bg-white dark:bg-dark-bg border ${config.borderColor} shadow-sm z-10`}>
                            <Icon className={`w-12 h-12 ${config.color}`} />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="relative z-10 space-y-4">
                        <h2 className="text-3xl md:text-4xl font-display font-bold text-text dark:text-dark-text tracking-tight">
                            {config.title}
                        </h2>

                        <p className="text-lg text-text-light dark:text-dark-text-muted leading-relaxed max-w-sm mx-auto">
                            {config.description}
                        </p>

                        {/* Actions */}
                        <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
                            {onRetry && (
                                <Button
                                    onClick={onRetry}
                                    size="lg"
                                    className="w-full sm:w-auto min-w-[140px] font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                                >
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Try Again
                                </Button>
                            )}

                            <div className="flex gap-4 w-full sm:w-auto">
                                {onGoBack && (
                                    <Button
                                        variant="outline"
                                        onClick={onGoBack}
                                        size="lg"
                                        className="flex-1 sm:flex-none border-gray-200 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-bg"
                                    >
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Back
                                    </Button>
                                )}
                                {onGoHome && (
                                    <Button
                                        variant="ghost"
                                        onClick={onGoHome}
                                        size="lg"
                                        className="flex-1 sm:flex-none text-text-light dark:text-dark-text-muted hover:text-primary dark:hover:text-primary-light"
                                    >
                                        <Home className="w-4 h-4 mr-2" />
                                        Home
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Technical Details (Toggle) */}
                    {error && process.env.NODE_ENV === 'development' && (
                        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-dark-border/50 relative z-10">
                            <details className="group text-left">
                                <summary className="flex items-center justify-center gap-2 cursor-pointer text-xs font-medium text-text-light dark:text-dark-text-muted uppercase tracking-wider hover:text-primary transition-colors p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-bg/50 w-fit mx-auto">
                                    <ShieldX className="w-3.5 h-3.5" />
                                    Technical Details
                                </summary>
                                <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <pre className="p-4 bg-gray-50 dark:bg-dark-bg rounded-xl border border-gray-100 dark:border-dark-border overflow-x-auto text-xs font-mono leading-relaxed text-left shadow-inner">
                                        <code className="block text-rose-600 dark:text-rose-400 break-words whitespace-pre-wrap">
                                            <span className="font-bold">{error.name}:</span> {error.message}
                                            {error.stack && (
                                                <span className="text-text-muted dark:text-dark-text-muted/70 mt-2 block border-t border-dashed border-gray-200 dark:border-dark-border pt-2">
                                                    {error.stack}
                                                </span>
                                            )}
                                        </code>
                                    </pre>
                                </div>
                            </details>
                        </div>
                    )}
                </div>

                {/* Footer Message */}
                <p className="mt-8 text-sm text-text-light dark:text-dark-text-muted">
                    Need help? <a href="mailto:support@syrealize.com" className="text-primary hover:underline font-medium">Contact Support</a>
                </p>
            </div>
        </div>
    )
}

// Simple inline error display for smaller components
interface InlineErrorProps {
    message: string
    onRetry?: () => void
}

export function InlineError({ message, onRetry }: InlineErrorProps) {
    return (
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-300 flex-1">{message}</p>
            {onRetry && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onRetry}
                    className="text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/30"
                >
                    <RefreshCw className="w-4 h-4" />
                </Button>
            )}
        </div>
    )
}

// Loading error state for async operations
interface LoadingErrorProps {
    title?: string
    message?: string
    onRetry?: () => void
}

export function LoadingError({
    title = 'Failed to load',
    message = 'Something went wrong while loading this content.',
    onRetry
}: LoadingErrorProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-3xl bg-gray-50/50 dark:bg-dark-surface/50 border border-gray-100 dark:border-dark-border/50">
            <div className="w-16 h-16 mb-4 rounded-2xl bg-white dark:bg-dark-bg border border-gray-100 dark:border-dark-border shadow-sm flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-rose-500" />
            </div>
            <h3 className="text-lg font-bold text-text dark:text-dark-text mb-2">{title}</h3>
            <p className="text-sm text-text-light dark:text-dark-text-muted mb-6 max-w-xs">{message}</p>
            {onRetry && (
                <Button variant="outline" onClick={onRetry} className="gap-2 bg-white dark:bg-dark-bg hover:bg-gray-50 dark:hover:bg-dark-surface border-gray-200 dark:border-dark-border">
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                </Button>
            )}
        </div>
    )
}

export { ErrorFallback }
