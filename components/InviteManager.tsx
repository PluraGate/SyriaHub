'use client'

import { useState, useEffect } from 'react'
import { Ticket, Plus, Copy, Check, Loader2, Send, Users, Clock, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/toast'

interface InviteCode {
    id: string
    code: string
    created_at: string
    is_active: boolean
    current_uses: number
    max_uses: number
    note: string | null
    used_by: string | null
}

interface InviteStats {
    total_invites_created: number
    active_invites: number
    used_invites: number
    people_invited: number
    remaining_invites: number
}

export function InviteManager() {
    const [invites, setInvites] = useState<InviteCode[]>([])
    const [stats, setStats] = useState<InviteStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [creating, setCreating] = useState(false)
    const [copiedId, setCopiedId] = useState<string | null>(null)
    const { showToast } = useToast()

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

        setLoading(false)
    }

    useEffect(() => {
        fetchData()
    }, [])

    const createInvite = async () => {
        setCreating(true)
        try {
            const response = await fetch('/api/invite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({}),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create invite')
            }

            showToast('Invite code created!', 'success')
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
        showToast('Invite link copied!', 'success')
        setTimeout(() => setCopiedId(null), 2000)
    }

    const copyCode = async (code: string, id: string) => {
        await navigator.clipboard.writeText(code)
        setCopiedId(id)
        showToast('Code copied!', 'success')
        setTimeout(() => setCopiedId(null), 2000)
    }

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
            <div className="p-4 border-b border-gray-100 dark:border-dark-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Ticket className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-text dark:text-dark-text">Your Invites</h3>
                </div>
                <Button
                    onClick={createInvite}
                    disabled={creating || (stats?.remaining_invites ?? 0) <= 0}
                    size="sm"
                    className="gap-2"
                >
                    {creating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Plus className="w-4 h-4" />
                    )}
                    Create Invite
                </Button>
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-dark-bg">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-text dark:text-dark-text">{stats.people_invited}</p>
                        <p className="text-xs text-text-light dark:text-dark-text-muted">People Invited</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-text dark:text-dark-text">{stats.active_invites}</p>
                        <p className="text-xs text-text-light dark:text-dark-text-muted">Active Codes</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-primary">{stats.remaining_invites}</p>
                        <p className="text-xs text-text-light dark:text-dark-text-muted">Remaining</p>
                    </div>
                </div>
            )}

            {/* Invite List */}
            <div className="divide-y divide-gray-100 dark:divide-dark-border">
                {invites.length === 0 ? (
                    <div className="p-8 text-center">
                        <Users className="w-8 h-8 text-text-light dark:text-dark-text-muted mx-auto mb-2" />
                        <p className="text-text-light dark:text-dark-text-muted">No invites yet</p>
                        <p className="text-sm text-text-light/70 dark:text-dark-text-muted/70 mt-1">
                            Create an invite to share with colleagues
                        </p>
                    </div>
                ) : (
                    invites.map((invite) => (
                        <div
                            key={invite.id}
                            className={`p-4 flex items-center justify-between ${!invite.is_active ? 'opacity-50' : ''
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${invite.is_active ? 'bg-primary/10 text-primary' : 'bg-gray-100 dark:bg-dark-border text-text-light'
                                    }`}>
                                    <Ticket className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-mono font-medium text-text dark:text-dark-text tracking-wider">
                                        {invite.code}
                                    </p>
                                    <p className="text-xs text-text-light dark:text-dark-text-muted flex items-center gap-2">
                                        <Clock className="w-3 h-3" />
                                        {new Date(invite.created_at).toLocaleDateString()}
                                        {invite.current_uses > 0 && (
                                            <span className="text-green-600">• Used</span>
                                        )}
                                        {!invite.is_active && (
                                            <span className="text-red-500">• Expired</span>
                                        )}
                                    </p>
                                </div>
                            </div>

                            {invite.is_active && (
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
                                        Code
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
                                        Share Link
                                    </Button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Footer hint */}
            <div className="p-4 bg-gray-50 dark:bg-dark-bg border-t border-gray-100 dark:border-dark-border">
                <p className="text-xs text-text-light dark:text-dark-text-muted text-center">
                    Each invite can be used once and expires after 30 days
                </p>
            </div>
        </div>
    )
}
