'use client'

import { useState, useEffect } from 'react'
import {
    X,
    Link2,
    Copy,
    Check,
    RefreshCw,
    Globe,
    Lock,
    Loader2,
    QrCode,
    ExternalLink
} from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { createClient } from '@/lib/supabase/client'

interface ShareDialogProps {
    isOpen: boolean
    onClose: () => void
    type: 'survey' | 'poll'
    id: string
    title: string
    currentToken?: string | null
    isPublic?: boolean
}

export function ShareDialog({
    isOpen,
    onClose,
    type,
    id,
    title,
    currentToken,
    isPublic = false
}: ShareDialogProps) {
    const { showToast } = useToast()
    const [publicToken, setPublicToken] = useState<string | null>(currentToken || null)
    const [allowPublic, setAllowPublic] = useState(isPublic)
    const [isGenerating, setIsGenerating] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        setPublicToken(currentToken || null)
        setAllowPublic(isPublic)
    }, [currentToken, isPublic])

    const generateToken = () => {
        // SECURITY: Use cryptographically secure random values instead of Math.random()
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
        const randomValues = new Uint32Array(16)
        crypto.getRandomValues(randomValues)
        let token = ''
        for (let i = 0; i < 16; i++) {
            token += chars.charAt(randomValues[i] % chars.length)
        }
        return token
    }

    const handleGenerateToken = async () => {
        setIsGenerating(true)
        const supabase = createClient()

        try {
            const newToken = generateToken()
            const table = type === 'survey' ? 'surveys' : 'polls'

            const { error } = await supabase
                .from(table)
                .update({
                    public_token: newToken,
                    allow_public_responses: true
                })
                .eq('id', id)

            if (error) throw error

            setPublicToken(newToken)
            setAllowPublic(true)
            showToast('Public link generated!', 'success')
        } catch (error) {
            showToast('Failed to generate link', 'error')
        } finally {
            setIsGenerating(false)
        }
    }

    const handleTogglePublic = async (enabled: boolean) => {
        setIsSaving(true)
        const supabase = createClient()

        try {
            const table = type === 'survey' ? 'surveys' : 'polls'

            const { error } = await supabase
                .from(table)
                .update({ allow_public_responses: enabled })
                .eq('id', id)

            if (error) throw error

            setAllowPublic(enabled)
            showToast(enabled ? 'Public sharing enabled' : 'Public sharing disabled', 'success')
        } catch (error) {
            showToast('Failed to update sharing settings', 'error')
        } finally {
            setIsSaving(false)
        }
    }

    const handleCopyLink = async () => {
        if (!publicToken) return

        const baseUrl = window.location.origin
        const prefix = type === 'survey' ? 's' : 'p'
        const url = `${baseUrl}/en/${prefix}/${publicToken}`

        try {
            await navigator.clipboard.writeText(url)
            setCopied(true)
            showToast('Link copied!', 'success')
            setTimeout(() => setCopied(false), 2000)
        } catch (error) {
            showToast('Failed to copy', 'error')
        }
    }

    const publicUrl = publicToken
        ? `${typeof window !== 'undefined' ? window.location.origin : ''}/en/${type === 'survey' ? 's' : 'p'}/${publicToken}`
        : null

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white dark:bg-dark-surface rounded-xl max-w-md w-full overflow-hidden shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark-border">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Link2 className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-text dark:text-dark-text">
                                Share {type === 'survey' ? 'Survey' : 'Poll'}
                            </h2>
                            <p className="text-sm text-text-light dark:text-dark-text-muted truncate max-w-[200px]">
                                {title}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-text-light hover:text-text dark:hover:text-dark-text rounded-lg hover:bg-gray-100 dark:hover:bg-dark-border transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4">
                    {/* Public toggle */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-bg rounded-lg">
                        <div className="flex items-center gap-3">
                            {allowPublic ? (
                                <Globe className="w-5 h-5 text-emerald-500" />
                            ) : (
                                <Lock className="w-5 h-5 text-gray-400" />
                            )}
                            <div>
                                <p className="font-medium text-text dark:text-dark-text">
                                    Public Access
                                </p>
                                <p className="text-xs text-text-light dark:text-dark-text-muted">
                                    {allowPublic
                                        ? 'Anyone with the link can participate'
                                        : 'Only registered users can participate'
                                    }
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => handleTogglePublic(!allowPublic)}
                            disabled={isSaving || !publicToken}
                            className={`relative w-12 h-6 rounded-full transition-colors ${allowPublic ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-dark-border'
                                } ${!publicToken ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <div className={`absolute w-5 h-5 rounded-full bg-white shadow-sm top-0.5 transition-transform ${allowPublic ? 'translate-x-6' : 'translate-x-0.5'
                                }`} />
                        </button>
                    </div>

                    {/* Public link */}
                    {publicToken ? (
                        <div className="space-y-3">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={publicUrl || ''}
                                    readOnly
                                    className="flex-1 px-3 py-2 border border-gray-200 dark:border-dark-border rounded-lg bg-gray-50 dark:bg-dark-bg text-text dark:text-dark-text text-sm"
                                />
                                <button
                                    onClick={handleCopyLink}
                                    className="btn btn-primary px-3"
                                >
                                    {copied ? (
                                        <Check className="w-4 h-4" />
                                    ) : (
                                        <Copy className="w-4 h-4" />
                                    )}
                                </button>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={handleGenerateToken}
                                    disabled={isGenerating}
                                    className="flex-1 btn btn-ghost text-sm flex items-center justify-center gap-2"
                                >
                                    {isGenerating ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <RefreshCw className="w-4 h-4" />
                                    )}
                                    Regenerate Link
                                </button>
                                <a
                                    href={publicUrl || '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 btn btn-outline text-sm flex items-center justify-center gap-2"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    Preview
                                </a>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={handleGenerateToken}
                            disabled={isGenerating}
                            className="w-full btn btn-primary py-3 flex items-center justify-center gap-2"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Link2 className="w-5 h-5" />
                                    Generate Public Link
                                </>
                            )}
                        </button>
                    )}

                    {/* Info */}
                    {publicToken && (
                        <div className="text-xs text-text-light dark:text-dark-text-muted space-y-1">
                            <p>• Responses from public links are anonymous</p>
                            <p>• Each device can only respond once</p>
                            <p>• You can regenerate the link to invalidate old links</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
