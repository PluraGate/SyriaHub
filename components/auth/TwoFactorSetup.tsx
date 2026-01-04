'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/toast'
import { Shield, ShieldCheck, ShieldOff, Loader2, Copy, Check, AlertTriangle } from 'lucide-react'
import QRCode from 'qrcode'

interface TwoFactorSetupProps {
    userId: string
    onEnrollmentComplete?: () => void
}

export function TwoFactorSetup({ userId, onEnrollmentComplete }: TwoFactorSetupProps) {
    const [loading, setLoading] = useState(true)
    const [enrolling, setEnrolling] = useState(false)
    const [verifying, setVerifying] = useState(false)
    const [unenrolling, setUnenrolling] = useState(false)
    const [isEnrolled, setIsEnrolled] = useState(false)
    const [factorId, setFactorId] = useState<string | null>(null)

    // Enrollment state
    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
    const [secret, setSecret] = useState<string | null>(null)
    const [verificationCode, setVerificationCode] = useState('')
    const [copied, setCopied] = useState(false)

    const supabase = createClient()
    const { showToast } = useToast()

    // Check if user already has 2FA enrolled
    useEffect(() => {
        async function checkEnrollment() {
            setLoading(true)
            try {
                const { data, error } = await supabase.auth.mfa.listFactors()

                if (error) {
                    console.error('Error checking MFA factors:', error)
                    setLoading(false)
                    return
                }

                // Find verified TOTP factor
                const totpFactor = data?.totp?.find(f => f.status === 'verified')
                if (totpFactor) {
                    setIsEnrolled(true)
                    setFactorId(totpFactor.id)
                }
            } catch (err) {
                console.error('Error:', err)
            }
            setLoading(false)
        }

        checkEnrollment()
    }, [supabase])

    // Start enrollment process
    async function startEnrollment() {
        setEnrolling(true)
        try {
            const { data, error } = await supabase.auth.mfa.enroll({
                factorType: 'totp',
                friendlyName: 'Authenticator App'
            })

            if (error) {
                showToast(error.message, 'error')
                setEnrolling(false)
                return
            }

            if (data?.totp?.qr_code) {
                // Generate QR code image from the URI
                const qrDataUrl = await QRCode.toDataURL(data.totp.uri)
                setQrCodeUrl(qrDataUrl)
                setSecret(data.totp.secret)
                setFactorId(data.id)
            }
        } catch (err) {
            showToast('Failed to start 2FA enrollment', 'error')
        }
        setEnrolling(false)
    }

    // Verify the enrollment with a code
    async function verifyEnrollment() {
        if (!factorId || verificationCode.length !== 6) {
            showToast('Please enter a 6-digit code', 'error')
            return
        }

        setVerifying(true)
        try {
            const { data, error } = await supabase.auth.mfa.challengeAndVerify({
                factorId,
                code: verificationCode
            })

            if (error) {
                showToast(error.message, 'error')
                setVerifying(false)
                return
            }

            setIsEnrolled(true)
            setQrCodeUrl(null)
            setSecret(null)
            setVerificationCode('')
            showToast('Two-factor authentication enabled!', 'success')
            onEnrollmentComplete?.()
        } catch (err) {
            showToast('Failed to verify code', 'error')
        }
        setVerifying(false)
    }

    // Unenroll from 2FA
    async function unenroll() {
        if (!factorId) return

        setUnenrolling(true)
        try {
            const { error } = await supabase.auth.mfa.unenroll({ factorId })

            if (error) {
                showToast(error.message, 'error')
                setUnenrolling(false)
                return
            }

            setIsEnrolled(false)
            setFactorId(null)
            showToast('Two-factor authentication disabled', 'success')
        } catch (err) {
            showToast('Failed to disable 2FA', 'error')
        }
        setUnenrolling(false)
    }

    // Copy secret to clipboard
    function copySecret() {
        if (secret) {
            navigator.clipboard.writeText(secret)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
        )
    }

    // User is enrolled
    if (isEnrolled) {
        return (
            <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-200 dark:border-dark-border p-6">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <ShieldCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-text dark:text-dark-text mb-1">
                            Two-Factor Authentication Enabled
                        </h3>
                        <p className="text-sm text-text-light dark:text-dark-text-muted mb-4">
                            Your account is protected with an authenticator app.
                        </p>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={unenroll}
                            disabled={unenrolling}
                            className="text-accent hover:text-accent"
                        >
                            {unenrolling ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <ShieldOff className="w-4 h-4 mr-2" />
                            )}
                            Disable 2FA
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    // Enrollment in progress - show QR code
    if (qrCodeUrl && secret) {
        return (
            <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-200 dark:border-dark-border p-6">
                <h3 className="text-lg font-semibold text-text dark:text-dark-text mb-4">
                    Set up Authenticator App
                </h3>

                <div className="space-y-6">
                    {/* Step 1: QR Code */}
                    <div>
                        <p className="text-sm text-text-light dark:text-dark-text-muted mb-4">
                            1. Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                        </p>
                        <div className="flex justify-center p-4 bg-white rounded-xl">
                            <img src={qrCodeUrl} alt="2FA QR Code" className="w-48 h-48" />
                        </div>
                    </div>

                    {/* Manual Entry */}
                    <div>
                        <p className="text-sm text-text-light dark:text-dark-text-muted mb-2">
                            Or enter this code manually:
                        </p>
                        <div className="flex items-center gap-2">
                            <code className="flex-1 px-3 py-2 bg-gray-100 dark:bg-dark-bg rounded-lg text-sm font-mono break-all">
                                {secret}
                            </code>
                            <Button variant="outline" size="sm" onClick={copySecret}>
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </Button>
                        </div>
                    </div>

                    {/* Step 2: Verify */}
                    <div>
                        <p className="text-sm text-text-light dark:text-dark-text-muted mb-2">
                            2. Enter the 6-digit code from your app to verify:
                        </p>
                        <div className="flex gap-2">
                            <Input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={6}
                                placeholder="000000"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                                className="text-center text-lg font-mono tracking-widest"
                            />
                            <Button onClick={verifyEnrollment} disabled={verifying || verificationCode.length !== 6}>
                                {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify'}
                            </Button>
                        </div>
                    </div>

                    {/* Warning */}
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-amber-800 dark:text-amber-300">
                            Save your secret key in a safe place. If you lose access to your authenticator app, you&apos;ll need this to recover your account.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    // Not enrolled - show setup button
    return (
        <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-200 dark:border-dark-border p-6">
            <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-dark-bg flex items-center justify-center">
                    <Shield className="w-6 h-6 text-text-light dark:text-dark-text-muted" />
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-text dark:text-dark-text mb-1">
                        Two-Factor Authentication
                    </h3>
                    <p className="text-sm text-text-light dark:text-dark-text-muted mb-4">
                        Add an extra layer of security to your account by requiring a code from your authenticator app when you sign in.
                    </p>
                    <Button onClick={startEnrollment} disabled={enrolling}>
                        {enrolling ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Shield className="w-4 h-4 mr-2" />
                        )}
                        Enable 2FA
                    </Button>
                </div>
            </div>
        </div>
    )
}
