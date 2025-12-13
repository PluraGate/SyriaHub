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

function detectErrorType(error: Error | null): ErrorType {
    if (!error) return 'generic'

    const message = error.message.toLowerCase()
    const name = error.name.toLowerCase()

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
            title: 'Connection Error',
            description: 'Unable to connect. Please check your internet connection and try again.',
            color: 'text-amber-500',
            bgColor: 'bg-amber-500/10',
        },
        auth: {
            icon: ShieldX,
            title: 'Access Denied',
            description: "You don't have permission to view this content. Please sign in or contact support.",
            color: 'text-red-500',
            bgColor: 'bg-red-500/10',
        },
        notFound: {
            icon: FileX,
            title: 'Not Found',
            description: "We couldn't find what you're looking for. It may have been moved or deleted.",
            color: 'text-blue-500',
            bgColor: 'bg-blue-500/10',
        },
        generic: {
            icon: AlertTriangle,
            title: 'Something went wrong',
            description: 'An unexpected error occurred. Please try again or contact support if the issue persists.',
            color: 'text-red-500',
            bgColor: 'bg-red-500/10',
        },
    }

    const config = errorConfig[errorType]
    const Icon = config.icon

    return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
            <div className="max-w-md w-full text-center">
                {/* Icon */}
                <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl ${config.bgColor} flex items-center justify-center`}>
                    <Icon className={`w-10 h-10 ${config.color}`} />
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-text dark:text-dark-text mb-3">
                    {config.title}
                </h2>

                {/* Description */}
                <p className="text-text-light dark:text-dark-text-muted mb-8">
                    {config.description}
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    {onRetry && (
                        <Button onClick={onRetry} className="gap-2">
                            <RefreshCw className="w-4 h-4" />
                            Try Again
                        </Button>
                    )}
                    {onGoBack && (
                        <Button variant="outline" onClick={onGoBack} className="gap-2">
                            <ArrowLeft className="w-4 h-4" />
                            Go Back
                        </Button>
                    )}
                    {onGoHome && (
                        <Button variant="ghost" onClick={onGoHome} className="gap-2">
                            <Home className="w-4 h-4" />
                            Go Home
                        </Button>
                    )}
                </div>

                {/* Technical Details (collapsed) */}
                {error && process.env.NODE_ENV === 'development' && (
                    <details className="mt-8 text-left">
                        <summary className="cursor-pointer text-sm text-text-light dark:text-dark-text-muted hover:text-primary transition-colors">
                            Technical Details
                        </summary>
                        <pre className="mt-3 p-4 bg-gray-100 dark:bg-dark-surface rounded-xl text-xs overflow-auto text-left">
                            <code className="text-red-600 dark:text-red-400">
                                {error.name}: {error.message}
                                {error.stack && `\n\n${error.stack}`}
                            </code>
                        </pre>
                    </details>
                )}
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
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-16 h-16 mb-4 rounded-2xl bg-gray-100 dark:bg-dark-surface flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-text-light dark:text-dark-text-muted" />
            </div>
            <h3 className="text-lg font-semibold text-text dark:text-dark-text mb-2">{title}</h3>
            <p className="text-sm text-text-light dark:text-dark-text-muted mb-6 max-w-xs">{message}</p>
            {onRetry && (
                <Button variant="outline" onClick={onRetry} className="gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                </Button>
            )}
        </div>
    )
}

export { ErrorFallback }
