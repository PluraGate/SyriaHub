'use client'

import { useState, useEffect } from 'react'
import { Users, Check, X, Mail, Building, MessageSquare, Clock, Loader2, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/toast'
import { useTranslations, useLocale } from 'next-intl'
import { cn } from '@/lib/utils'

interface WaitlistEntry {
    id: string
    email: string
    name: string | null
    reason: string | null
    affiliation: string | null
    referral_source: string | null
    created_at: string
    status: 'pending' | 'approved' | 'rejected' | 'invited'
    notes: string | null
}

interface AdminWaitlistDashboardProps {
    initialStatus?: string
}

export function AdminWaitlistDashboard({ initialStatus = 'pending' }: AdminWaitlistDashboardProps) {
    const t = useTranslations('Admin.waitlistPage')
    const tCommon = useTranslations('Common')
    const locale = useLocale()
    const [entries, setEntries] = useState<WaitlistEntry[]>([])
    const [loading, setLoading] = useState(true)
    const [activeStatus, setActiveStatus] = useState(initialStatus)
    const [processingId, setProcessingId] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const { showToast } = useToast()

    // Approval dialog state
    const [approveDialogOpen, setApproveDialogOpen] = useState(false)
    const [selectedEntry, setSelectedEntry] = useState<WaitlistEntry | null>(null)
    const [emailLanguage, setEmailLanguage] = useState<'en' | 'ar'>(locale === 'ar' ? 'ar' : 'en')

    const fetchEntries = async (status: string) => {
        setLoading(true)
        try {
            const response = await fetch(`/api/waitlist?status=${status}`)
            const data = await response.json()
            if (data.entries) {
                setEntries(data.entries)
            }
        } catch (error) {
            console.error('Failed to fetch waitlist:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchEntries(activeStatus)
    }, [activeStatus])

    const openApproveDialog = (entry: WaitlistEntry) => {
        setSelectedEntry(entry)
        setEmailLanguage(locale === 'ar' ? 'ar' : 'en')
        setApproveDialogOpen(true)
    }

    const closeApproveDialog = () => {
        setApproveDialogOpen(false)
        setSelectedEntry(null)
    }

    const handleApprove = async () => {
        if (!selectedEntry) return

        setProcessingId(selectedEntry.id)
        closeApproveDialog()

        try {
            const inviteResponse = await fetch('/api/invite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ note: `Waitlist approval for ${selectedEntry.email}` }),
            })

            if (!inviteResponse.ok) {
                throw new Error('Failed to create invite')
            }

            const { code } = await inviteResponse.json()

            // Send invitation email to the user
            const emailResponse = await fetch('/api/invite/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code,
                    recipientEmail: selectedEntry.email,
                    recipientName: selectedEntry.name || undefined,
                    language: emailLanguage,
                }),
            })

            if (!emailResponse.ok) {
                console.error('Failed to send invitation email, but invite code was created')
            }

            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            await supabase
                .from('waitlist')
                .update({
                    status: 'invited',
                    reviewed_at: new Date().toISOString(),
                    reviewed_by: user?.id,
                })
                .eq('id', selectedEntry.id)

            showToast(t('approvalSuccess', { code }), 'success')
            fetchEntries(activeStatus)
        } catch (error) {
            showToast(t('failureApprove'), 'error')
        } finally {
            setProcessingId(null)
        }
    }

    const handleReject = async (entry: WaitlistEntry) => {
        setProcessingId(entry.id)
        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            await supabase
                .from('waitlist')
                .update({
                    status: 'rejected',
                    reviewed_at: new Date().toISOString(),
                    reviewed_by: user?.id,
                })
                .eq('id', entry.id)

            showToast(t('rejectionSuccess'), 'success')
            fetchEntries(activeStatus)
        } catch (error) {
            showToast(t('failureReject'), 'error')
        } finally {
            setProcessingId(null)
        }
    }

    const filteredEntries = entries.filter(entry => {
        if (!searchQuery) return true
        const query = searchQuery.toLowerCase()
        return (
            entry.email.toLowerCase().includes(query) ||
            entry.name?.toLowerCase().includes(query) ||
            entry.affiliation?.toLowerCase().includes(query)
        )
    })

    const statusTabs = [
        { key: 'pending', label: t('pending'), color: 'text-amber-600' },
        { key: 'invited', label: t('invited'), color: 'text-green-600' },
        { key: 'rejected', label: t('rejected'), color: 'text-red-600' },
    ]

    return (
        <>
            <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border overflow-hidden">
                {/* Header */}
                <div className="p-3 sm:p-4 border-b border-gray-100 dark:border-dark-border">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                            <h3 className="font-semibold text-sm sm:text-base text-text dark:text-dark-text">{t('title')}</h3>
                        </div>
                        <span className="text-xs sm:text-sm text-text-light dark:text-dark-text-muted">
                            {t('entries', { count: filteredEntries.length })}
                        </span>
                    </div>

                    {/* Search */}
                    <div className="relative mb-3 sm:mb-4">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light dark:text-dark-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={t('searchPlaceholder')}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-text dark:text-dark-text text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                    </div>

                    {/* Status Tabs */}
                    <div className="flex gap-1.5 sm:gap-2 overflow-x-auto">
                        {statusTabs.map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveStatus(tab.key)}
                                className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${activeStatus === tab.key
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-100 dark:bg-dark-bg text-text-light dark:text-dark-text-muted hover:bg-gray-200 dark:hover:bg-dark-border'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Entries List */}
                {loading ? (
                    <div className="p-8 text-center">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                        <p className="text-sm text-text-light dark:text-dark-text-muted mt-2">{tCommon('loading')}</p>
                    </div>
                ) : filteredEntries.length === 0 ? (
                    <div className="p-8 text-center">
                        <Users className="w-8 h-8 text-text-light dark:text-dark-text-muted mx-auto mb-2" />
                        <p className="text-text-light dark:text-dark-text-muted">{t('noEntries', { status: activeStatus })}</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100 dark:divide-dark-border max-h-[600px] overflow-y-auto">
                        {filteredEntries.map(entry => (
                            <div key={entry.id} className="p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-dark-bg/50 transition-colors">
                                <div className="space-y-2 sm:space-y-0 sm:flex sm:items-start sm:justify-between sm:gap-4">
                                    <div className="flex-1 min-w-0">
                                        {/* Email & Name */}
                                        <div className="flex items-center gap-2 mb-1">
                                            <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-text-light dark:text-dark-text-muted flex-shrink-0" />
                                            <span className="font-medium text-sm sm:text-base text-text dark:text-dark-text truncate">
                                                {entry.email}
                                            </span>
                                        </div>

                                        {entry.name && (
                                            <p className="text-xs sm:text-sm text-text-light dark:text-dark-text-muted ml-5 sm:ml-6">
                                                {entry.name}
                                            </p>
                                        )}

                                        {/* Affiliation */}
                                        {entry.affiliation && (
                                            <div className="flex items-center gap-2 mt-2 text-xs sm:text-sm text-text-light dark:text-dark-text-muted">
                                                <Building className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                                                <span>{entry.affiliation}</span>
                                            </div>
                                        )}

                                        {/* Reason */}
                                        {entry.reason && (
                                            <div className="flex items-start gap-2 mt-2 text-xs sm:text-sm text-text-light dark:text-dark-text-muted">
                                                <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 mt-0.5" />
                                                <span className="line-clamp-2">{entry.reason}</span>
                                            </div>
                                        )}

                                        {/* Meta */}
                                        <div className="flex items-center gap-3 sm:gap-4 mt-2 sm:mt-3 text-[10px] sm:text-xs text-text-light/70 dark:text-dark-text-muted/70">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {new Date(entry.created_at).toLocaleDateString()}
                                            </span>
                                            {entry.referral_source && (
                                                <span>{t('via', { source: entry.referral_source.replace('_', ' ') })}</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    {activeStatus === 'pending' && (
                                        <div className="flex items-center gap-2 flex-shrink-0 pt-2 sm:pt-0">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleReject(entry)}
                                                disabled={processingId === entry.id}
                                                className="text-red-600 border-red-200 hover:bg-red-50 h-8 sm:h-9 px-2 sm:px-3"
                                            >
                                                {processingId === entry.id ? (
                                                    <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                                                ) : (
                                                    <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                )}
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={() => openApproveDialog(entry)}
                                                disabled={processingId === entry.id}
                                                className="gap-1 sm:gap-1.5 h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm"
                                            >
                                                {processingId === entry.id ? (
                                                    <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                                                ) : (
                                                    <>
                                                        <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                        <span className="hidden sm:inline">{t('approveAndInvite')}</span>
                                                        <span className="sm:hidden">{t('approve')}</span>
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Approval Dialog */}
            {approveDialogOpen && selectedEntry && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={closeApproveDialog}
                    />

                    {/* Dialog */}
                    <div className="relative bg-white dark:bg-dark-surface rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark-border">
                            <div className="flex items-center gap-2">
                                <Mail className="w-5 h-5 text-primary" />
                                <h3 className="font-semibold text-text dark:text-dark-text">
                                    {t('approveAndInvite')}
                                </h3>
                            </div>
                            <button
                                onClick={closeApproveDialog}
                                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-border transition-colors"
                            >
                                <X className="w-5 h-5 text-text-light dark:text-dark-text-muted" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-4 space-y-4">
                            <p className="text-sm text-text-light dark:text-dark-text-muted">
                                {t('sendingInviteTo', { email: selectedEntry.email })}
                            </p>

                            {/* Language Toggle */}
                            <div>
                                <label className="block text-sm font-medium text-text dark:text-dark-text mb-2">
                                    <Globe className="w-4 h-4 inline mr-1" />
                                    {t('emailLanguage')}
                                </label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setEmailLanguage('en')}
                                        className={cn(
                                            "flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all",
                                            emailLanguage === 'en'
                                                ? "bg-primary text-white"
                                                : "bg-gray-100 dark:bg-dark-bg text-text-light dark:text-dark-text-muted hover:bg-gray-200 dark:hover:bg-dark-border"
                                        )}
                                    >
                                        English
                                    </button>
                                    <button
                                        onClick={() => setEmailLanguage('ar')}
                                        className={cn(
                                            "flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all",
                                            emailLanguage === 'ar'
                                                ? "bg-primary text-white"
                                                : "bg-gray-100 dark:bg-dark-bg text-text-light dark:text-dark-text-muted hover:bg-gray-200 dark:hover:bg-dark-border"
                                        )}
                                    >
                                        العربية
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg">
                            <Button variant="ghost" onClick={closeApproveDialog}>
                                {tCommon('cancel')}
                            </Button>
                            <Button onClick={handleApprove} className="gap-2">
                                <Check className="w-4 h-4" />
                                {t('approveAndInvite')}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

