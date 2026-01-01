'use client'

import { useState } from 'react'
import { X, Mail, Loader2, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

interface SendInviteEmailDialogProps {
    code: string
    isOpen: boolean
    onClose: () => void
    onSuccess?: () => void
}

export function SendInviteEmailDialog({ code, isOpen, onClose, onSuccess }: SendInviteEmailDialogProps) {
    const [email, setEmail] = useState('')
    const [name, setName] = useState('')
    const [language, setLanguage] = useState<'en' | 'ar'>('en')
    const [sending, setSending] = useState(false)
    const { showToast } = useToast()
    const t = useTranslations('Settings.invitesSection')

    if (!isOpen) return null

    const handleSend = async () => {
        if (!email.trim()) {
            showToast(t('emailRequired'), 'error')
            return
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            showToast(t('invalidEmail'), 'error')
            return
        }

        setSending(true)
        try {
            const response = await fetch('/api/invite/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code,
                    recipientEmail: email.trim(),
                    recipientName: name.trim() || undefined,
                    language,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to send invitation')
            }

            showToast(t('invitationSent', { email: email.trim() }), 'success')
            setEmail('')
            setName('')
            onSuccess?.()
            onClose()
        } catch (error) {
            showToast(error instanceof Error ? error.message : 'Failed to send', 'error')
        } finally {
            setSending(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Dialog */}
            <div className="relative bg-white dark:bg-dark-surface rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark-border">
                    <div className="flex items-center gap-2">
                        <Mail className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold text-text dark:text-dark-text">
                            {t('sendInviteTitle')}
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-border transition-colors"
                    >
                        <X className="w-5 h-5 text-text-light dark:text-dark-text-muted" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4">
                    <p className="text-sm text-text-light dark:text-dark-text-muted">
                        {t('sendInviteDescription')}
                    </p>

                    {/* Invite Code Display */}
                    <div className="bg-gray-50 dark:bg-dark-bg rounded-lg p-3 text-center">
                        <span className="font-mono text-lg font-bold text-primary tracking-wider">
                            {code}
                        </span>
                    </div>

                    {/* Language Toggle */}
                    <div>
                        <label className="block text-sm font-medium text-text dark:text-dark-text mb-2">
                            <Globe className="w-4 h-4 inline mr-1" />
                            {t('emailLanguage')}
                        </label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setLanguage('en')}
                                className={cn(
                                    "flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all",
                                    language === 'en'
                                        ? "bg-primary text-white"
                                        : "bg-gray-100 dark:bg-dark-bg text-text-light dark:text-dark-text-muted hover:bg-gray-200 dark:hover:bg-dark-border"
                                )}
                            >
                                English
                            </button>
                            <button
                                onClick={() => setLanguage('ar')}
                                className={cn(
                                    "flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all",
                                    language === 'ar'
                                        ? "bg-primary text-white"
                                        : "bg-gray-100 dark:bg-dark-bg text-text-light dark:text-dark-text-muted hover:bg-gray-200 dark:hover:bg-dark-border"
                                )}
                            >
                                العربية
                            </button>
                        </div>
                    </div>

                    {/* Email Input */}
                    <div>
                        <label className="block text-sm font-medium text-text dark:text-dark-text mb-1">
                            {t('recipientEmail')} *
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="colleague@example.com"
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg text-text dark:text-dark-text placeholder:text-text-light/50 dark:placeholder:text-dark-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                    </div>

                    {/* Name Input */}
                    <div>
                        <label className="block text-sm font-medium text-text dark:text-dark-text mb-1">
                            {t('recipientName')}
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={t('recipientNamePlaceholder')}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg text-text dark:text-dark-text placeholder:text-text-light/50 dark:placeholder:text-dark-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg">
                    <Button variant="ghost" onClick={onClose} disabled={sending}>
                        {t('cancel')}
                    </Button>
                    <Button onClick={handleSend} disabled={sending || !email.trim()} className="gap-2">
                        {sending ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                {t('sending')}
                            </>
                        ) : (
                            <>
                                <Mail className="w-4 h-4" />
                                {t('sendInvitation')}
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}
