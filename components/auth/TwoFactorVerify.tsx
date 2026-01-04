'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'
import { Shield, Loader2 } from 'lucide-react'

interface TwoFactorVerifyProps {
    factorId: string
    onVerified: () => void
    onCancel?: () => void
}

export function TwoFactorVerify({ factorId, onVerified, onCancel }: TwoFactorVerifyProps) {
    const [code, setCode] = useState('')
    const [verifying, setVerifying] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const supabase = createClient()
    const { showToast } = useToast()

    async function handleVerify(e: React.FormEvent) {
        e.preventDefault()

        if (code.length !== 6) {
            setError('Please enter a 6-digit code')
            return
        }

        setVerifying(true)
        setError(null)

        try {
            // Create a challenge first
            const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
                factorId
            })

            if (challengeError) {
                setError(challengeError.message)
                setVerifying(false)
                return
            }

            // Verify the challenge with the code
            const { data, error: verifyError } = await supabase.auth.mfa.verify({
                factorId,
                challengeId: challengeData.id,
                code
            })

            if (verifyError) {
                setError(verifyError.message)
                setVerifying(false)
                return
            }

            showToast('Verification successful!', 'success')
            onVerified()
        } catch (err) {
            setError('Failed to verify code')
        }
        setVerifying(false)
    }

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-200 dark:border-dark-border p-8">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-6 mx-auto">
                    <Shield className="w-6 h-6 text-primary" />
                </div>

                <h2 className="text-2xl font-bold text-text dark:text-dark-text mb-2 text-center">
                    Two-Factor Authentication
                </h2>
                <p className="text-text-light dark:text-dark-text-muted mb-6 text-center">
                    Enter the 6-digit code from your authenticator app
                </p>

                <form onSubmit={handleVerify} className="space-y-6">
                    <div>
                        <Input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={6}
                            placeholder="000000"
                            value={code}
                            onChange={(e) => {
                                setCode(e.target.value.replace(/\D/g, ''))
                                setError(null)
                            }}
                            className="text-center text-2xl font-mono tracking-[0.5em] h-14"
                            autoFocus
                        />
                        {error && (
                            <p className="text-sm text-accent mt-2 text-center">{error}</p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={verifying || code.length !== 6}
                    >
                        {verifying ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Verifying...
                            </>
                        ) : (
                            'Verify'
                        )}
                    </Button>

                    {onCancel && (
                        <Button
                            type="button"
                            variant="ghost"
                            className="w-full"
                            onClick={onCancel}
                        >
                            Cancel
                        </Button>
                    )}
                </form>
            </div>
        </div>
    )
}
