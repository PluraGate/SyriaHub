'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { TwoFactorVerify } from './TwoFactorVerify'
import { Loader2 } from 'lucide-react'

interface MFAGuardProps {
    children: React.ReactNode
    redirectTo?: string
}

/**
 * MFAGuard checks if the current session requires MFA verification.
 * If so, it shows the 2FA verification UI instead of children.
 * 
 * Use this component to wrap authenticated pages/content.
 */
export function MFAGuard({ children, redirectTo = '/feed' }: MFAGuardProps) {
    const [loading, setLoading] = useState(true)
    const [needsMFA, setNeedsMFA] = useState(false)
    const [factorId, setFactorId] = useState<string | null>(null)

    const supabase = createClient()
    const router = useRouter()

    const checkMFAStatus = useCallback(async () => {
        try {
            // Get the current session's assurance level
            const { data: { session } } = await supabase.auth.getSession()

            if (!session) {
                router.push('/auth/login')
                return
            }

            // Check MFA factors
            const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors()

            if (factorsError) {
                console.error('Error listing factors:', factorsError)
                setLoading(false)
                return
            }

            // Check if user has verified TOTP factors
            const verifiedFactors = factorsData?.totp?.filter(f => f.status === 'verified') || []

            if (verifiedFactors.length === 0) {
                // No MFA factors - user doesn't have 2FA enabled
                setLoading(false)
                return
            }

            // User has 2FA - check if current session is at AAL2
            const { data: aalData, error: aalError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()

            if (aalError) {
                console.error('Error getting AAL:', aalError)
                setLoading(false)
                return
            }

            if (aalData.currentLevel === 'aal1' && aalData.nextLevel === 'aal2') {
                // Session is at AAL1 but needs AAL2 - show MFA verification
                setNeedsMFA(true)
                setFactorId(verifiedFactors[0].id)
            }

            setLoading(false)
        } catch (err) {
            console.error('Error checking MFA status:', err)
            setLoading(false)
        }
    }, [supabase, router])

    useEffect(() => {
        void (async () => {
            await checkMFAStatus()
        })()
    }, [checkMFAStatus])

    function handleMFAVerified() {
        setNeedsMFA(false)
        router.refresh()
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background dark:bg-dark-bg">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    if (needsMFA && factorId) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background dark:bg-dark-bg px-4">
                <TwoFactorVerify
                    factorId={factorId}
                    onVerified={handleMFAVerified}
                />
            </div>
        )
    }

    return <>{children}</>
}
