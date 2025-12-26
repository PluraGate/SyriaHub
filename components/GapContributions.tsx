'use client'

import React, { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { cn, getInitials, getAvatarGradient } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import {
    BookOpen,
    Users,
    Lightbulb,
    Database,
    Send,
    ExternalLink,
    Clock,
    ChevronDown,
    ChevronUp,
    Plus
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useDateFormatter } from '@/hooks/useDateFormatter'
import { Button } from '@/components/ui/button'

interface GapContribution {
    id: string
    gap_id: string
    user_id: string
    contribution_type: 'reading_suggestion' | 'collaboration_offer' | 'methodological_note' | 'data_pointer'
    content: string
    resource_url?: string
    resource_title?: string
    expertise_offered?: string
    availability_notes?: string
    status: 'active' | 'archived' | 'accepted'
    created_at: string
    user?: {
        id: string
        name?: string
        email?: string
        avatar_url?: string
    }
}

interface GapContributionsProps {
    gapId: string
    gapClaimerId?: string
    className?: string
}

const contributionTypeConfig = {
    reading_suggestion: {
        icon: BookOpen,
        label: 'Reading Suggestion',
        description: 'Recommend a resource',
        color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
    },
    collaboration_offer: {
        icon: Users,
        label: 'Collaboration Offer',
        description: 'Offer to work together',
        color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20'
    },
    methodological_note: {
        icon: Lightbulb,
        label: 'Methodological Note',
        description: 'Suggest an approach',
        color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20'
    },
    data_pointer: {
        icon: Database,
        label: 'Data Pointer',
        description: 'Link to relevant data',
        color: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
    }
}

export function GapContributions({ gapId, gapClaimerId, className }: GapContributionsProps) {
    const t = useTranslations('GapContributions')
    const { formatDate } = useDateFormatter()
    const [contributions, setContributions] = useState<GapContribution[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [expanded, setExpanded] = useState(true)
    const [currentUserId, setCurrentUserId] = useState<string | null>(null)

    // Form state
    const [formType, setFormType] = useState<GapContribution['contribution_type']>('reading_suggestion')
    const [formContent, setFormContent] = useState('')
    const [formResourceUrl, setFormResourceUrl] = useState('')
    const [formResourceTitle, setFormResourceTitle] = useState('')
    const [formExpertise, setFormExpertise] = useState('')
    const [formAvailability, setFormAvailability] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const fetchContributions = useCallback(async () => {
        const supabase = createClient()

        const { data, error } = await supabase
            .from('gap_contributions')
            .select(`
                *,
                user:users!user_id (id, name, email, avatar_url)
            `)
            .eq('gap_id', gapId)
            .eq('status', 'active')
            .order('created_at', { ascending: false })

        if (!error && data) {
            setContributions(data as GapContribution[])
        }
        setLoading(false)
    }, [gapId])

    useEffect(() => {
        fetchContributions()

        // Get current user
        const supabase = createClient()
        supabase.auth.getUser().then(({ data }) => {
            setCurrentUserId(data.user?.id || null)
        })
    }, [fetchContributions])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!currentUserId || !formContent.trim()) return

        setSubmitting(true)
        const supabase = createClient()

        const contributionData = {
            gap_id: gapId,
            user_id: currentUserId,
            contribution_type: formType,
            content: formContent.trim(),
            resource_url: formResourceUrl.trim() || null,
            resource_title: formResourceTitle.trim() || null,
            expertise_offered: formExpertise.trim() || null,
            availability_notes: formAvailability.trim() || null,
            status: 'active'
        }

        const { error } = await supabase
            .from('gap_contributions')
            .insert(contributionData)

        if (!error) {
            // Reset form
            setFormContent('')
            setFormResourceUrl('')
            setFormResourceTitle('')
            setFormExpertise('')
            setFormAvailability('')
            setShowForm(false)
            fetchContributions()

            // Send notification to claimer if applicable
            if (gapClaimerId && gapClaimerId !== currentUserId) {
                await supabase.from('notifications').insert({
                    user_id: gapClaimerId,
                    type: 'gap_contribution',
                    title: t('notificationTitle'),
                    message: t('notificationMessage'),
                    link: `/research-gaps?highlight=${gapId}`,
                    read: false
                })
            }
        }

        setSubmitting(false)
    }

    const typeConfig = contributionTypeConfig[formType]

    return (
        <div className={cn('rounded-xl border border-gray-200 dark:border-dark-border overflow-hidden', className)}>
            {/* Header */}
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-surface/50 hover:bg-gray-100 dark:hover:bg-dark-surface transition-colors"
            >
                <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-text-muted dark:text-dark-text-muted" />
                    <h3 className="text-base font-semibold text-text dark:text-dark-text">
                        {t('title')}
                    </h3>
                    <span className="px-2 py-0.5 text-xs font-medium bg-gray-200 dark:bg-dark-border rounded-full">
                        {contributions.length}
                    </span>
                </div>
                {expanded ? (
                    <ChevronUp className="w-5 h-5 text-text-muted" />
                ) : (
                    <ChevronDown className="w-5 h-5 text-text-muted" />
                )}
            </button>

            {expanded && (
                <div className="p-4 bg-white dark:bg-dark-bg">
                    {/* Add contribution button */}
                    {currentUserId && !showForm && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="mb-4 w-full"
                            onClick={() => setShowForm(true)}
                        >
                            <Plus className="w-4 h-4 mr-1.5" />
                            {t('addContribution')}
                        </Button>
                    )}

                    {/* Contribution form */}
                    {showForm && (
                        <form onSubmit={handleSubmit} className="mb-6 p-4 rounded-lg border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface/50">
                            {/* Type selector */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-text dark:text-dark-text mb-2">
                                    {t('contributionType')}
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {(Object.keys(contributionTypeConfig) as GapContribution['contribution_type'][]).map((type) => {
                                        const config = contributionTypeConfig[type]
                                        const Icon = config.icon
                                        return (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => setFormType(type)}
                                                className={cn(
                                                    'flex items-center gap-2 p-3 rounded-lg border text-left transition-all',
                                                    formType === type
                                                        ? 'border-primary bg-primary/5 dark:bg-primary/10'
                                                        : 'border-gray-200 dark:border-dark-border hover:border-gray-300'
                                                )}
                                            >
                                                <Icon className={cn('w-4 h-4', formType === type ? 'text-primary' : 'text-text-muted')} />
                                                <span className={cn(
                                                    'text-sm font-medium',
                                                    formType === type ? 'text-primary' : 'text-text dark:text-dark-text'
                                                )}>
                                                    {t(`type.${type}`)}
                                                </span>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-text dark:text-dark-text mb-1.5">
                                    {t('content')} *
                                </label>
                                <textarea
                                    value={formContent}
                                    onChange={(e) => setFormContent(e.target.value)}
                                    placeholder={t(`placeholder.${formType}`)}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg text-sm text-text dark:text-dark-text placeholder:text-text-muted resize-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                                    rows={3}
                                    required
                                />
                            </div>

                            {/* Resource URL (for reading_suggestion and data_pointer) */}
                            {(formType === 'reading_suggestion' || formType === 'data_pointer') && (
                                <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-text dark:text-dark-text mb-1.5">
                                            {t('resourceUrl')}
                                        </label>
                                        <input
                                            type="url"
                                            value={formResourceUrl}
                                            onChange={(e) => setFormResourceUrl(e.target.value)}
                                            placeholder="https://..."
                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg text-sm text-text dark:text-dark-text placeholder:text-text-muted focus:ring-2 focus:ring-primary/50 focus:border-primary"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text dark:text-dark-text mb-1.5">
                                            {t('resourceTitle')}
                                        </label>
                                        <input
                                            type="text"
                                            value={formResourceTitle}
                                            onChange={(e) => setFormResourceTitle(e.target.value)}
                                            placeholder={t('resourceTitlePlaceholder')}
                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg text-sm text-text dark:text-dark-text placeholder:text-text-muted focus:ring-2 focus:ring-primary/50 focus:border-primary"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Collaboration offer fields */}
                            {formType === 'collaboration_offer' && (
                                <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-text dark:text-dark-text mb-1.5">
                                            {t('expertiseOffered')}
                                        </label>
                                        <input
                                            type="text"
                                            value={formExpertise}
                                            onChange={(e) => setFormExpertise(e.target.value)}
                                            placeholder={t('expertisePlaceholder')}
                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg text-sm text-text dark:text-dark-text placeholder:text-text-muted focus:ring-2 focus:ring-primary/50 focus:border-primary"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text dark:text-dark-text mb-1.5">
                                            {t('availabilityNotes')}
                                        </label>
                                        <input
                                            type="text"
                                            value={formAvailability}
                                            onChange={(e) => setFormAvailability(e.target.value)}
                                            placeholder={t('availabilityPlaceholder')}
                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg text-sm text-text dark:text-dark-text placeholder:text-text-muted focus:ring-2 focus:ring-primary/50 focus:border-primary"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowForm(false)}
                                    disabled={submitting}
                                >
                                    {t('cancel')}
                                </Button>
                                <Button
                                    type="submit"
                                    size="sm"
                                    disabled={submitting || !formContent.trim()}
                                >
                                    <Send className="w-4 h-4 mr-1.5" />
                                    {submitting ? t('submitting') : t('submit')}
                                </Button>
                            </div>
                        </form>
                    )}

                    {/* Contributions list */}
                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2].map((i) => (
                                <div key={i} className="h-24 rounded-lg bg-gray-100 dark:bg-dark-surface animate-pulse" />
                            ))}
                        </div>
                    ) : contributions.length === 0 ? (
                        <div className="text-center py-8">
                            <BookOpen className="w-10 h-10 text-text-muted dark:text-dark-text-muted mx-auto mb-3 opacity-50" />
                            <p className="text-sm text-text-muted dark:text-dark-text-muted">
                                {t('noContributions')}
                            </p>
                            <p className="text-xs text-text-muted dark:text-dark-text-muted mt-1">
                                {t('beFirstToContribute')}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {contributions.map((contribution) => {
                                const config = contributionTypeConfig[contribution.contribution_type]
                                const Icon = config.icon
                                return (
                                    <article
                                        key={contribution.id}
                                        className="p-4 rounded-lg border border-gray-100 dark:border-dark-border bg-white dark:bg-dark-surface"
                                    >
                                        {/* Header */}
                                        <div className="flex items-start gap-3 mb-3">
                                            {/* User avatar */}
                                            <Link href={`/profile/${contribution.user_id}`} className="shrink-0 hover:opacity-80 transition-opacity">
                                                {contribution.user?.avatar_url ? (
                                                    <img
                                                        src={contribution.user.avatar_url}
                                                        alt=""
                                                        className="w-8 h-8 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className={cn(
                                                        'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white',
                                                        getAvatarGradient(contribution.user_id)
                                                    )}>
                                                        {getInitials(contribution.user?.name, contribution.user?.email)}
                                                    </div>
                                                )}
                                            </Link>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <Link
                                                        href={`/profile/${contribution.user_id}`}
                                                        className="text-sm font-medium text-text dark:text-dark-text hover:text-primary transition-colors"
                                                    >
                                                        {contribution.user?.name || contribution.user?.email?.split('@')[0]}
                                                    </Link>
                                                    <span className={cn(
                                                        'inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full',
                                                        config.color
                                                    )}>
                                                        <Icon className="w-3 h-3" />
                                                        {t(`type.${contribution.contribution_type}`)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1 text-xs text-text-muted dark:text-dark-text-muted mt-0.5">
                                                    <Clock className="w-3 h-3" />
                                                    <span>{formatDate(contribution.created_at, 'short')}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <p className="text-sm text-text dark:text-dark-text whitespace-pre-wrap">
                                            {contribution.content}
                                        </p>

                                        {/* Resource link */}
                                        {contribution.resource_url && (
                                            <a
                                                href={contribution.resource_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="mt-3 flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border hover:border-primary/30 transition-colors"
                                            >
                                                <ExternalLink className="w-4 h-4 text-primary dark:text-primary-light flex-shrink-0" />
                                                <span className="text-sm text-primary dark:text-primary-light truncate">
                                                    {contribution.resource_title || contribution.resource_url}
                                                </span>
                                            </a>
                                        )}

                                        {/* Collaboration offer details */}
                                        {contribution.contribution_type === 'collaboration_offer' && (
                                            <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                                                {contribution.expertise_offered && (
                                                    <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/10">
                                                        <span className="font-medium text-purple-700 dark:text-purple-300">
                                                            {t('expertise')}:
                                                        </span>
                                                        <span className="text-purple-600 dark:text-purple-400 ml-1">
                                                            {contribution.expertise_offered}
                                                        </span>
                                                    </div>
                                                )}
                                                {contribution.availability_notes && (
                                                    <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/10">
                                                        <span className="font-medium text-purple-700 dark:text-purple-300">
                                                            {t('availability')}:
                                                        </span>
                                                        <span className="text-purple-600 dark:text-purple-400 ml-1">
                                                            {contribution.availability_notes}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </article>
                                )
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
