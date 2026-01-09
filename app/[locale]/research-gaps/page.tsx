'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { useToast } from '@/components/ui/toast'
import { GapContributions } from '@/components/GapContributions'
import { ResearchLabMobileNav } from '@/components/research-lab/ResearchLabMobileNav'
import {
    Search,
    Plus,
    Target,
    ChevronUp,
    Clock,
    User as UserIcon,
    MapPin,
    Calendar,
    Filter,
    TrendingUp,
    AlertCircle,
    CheckCircle2,
    Loader2,
    ArrowRight,
    Star,
    Database,
    FlaskConical,
    Users,
    History,
    FileText,
    Users2
} from 'lucide-react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { ResearchGap, ResearchGapPriority, ResearchGapStatus, ResearchGapType } from '@/types'
import { User } from '@supabase/supabase-js'
import { formatDistanceToNow } from 'date-fns'
import { useTranslations } from 'next-intl'

const statusColors: Record<ResearchGapStatus, string> = {
    identified: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    investigating: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    addressed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    closed: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
}

const priorityColors: Record<ResearchGapPriority, string> = {
    low: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
}

const statusLabels: Record<ResearchGapStatus, string> = {
    identified: 'Identified',
    investigating: 'In Progress',
    addressed: 'Addressed',
    closed: 'Closed'
}

const gapTypeColors: Record<ResearchGapType, string> = {
    topical: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    data: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    methodological: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    population: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
    outdated: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
}

const gapTypeLabels: Record<ResearchGapType, string> = {
    topical: 'Topical Gap',
    data: 'Data Gap',
    methodological: 'Methodological',
    population: 'Population Gap',
    outdated: 'Outdated Research'
}

export default function ResearchGapsPage() {
    const t = useTranslations('ResearchGaps')
    const tCommon = useTranslations('Common')
    const supabase = createClient()
    const router = useRouter()
    const { showToast } = useToast()

    const [user, setUser] = useState<User | null>(null)
    const [gaps, setGaps] = useState<ResearchGap[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<ResearchGapStatus | 'all'>('all')
    const [priorityFilter, setPriorityFilter] = useState<ResearchGapPriority | 'all'>('all')
    const [gapTypeFilter, setGapTypeFilter] = useState<ResearchGapType | 'all'>('all')
    const [strategicOnly, setStrategicOnly] = useState(false)
    const [showNewGapForm, setShowNewGapForm] = useState(false)
    const [userUpvotes, setUserUpvotes] = useState<Set<string>>(new Set())
    const [userInterests, setUserInterests] = useState<Set<string>>(new Set())

    // Form state for new gap
    const [newGapTitle, setNewGapTitle] = useState('')
    const [newGapDescription, setNewGapDescription] = useState('')
    const [newGapDiscipline, setNewGapDiscipline] = useState('')
    const [newGapPriority, setNewGapPriority] = useState<ResearchGapPriority>('medium')
    const [newGapType, setNewGapType] = useState<ResearchGapType>('topical')
    const [newGapIsStrategic, setNewGapIsStrategic] = useState(false)
    const [newGapSpatialContext, setNewGapSpatialContext] = useState('')
    const [submitting, setSubmitting] = useState(false)

    // Fetch user
    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUser(user)
        })
    }, [supabase])

    // Fetch gaps
    const fetchGaps = useCallback(async () => {
        setLoading(true)
        try {
            let query = supabase
                .from('research_gaps')
                .select(`
          *,
          creator:users!research_gaps_created_by_fkey(id, name, email, avatar_url),
          claimer:users!research_gaps_claimed_by_fkey(id, name, email)
        `)
                .order('upvote_count', { ascending: false })

            if (statusFilter !== 'all') {
                query = query.eq('status', statusFilter)
            }
            if (priorityFilter !== 'all') {
                query = query.eq('priority', priorityFilter)
            }
            if (gapTypeFilter !== 'all') {
                query = query.eq('gap_type', gapTypeFilter)
            }
            if (strategicOnly) {
                query = query.eq('is_strategic', true)
            }
            if (searchQuery) {
                query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
            }

            const { data, error } = await query

            if (error) throw error
            setGaps(data || [])
        } catch (error) {
            console.error('Error fetching gaps:', error)
            showToast(t('messages.loadFailed'), 'error')
        } finally {
            setLoading(false)
        }
    }, [supabase, statusFilter, priorityFilter, gapTypeFilter, strategicOnly, searchQuery, showToast, t])

    // Fetch user upvotes
    useEffect(() => {
        if (user) {
            supabase
                .from('research_gap_upvotes')
                .select('gap_id')
                .eq('user_id', user.id)
                .then(({ data }) => {
                    if (data) {
                        setUserUpvotes(new Set(data.map(u => u.gap_id)))
                    }
                })
        }
    }, [user, supabase])

    useEffect(() => {
        fetchGaps()
    }, [fetchGaps])

    // Handle upvote
    const handleUpvote = async (gapId: string) => {
        if (!user) {
            showToast(t('messages.signInToUpvote'), 'warning')
            return
        }

        const hasUpvoted = userUpvotes.has(gapId)

        try {
            if (hasUpvoted) {
                await supabase
                    .from('research_gap_upvotes')
                    .delete()
                    .eq('gap_id', gapId)
                    .eq('user_id', user.id)

                setUserUpvotes(prev => {
                    const next = new Set(prev)
                    next.delete(gapId)
                    return next
                })
            } else {
                await supabase
                    .from('research_gap_upvotes')
                    .insert({ gap_id: gapId, user_id: user.id })

                setUserUpvotes(prev => new Set([...prev, gapId]))
            }

            // Refresh to get updated count
            fetchGaps()
        } catch (error) {
            console.error('Error toggling upvote:', error)
            showToast(t('messages.voteFailed'), 'error')
        }
    }

    // Handle claim
    const handleClaim = async (gapId: string) => {
        if (!user) {
            showToast(t('messages.signInToClaim'), 'warning')
            return
        }

        try {
            await supabase
                .from('research_gaps')
                .update({
                    claimed_by: user.id,
                    claimed_at: new Date().toISOString(),
                    status: 'investigating'
                })
                .eq('id', gapId)

            showToast(t('messages.claimSuccess'), 'success')
            fetchGaps()
        } catch (error) {
            console.error('Error claiming gap:', error)
            showToast(t('messages.claimFailed'), 'error')
        }
    }

    // Handle new gap submission
    const handleSubmitGap = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!user) {
            showToast(t('messages.signInToSubmit'), 'warning')
            return
        }

        if (!newGapTitle.trim()) {
            showToast(t('messages.titleRequired'), 'warning')
            return
        }

        setSubmitting(true)

        try {
            const { error } = await supabase
                .from('research_gaps')
                .insert({
                    title: newGapTitle.trim(),
                    description: newGapDescription.trim() || null,
                    discipline: newGapDiscipline.trim() || null,
                    priority: newGapPriority,
                    gap_type: newGapType,
                    is_strategic: newGapIsStrategic,
                    spatial_context: newGapSpatialContext.trim() || null,
                    created_by: user.id,
                    status: 'identified'
                })

            if (error) throw error

            showToast(t('messages.submitSuccess'), 'success')
            setShowNewGapForm(false)
            setNewGapTitle('')
            setNewGapDescription('')
            setNewGapDiscipline('')
            setNewGapPriority('medium')
            setNewGapType('topical')
            setNewGapIsStrategic(false)
            setNewGapSpatialContext('')
            fetchGaps()
        } catch (error) {
            console.error('Error submitting gap:', error)
            showToast(t('messages.submitFailed'), 'error')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen bg-background dark:bg-dark-bg flex flex-col">
            <Navbar user={user} />

            {/* Hero Header */}
            <header className="bg-gradient-to-br from-primary via-primary-dark to-primary relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
                </div>

                <div className="container-custom max-w-6xl relative z-10 py-12 md:py-16">
                    <div className="flex items-center gap-3 mb-4">
                        <Target className="w-6 h-6 text-white/80" />
                        <span className="text-sm font-semibold uppercase tracking-wider text-white/80">
                            {t('title')}
                        </span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                        {t('heading')}
                    </h1>
                    <p className="text-lg text-white/80 max-w-2xl mb-6">
                        {t('subtitle')}
                    </p>

                    {/* Search & Actions */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                            <input
                                type="text"
                                placeholder={t('searchPlaceholder')}
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/50 focus:bg-white/20 focus:border-white/40 focus:outline-none transition-all"
                            />
                        </div>
                        <button
                            onClick={() => setShowNewGapForm(true)}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-primary font-semibold rounded-xl hover:bg-white/90 transition-all shadow-sm"
                        >
                            <Plus className="w-5 h-5" />
                            {t('identifyGap')}
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 container-custom max-w-6xl py-8">
                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3 mb-8">
                    <div className="flex items-center gap-2 text-sm text-text-light dark:text-dark-text-muted">
                        <Filter className="w-4 h-4" />
                        {t('filters')}:
                    </div>


                    <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ResearchGapStatus | 'all')}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder={t('allStatuses')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('allStatuses')}</SelectItem>
                            <SelectItem value="identified">{t('statuses.identified')}</SelectItem>
                            <SelectItem value="investigating">{t('statuses.investigating')}</SelectItem>
                            <SelectItem value="addressed">{t('statuses.addressed')}</SelectItem>
                            <SelectItem value="closed">{t('statuses.closed')}</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as ResearchGapPriority | 'all')}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder={t('allPriorities')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('allPriorities')}</SelectItem>
                            <SelectItem value="critical">{t('priorities.critical')}</SelectItem>
                            <SelectItem value="high">{t('priorities.high')}</SelectItem>
                            <SelectItem value="medium">{t('priorities.medium')}</SelectItem>
                            <SelectItem value="low">{t('priorities.low')}</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={gapTypeFilter} onValueChange={(value) => setGapTypeFilter(value as ResearchGapType | 'all')}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder={t('allTypes')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('allTypes')}</SelectItem>
                            <SelectItem value="topical">{t('types.topical')}</SelectItem>
                            <SelectItem value="data">{t('types.data')}</SelectItem>
                            <SelectItem value="methodological">{t('types.methodological')}</SelectItem>
                            <SelectItem value="population">{t('types.population')}</SelectItem>
                            <SelectItem value="outdated">{t('types.outdated')}</SelectItem>
                        </SelectContent>
                    </Select>

                    <button
                        onClick={() => setStrategicOnly(!strategicOnly)}
                        className={`px-4 py-2 text-sm rounded-lg border flex items-center gap-2 transition-all ${strategicOnly
                            ? 'bg-amber-100 border-amber-300 text-amber-700 dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-400'
                            : 'border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface text-text dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-bg'
                            }`}
                    >
                        <Star className={`w-4 h-4 ${strategicOnly ? 'fill-current' : ''}`} />
                        {t('strategic')}
                    </button>

                    <div className="flex-1" />

                    <div className="text-sm text-text-light dark:text-dark-text-muted">
                        {gaps.length === 1 ? t('gapsFound', { count: gaps.length }) : t('gapsFoundPlural', { count: gaps.length })}
                    </div>
                </div>

                {/* Success Stories - Resolved Gaps Showcase */}
                {
                    gaps.filter(g => g.status === 'addressed' && g.addressed_by_post_id).length > 0 && statusFilter !== 'identified' && statusFilter !== 'investigating' && (
                        <div className="mb-8 p-5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-xl">
                            <div className="flex items-center gap-2 mb-4">
                                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                <h3 className="font-semibold text-emerald-800 dark:text-emerald-300">
                                    {t('successStories.title')}
                                </h3>
                            </div>
                            <p className="text-sm text-emerald-700 dark:text-emerald-400/80 mb-4">
                                {t('successStories.description')}
                            </p>
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {gaps
                                    .filter(g => g.status === 'addressed' && g.addressed_by_post_id)
                                    .slice(0, 3)
                                    .map(gap => (
                                        <Link
                                            key={gap.id}
                                            href={`/post/${gap.addressed_by_post_id}`}
                                            className="group p-3 bg-white dark:bg-dark-surface rounded-lg border border-emerald-100 dark:border-emerald-800/30 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all"
                                        >
                                            <h4 className="text-sm font-medium text-text dark:text-dark-text line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                                {gap.title}
                                            </h4>
                                            <div className="flex items-center gap-1 mt-2 text-xs text-emerald-600 dark:text-emerald-400">
                                                <ArrowRight className="w-3.5 h-3.5" />
                                                {t('successStories.viewResearch')}
                                            </div>
                                        </Link>
                                    ))}
                            </div>
                        </div>
                    )
                }

                {/* New Gap Form Modal */}
                {
                    showNewGapForm && (
                        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                            <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-200 dark:border-dark-border max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
                                <h2 className="text-xl font-bold text-text dark:text-dark-text mb-4">
                                    {t('form.title')}
                                </h2>
                                <form onSubmit={handleSubmitGap} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-text dark:text-dark-text mb-1.5">
                                            {t('form.titleLabel')} *
                                        </label>
                                        <input
                                            type="text"
                                            value={newGapTitle}
                                            onChange={e => setNewGapTitle(e.target.value)}
                                            placeholder={t('form.titlePlaceholder')}
                                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-text dark:text-dark-text"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-text dark:text-dark-text mb-1.5">
                                            {t('form.descriptionLabel')}
                                        </label>
                                        <textarea
                                            value={newGapDescription}
                                            onChange={e => setNewGapDescription(e.target.value)}
                                            placeholder={t('form.descriptionPlaceholder')}
                                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-text dark:text-dark-text min-h-[100px] resize-y"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-text dark:text-dark-text mb-1.5">
                                                {t('form.disciplineLabel')}
                                            </label>
                                            <input
                                                type="text"
                                                value={newGapDiscipline}
                                                onChange={e => setNewGapDiscipline(e.target.value)}
                                                placeholder={t('form.disciplinePlaceholder')}
                                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-text dark:text-dark-text"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-text dark:text-dark-text mb-1.5">
                                                {t('form.priorityLabel')}
                                            </label>
                                            <Select value={newGapPriority} onValueChange={(value) => setNewGapPriority(value as ResearchGapPriority)}>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="low">{t('priorities.low')}</SelectItem>
                                                    <SelectItem value="medium">{t('priorities.medium')}</SelectItem>
                                                    <SelectItem value="high">{t('priorities.high')}</SelectItem>
                                                    <SelectItem value="critical">{t('priorities.critical')}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-text dark:text-dark-text mb-1.5">
                                            {t('form.gapTypeLabel')}
                                        </label>
                                        <Select value={newGapType} onValueChange={(value) => setNewGapType(value as ResearchGapType)}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="topical">{t('typeDescriptions.topical')}</SelectItem>
                                                <SelectItem value="data">{t('typeDescriptions.data')}</SelectItem>
                                                <SelectItem value="methodological">{t('typeDescriptions.methodological')}</SelectItem>
                                                <SelectItem value="population">{t('typeDescriptions.population')}</SelectItem>
                                                <SelectItem value="outdated">{t('typeDescriptions.outdated')}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-text dark:text-dark-text mb-1.5">
                                            {t('form.geographicLabel')}
                                        </label>
                                        <input
                                            type="text"
                                            value={newGapSpatialContext}
                                            onChange={e => setNewGapSpatialContext(e.target.value)}
                                            placeholder={t('form.geographicPlaceholder')}
                                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-text dark:text-dark-text"
                                        />
                                    </div>

                                    {/* Strategic Checkbox */}
                                    <div className="flex items-center gap-3 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                                        <input
                                            type="checkbox"
                                            id="strategic-checkbox"
                                            checked={newGapIsStrategic}
                                            onChange={e => setNewGapIsStrategic(e.target.checked)}
                                            className="w-5 h-5 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                                        />
                                        <label htmlFor="strategic-checkbox" className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Star className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                                <span className="font-medium text-amber-800 dark:text-amber-300">{t('form.strategicCheckbox')}</span>
                                            </div>
                                            <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                                                {t('form.strategicNote')}
                                            </p>
                                        </label>
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setShowNewGapForm(false)}
                                            className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-dark-border text-text dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-bg transition-all"
                                        >
                                            {t('form.cancel')}
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-white font-semibold hover:bg-primary-dark transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                            {t('form.submit')}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )
                }

                {/* Gaps List */}
                {
                    loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : gaps.length === 0 ? (
                        <div className="text-center py-20">
                            <AlertCircle className="w-12 h-12 mx-auto text-text-light dark:text-dark-text-muted mb-4" />
                            <h3 className="text-lg font-semibold text-text dark:text-dark-text mb-2">
                                {t('empty.title')}
                            </h3>
                            <p className="text-text-light dark:text-dark-text-muted mb-6">
                                {t('empty.description')}
                            </p>
                            <button
                                onClick={() => setShowNewGapForm(true)}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-all"
                            >
                                <Plus className="w-5 h-5" />
                                {t('identifyGap')}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {gaps.map(gap => (
                                <div
                                    key={gap.id}
                                    className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-5 hover:border-primary/30 dark:hover:border-primary-light/30 transition-all"
                                >
                                    <div className="flex gap-4">
                                        {/* Upvote Button */}
                                        <div className="flex flex-col items-center gap-1">
                                            <button
                                                onClick={() => handleUpvote(gap.id)}
                                                className={`p-2 rounded-lg transition-all ${userUpvotes.has(gap.id)
                                                    ? 'bg-primary text-white'
                                                    : 'bg-gray-100 dark:bg-dark-bg text-text-light dark:text-dark-text-muted hover:bg-primary/10 hover:text-primary'
                                                    }`}
                                            >
                                                <ChevronUp className="w-5 h-5" />
                                            </button>
                                            <span className={`text-sm font-semibold ${userUpvotes.has(gap.id) ? 'text-primary' : 'text-text dark:text-dark-text'}`}>
                                                {gap.upvote_count}
                                            </span>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                                {/* Strategic Star */}
                                                {gap.is_strategic && (
                                                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-xs font-medium flex items-center gap-1">
                                                        <Star className="w-3 h-3 fill-current" />
                                                        Strategic
                                                    </span>
                                                )}
                                                {/* Gap Type Badge */}
                                                {gap.gap_type && (
                                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${gapTypeColors[gap.gap_type]}`}>
                                                        {gapTypeLabels[gap.gap_type]}
                                                    </span>
                                                )}
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[gap.status]}`}>
                                                    {statusLabels[gap.status]}
                                                </span>
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[gap.priority]}`}>
                                                    {t('card.priorityLabel', { priority: t(`priorities.${gap.priority}`) })}
                                                </span>
                                                {gap.discipline && (
                                                    <span className="px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-dark-bg text-xs font-medium text-text-light dark:text-dark-text-muted">
                                                        {gap.discipline}
                                                    </span>
                                                )}
                                            </div>

                                            <h3 className="text-lg font-semibold text-text dark:text-dark-text mb-2 line-clamp-2">
                                                {gap.title}
                                            </h3>

                                            {gap.description && (
                                                <p className="text-sm text-text-light dark:text-dark-text-muted mb-3 line-clamp-2">
                                                    {gap.description}
                                                </p>
                                            )}

                                            <div className="flex flex-wrap items-center gap-4 text-xs text-text-light dark:text-dark-text-muted">
                                                {gap.spatial_context && (
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="w-3.5 h-3.5" />
                                                        {gap.spatial_context}
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {formatDistanceToNow(new Date(gap.created_at), { addSuffix: true })}
                                                </span>
                                                {gap.creator && (
                                                    <span className="flex items-center gap-1">
                                                        <UserIcon className="w-3.5 h-3.5" />
                                                        {(gap.creator as any).name || (gap.creator as any).email?.split('@')[0]}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Claim / Progress Section */}
                                            {gap.status === 'identified' && user && user.id !== gap.created_by && (
                                                <button
                                                    onClick={() => handleClaim(gap.id)}
                                                    className="mt-3 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-all"
                                                >
                                                    <Target className="w-4 h-4" />
                                                    {t('card.claimButton')}
                                                </button>
                                            )}

                                            {gap.status === 'investigating' && gap.claimer && (
                                                <div className="mt-3 flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                                                    <TrendingUp className="w-4 h-4" />
                                                    Being investigated by {(gap.claimer as any).name || (gap.claimer as any).email?.split('@')[0]}
                                                </div>
                                            )}
                                            {gap.status === 'addressed' && gap.addressed_by_post_id && (
                                                <Link
                                                    href={`/post/${gap.addressed_by_post_id}`}
                                                    className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                                                >
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    {t('card.viewAddressing')}
                                                    <ArrowRight className="w-4 h-4" />
                                                </Link>
                                            )}

                                            {/* Gap Contributions - formal collaboration system */}
                                            {gap.status !== 'closed' && (
                                                <GapContributions
                                                    gapId={gap.id}
                                                    gapClaimerId={gap.claimed_by || undefined}
                                                    className="mt-4"
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                }
            </main >

            <ResearchLabMobileNav />
            <Footer />
        </div >
    )
}
