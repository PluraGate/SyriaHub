'use client'

import { ErrorBoundary } from '@/components/ErrorBoundary'
import { ReactNode } from 'react'

interface AppErrorBoundaryProps {
    children: ReactNode
}

export function AppErrorBoundary({ children }: AppErrorBoundaryProps) {
    return (
        <ErrorBoundary
            onReset={() => {
                // Clear any cached data or reset app state
                if (typeof window !== 'undefined') {
                    // Could clear localStorage caches here if needed
                }
            }}
        >
            {children}
        </ErrorBoundary>
    )
}
