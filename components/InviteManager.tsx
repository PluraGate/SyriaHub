'use client'

import { useState, useEffect } from 'react'
import { Ticket, Plus, Copy, Check, Loader2, Send, Users, Clock, GraduationCap, User, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { SendInviteEmailDialog } from './SendInviteEmailDialog'

type InviteTargetRole = 'member' | 'researcher'

interface InviteCode {
    id: string
    code: string
    created_at: string
    is_active: boolean
    current_uses: number
    max_uses: number
    note: string | null
    used_by: string | null
    target_role: InviteTargetRole
}

interface RoleInviteStats {
    active: number
    used: number
    remaining: number
}

interface InviteStats {
    total_invites_created: number
    researcher_invites: RoleInviteStats
    member_invites: RoleInviteStats
    people_invited: number
}

export function InviteManager() {
    const [invites, setInvites] = useState<InviteCode[]>([])
    const [stats, setStats] = useState<InviteStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [creating, setCreating] = useState(false)
    const [copiedId, setCopiedId] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<InviteTargetRole>('researcher')
    const [emailDialogCode, setEmailDialogCode] = useState<string | null>(null)
    const [userRole, setUserRole] = useState<string>('member')
    const { showToast } = useToast()
    const t = useTranslations('Settings.invitesSection')

    const fetchData = async () => {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return

        // Fetch invites
        const { data: invitesData } = await supabase
            .from('invite_codes')
            .select('*')
            .eq('created_by', user.id)
            .order('created_at', { ascending: false })

        if (invitesData) setInvites(invitesData)

        // Fetch stats
        const { data: statsData } = await supabase.rpc('get_user_invite_stats', {
            p_user_id: user.id,
        })
        if (statsData) setStats(statsData)

        // Get user role
        const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()
        if (userData) setUserRole(userData.role)

        setLoading(false)
    }

    useEffect(() => {
        fetchData()
    }, [])

    const createInvite = async (targetRole: InviteTargetRole) => {
        setCreating(true)
        try {
            const response = await fetch('/api/invite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ target_role: targetRole }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create invite')
            }

            showToast(targetRole === 'researcher' ? t('researcherInviteCreated') : t('memberInviteCreated'), 'success')
            fetchData()
        } catch (error) {
            showToast(error instanceof Error ? error.message : 'Failed to create invite', 'error')
        } finally {
            setCreating(false)
        }
    }

    const copyInviteLink = async (code: string, id: string) => {
        const link = `${window.location.origin}/auth/signup?code=${code}`
        await navigator.clipboard.writeText(link)
        setCopiedId(id)
        showToast(t('inviteLinkCopied'), 'success')
        setTimeout(() => setCopiedId(null), 2000)
    }

    const copyCode = async (code: string, id: string) => {
        await navigator.clipboard.writeText(code)
        setCopiedId(id)
        showToast(t('codeCopied'), 'success')
        setTimeout(() => setCopiedId(null), 2000)
    }

    const filteredInvites = invites.filter(invite => invite.target_role === activeTab)
    const currentStats = activeTab === 'researcher' ? stats?.researcher_invites : stats?.member_invites

    if (loading) {
        return (
            <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-gray-200 dark:bg-dark-border rounded w-32" />
                    <div className="h-24 bg-gray-200 dark:bg-dark-border rounded" />
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 dark:border-dark-border">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Ticket className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold text-text dark:text-dark-text">{t('yourInvites')}</h3>
                    </div>
                    {stats && (
                        <span className="text-sm text-text-muted dark:text-dark-text-muted">
                            {t('peopleInvited', { count: stats.people_invited })}
                        </span>
                    )}
                </div>

                {/* Role Tabs */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab('researcher')}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
                            activeTab === 'researcher'
                                ? "bg-primary text-white"
                                : "bg-gray-100 dark:bg-dark-bg text-text-light dark:text-dark-text-muted hover:bg-gray-200 dark:hover:bg-dark-border"
                        )}
                    >
                        <GraduationCap className="w-4 h-4" />
                        <span>{t('researchers')}</span>
                        {stats && (
                            <span className={cn(
                                "px-1.5 py-0.5 rounded text-xs font-bold",
                                activeTab === 'researcher'
                                    ? "bg-white/20"
                                    : "bg-gray-200 dark:bg-dark-border"
                            )}>
                                {stats.researcher_invites.remaining}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('member')}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
                            activeTab === 'member'
                                ? "bg-primary text-white"
                                : "bg-gray-100 dark:bg-dark-bg text-text-light dark:text-dark-text-muted hover:bg-gray-200 dark:hover:bg-dark-border"
                        )}
                    >
                        <User className="w-4 h-4" />
                        <span>{t('members')}</span>
                        {stats && (
                            <span className={cn(
                                "px-1.5 py-0.5 rounded text-xs font-bold",
                                activeTab === 'member'
                                    ? "bg-white/20"
                                    : "bg-gray-200 dark:bg-dark-border"
                            )}>
                                {stats.member_invites.remaining}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Stats for Current Tab */}
            {currentStats && (
                <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-dark-bg">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-primary">{currentStats.remaining}</p>
                        <p className="text-xs text-text-light dark:text-dark-text-muted">{t('remaining')}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-text dark:text-dark-text">{currentStats.active}</p>
                        <p className="text-xs text-text-light dark:text-dark-text-muted">{t('active')}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-text dark:text-dark-text">{currentStats.used}</p>
                        <p className="text-xs text-text-light dark:text-dark-text-muted">{t('used')}</p>
                    </div>
                </div>
            )}

            {/* Create Button */}
            <div className="p-4 border-b border-gray-100 dark:border-dark-border">
                <Button
                    onClick={() => createInvite(activeTab)}
                    disabled={creating || (currentStats !== undefined && currentStats.remaining <= 0)}
                    className="w-full gap-2"
                >
                    {creating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Plus className="w-4 h-4" />
                    )}
                    {activeTab === 'researcher' ? t('createResearcherInvite') : t('createMemberInvite')}
                </Button>
            </div>

            {/* Invite List */}
            <div className="divide-y divide-gray-100 dark:divide-dark-border max-h-80 overflow-y-auto">
                {filteredInvites.length === 0 ? (
                    <div className="p-8 text-center">
                        <Users className="w-8 h-8 text-text-light dark:text-dark-text-muted mx-auto mb-2" />
                        <p className="text-text-light dark:text-dark-text-muted">
                            {activeTab === 'researcher' ? t('noResearcherInvites') : t('noMemberInvites')}
                        </p>
                        <p className="text-sm text-text-light/70 dark:text-dark-text-muted/70 mt-1">
                            {activeTab === 'researcher' ? t('createInviteForResearchers') : t('createInviteForMembers')}
                        </p>
                    </div>
                ) : (
                    filteredInvites.map((invite) => (
                        <div
                            key={invite.id}
                            className={`p-4 flex items-center justify-between ${!invite.is_active ? 'opacity-50' : ''}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "w-10 h-10 rounded-lg flex items-center justify-center",
                                    invite.is_active
                                        ? "bg-primary/10 text-primary"
                                        : "bg-gray-100 dark:bg-dark-border text-text-light"
                                )}>
                                    {invite.target_role === 'researcher' ? (
                                        <GraduationCap className="w-5 h-5" />
                                    ) : (
                                        <User className="w-5 h-5" />
                                    )}
                                </div>
                                <div>
                                    <p className="font-mono font-medium text-text dark:text-dark-text tracking-wider">
                                        {invite.code}
                                    </p>
                                    <p className="text-xs text-text-light dark:text-dark-text-muted flex items-center gap-2">
                                        <Clock className="w-3 h-3" />
                                        {new Date(invite.created_at).toLocaleDateString()}
                                        {invite.current_uses > 0 && (
                                            <span className="text-green-600">• {t('used')}</span>
                                        )}
                                        {!invite.is_active && (
                                            <span className="text-red-500">• {t('expired')}</span>
                                        )}
                                    </p>
                                </div>
                            </div>

                            {invite.is_active && invite.current_uses < invite.max_uses && (
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => copyCode(invite.code, invite.id)}
                                        className="gap-1.5"
                                    >
                                        {copiedId === invite.id ? (
                                            <Check className="w-4 h-4 text-green-500" />
                                        ) : (
                                            <Copy className="w-4 h-4" />
                                        )}
                                        {t('code')}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => copyInviteLink(invite.code, `${invite.id}-link`)}
                                        className="gap-1.5"
                                    >
                                        {copiedId === `${invite.id}-link` ? (
                                            <Check className="w-4 h-4 text-green-500" />
                                        ) : (
                                            <Send className="w-4 h-4" />
                                        )}
                                        {t('share')}
                                    </Button>
                                    {['admin', 'moderator'].includes(userRole) && (
                                        <Button
                                            variant="default"
                                            size="sm"
                                            onClick={() => setEmailDialogCode(invite.code)}
                                            className="gap-1.5"
                                        >
                                            <Mail className="w-4 h-4" />
                                            {t('sendEmail')}
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Footer hint */}
            <div className="p-4 bg-gray-50 dark:bg-dark-bg border-t border-gray-100 dark:border-dark-border">
                <p className="text-xs text-text-light dark:text-dark-text-muted text-center">
                    {t('expiresAfter')}
                </p>
            </div>

            {/* Send Email Dialog */}
            <SendInviteEmailDialog
                code={emailDialogCode || ''}
                isOpen={!!emailDialogCode}
                onClose={() => setEmailDialogCode(null)}
                onSuccess={() => fetchData()}
            />
        </div>
    )
}
