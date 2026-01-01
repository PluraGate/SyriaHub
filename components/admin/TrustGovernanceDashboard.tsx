'use client'

import { useState, useEffect } from 'react'
import {
    Users, GitBranch, Shield, AlertTriangle,
    RefreshCw, ChevronRight, CheckCircle, XCircle,
    Clock, Loader2
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface GovernanceStats {
    total_users_in_tree: number
    pending_promotions: number
    invite_blocked_users: number
    trust_recalc_queue_size: number
}

interface PromotionRequest {
    id: string
    user_id: string
    target_role: string
    current_role: string
    required_moderator_endorsements: number
    required_admin_endorsements: number
    created_at: string
    user: { id: string; name: string; email: string; role: string }
    endorsements: Array<{
        id: string
        endorser_role: string
        justification: string
        endorser: { id: string; name: string }
    }>
}

export function TrustGovernanceDashboard() {
    const [stats, setStats] = useState<GovernanceStats | null>(null)
    const [promotions, setPromotions] = useState<PromotionRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [processingQueue, setProcessingQueue] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        try {
            const [statsRes, promotionsRes] = await Promise.all([
                fetch('/api/admin/trust-governance'),
                fetch('/api/admin/trust-governance?metric=promotions')
            ])

            if (statsRes.ok) {
                setStats(await statsRes.json())
            }
            if (promotionsRes.ok) {
                const data = await promotionsRes.json()
                setPromotions(data.data || [])
            }
        } catch (error) {
            console.error('Failed to load governance data:', error)
        } finally {
            setLoading(false)
        }
    }

    const processQueue = async () => {
        setProcessingQueue(true)
        try {
            const res = await fetch('/api/admin/trust-governance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'process-trust-queue' })
            })
            if (res.ok) {
                const { processed } = await res.json()
                alert(`Processed ${processed} trust recalculations`)
                loadData()
            }
        } finally {
            setProcessingQueue(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-display font-bold text-text dark:text-dark-text">
                        Trust Governance
                    </h1>
                    <p className="text-text-light dark:text-dark-text-muted mt-1">
                        Legible, accountable, and reversible governance
                    </p>
                </div>
                <button
                    onClick={loadData}
                    className="btn btn-outline flex items-center gap-2"
                >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard
                    icon={GitBranch}
                    label="Users in Tree"
                    value={stats?.total_users_in_tree || 0}
                    color="text-blue-500"
                />
                <StatCard
                    icon={Shield}
                    label="Pending Promotions"
                    value={stats?.pending_promotions || 0}
                    color="text-amber-500"
                />
                <StatCard
                    icon={AlertTriangle}
                    label="Blocked Users"
                    value={stats?.invite_blocked_users || 0}
                    color="text-red-500"
                />
                <div className="bg-white dark:bg-dark-surface p-4 rounded-xl border border-gray-200 dark:border-dark-border">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Clock className="w-5 h-5 text-purple-500" />
                            <div>
                                <p className="text-sm text-text-light dark:text-dark-text-muted">Recalc Queue</p>
                                <p className="text-xl font-bold text-text dark:text-dark-text">
                                    {stats?.trust_recalc_queue_size || 0}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={processQueue}
                            disabled={processingQueue || (stats?.trust_recalc_queue_size || 0) === 0}
                            className="btn btn-sm btn-primary"
                        >
                            {processingQueue ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Process'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Pending Promotions */}
            <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border">
                <div className="p-4 border-b border-gray-200 dark:border-dark-border">
                    <h2 className="text-lg font-semibold text-text dark:text-dark-text">
                        Pending Promotion Requests
                    </h2>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-dark-border">
                    {promotions.length === 0 ? (
                        <div className="p-8 text-center text-text-light dark:text-dark-text-muted">
                            No pending promotion requests
                        </div>
                    ) : (
                        promotions.map(req => (
                            <PromotionCard key={req.id} request={req} onUpdate={loadData} />
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}

function StatCard({ icon: Icon, label, value, color }: {
    icon: React.ElementType
    label: string
    value: number
    color: string
}) {
    return (
        <div className="bg-white dark:bg-dark-surface p-4 rounded-xl border border-gray-200 dark:border-dark-border">
            <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${color}`} />
                <div>
                    <p className="text-sm text-text-light dark:text-dark-text-muted">{label}</p>
                    <p className="text-xl font-bold text-text dark:text-dark-text">{value}</p>
                </div>
            </div>
        </div>
    )
}

function PromotionCard({ request, onUpdate }: { request: PromotionRequest; onUpdate: () => void }) {
    const [endorsing, setEndorsing] = useState(false)
    const [justification, setJustification] = useState('')
    const [showEndorse, setShowEndorse] = useState(false)

    const modCount = request.endorsements.filter(e => e.endorser_role === 'moderator').length
    const adminCount = request.endorsements.filter(e => e.endorser_role === 'admin').length

    const handleEndorse = async () => {
        if (justification.length < 20) {
            alert('Justification must be at least 20 characters')
            return
        }

        setEndorsing(true)
        try {
            const res = await fetch('/api/admin/trust-governance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'endorse',
                    request_id: request.id,
                    justification
                })
            })

            if (res.ok) {
                setJustification('')
                setShowEndorse(false)
                onUpdate()
            } else {
                const { error } = await res.json()
                alert(error)
            }
        } finally {
            setEndorsing(false)
        }
    }

    return (
        <div className="p-4">
            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="font-medium text-text dark:text-dark-text">
                            {request.user.name}
                        </span>
                        <ChevronRight className="w-4 h-4 text-text-light" />
                        <span className="px-2 py-0.5 bg-primary/10 text-primary text-sm rounded">
                            {request.target_role}
                        </span>
                    </div>
                    <p className="text-sm text-text-light dark:text-dark-text-muted mt-1">
                        Currently: {request.current_role}
                    </p>
                </div>

                <div className="text-right">
                    <div className="flex items-center gap-4 text-sm">
                        <span className={modCount >= request.required_moderator_endorsements ? 'text-green-500' : 'text-text-light'}>
                            Mods: {modCount}/{request.required_moderator_endorsements}
                        </span>
                        <span className={adminCount >= request.required_admin_endorsements ? 'text-green-500' : 'text-text-light'}>
                            Admins: {adminCount}/{request.required_admin_endorsements}
                        </span>
                    </div>
                </div>
            </div>

            {/* Endorsements */}
            {request.endorsements.length > 0 && (
                <div className="mt-3 space-y-2">
                    {request.endorsements.map(e => (
                        <div key={e.id} className="text-sm bg-gray-50 dark:bg-dark-bg p-2 rounded">
                            <span className="font-medium">{e.endorser.name}</span>
                            <span className="text-text-light dark:text-dark-text-muted"> ({e.endorser_role}): </span>
                            <span className="text-text dark:text-dark-text">{e.justification}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Actions */}
            <div className="mt-4 flex items-center gap-2">
                {showEndorse ? (
                    <div className="flex-1 flex items-center gap-2">
                        <input
                            type="text"
                            value={justification}
                            onChange={(e) => setJustification(e.target.value)}
                            placeholder="Justification (min 20 chars)"
                            className="flex-1 px-3 py-2 border rounded-lg text-sm"
                        />
                        <button
                            onClick={handleEndorse}
                            disabled={endorsing || justification.length < 20}
                            className="btn btn-sm btn-primary"
                        >
                            {endorsing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                        </button>
                        <button
                            onClick={() => setShowEndorse(false)}
                            className="btn btn-sm btn-outline"
                        >
                            <XCircle className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setShowEndorse(true)}
                        className="btn btn-sm btn-outline"
                    >
                        Endorse
                    </button>
                )}
            </div>
        </div>
    )
}
