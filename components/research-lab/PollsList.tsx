'use client'

import { useState } from 'react'
import {
    Vote,
    Plus,
    Users,
    Clock,
    Check,
    X,
    Loader2,
    Edit,
    Trash2,
    BarChart2,
    MoreVertical,
    XCircle,
    Share2,
    CheckCircle2,
    Download,
    FileJson,
    FileSpreadsheet,
    Upload
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ar, enUS } from 'date-fns/locale'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/toast'
import { ShareDialog } from './ShareDialog'
import { useTranslations, useLocale } from 'next-intl'

interface PollOption {
    id: string
    text: string
    vote_count: number
}

interface Poll {
    id: string
    question: string
    description?: string
    options: PollOption[]
    is_multiple_choice: boolean
    is_anonymous: boolean
    show_results_before_vote: boolean
    total_votes: number
    end_date?: string
    created_at: string
    is_active: boolean
    author_id?: string
    public_token?: string | null
    allow_public_responses?: boolean
    author?: { name?: string; email?: string }
}

interface PollsListProps {
    polls: Poll[]
    userVotes: Record<string, string[]>
    userId?: string
    showCreate?: boolean
}

export function PollsList({ polls, userVotes, userId, showCreate = false }: PollsListProps) {
    const t = useTranslations('Polls')
    const tCommon = useTranslations('Common')
    const tResearch = useTranslations('ResearchLab')
    const [isCreating, setIsCreating] = useState(showCreate)
    const [votingPollId, setVotingPollId] = useState<string | null>(null)
    const [localVotes, setLocalVotes] = useState<Record<string, string[]>>(userVotes)
    const [localPolls, setLocalPolls] = useState(polls)
    const [editingPoll, setEditingPoll] = useState<Poll | null>(null)
    const [showResults, setShowResults] = useState<string | null>(null)
    const [deletingPollId, setDeletingPollId] = useState<string | null>(null)
    const { showToast } = useToast()

    // New poll form state
    const [newQuestion, setNewQuestion] = useState('')
    const [newDescription, setNewDescription] = useState('')
    const [newOptions, setNewOptions] = useState(['', ''])
    const [isMultiple, setIsMultiple] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    const handleVote = async (pollId: string, optionIds: string[]) => {
        if (!userId) {
            showToast('Please log in to vote', 'error')
            return
        }

        setVotingPollId(pollId)
        const supabase = createClient()

        try {
            const { error } = await supabase
                .from('poll_votes')
                .upsert({
                    poll_id: pollId,
                    user_id: userId,
                    option_ids: optionIds
                })

            if (error) throw error

            // Update local state
            setLocalVotes(prev => ({ ...prev, [pollId]: optionIds }))

            // Update poll vote counts locally
            setLocalPolls(prev => prev.map(poll => {
                if (poll.id !== pollId) return poll

                const updatedOptions = poll.options.map(opt => ({
                    ...opt,
                    vote_count: optionIds.includes(opt.id)
                        ? opt.vote_count + 1
                        : opt.vote_count
                }))

                return {
                    ...poll,
                    options: updatedOptions,
                    total_votes: poll.total_votes + 1
                }
            }))

            showToast('Vote recorded!', 'success')
        } catch (error) {
            showToast('Failed to vote', 'error')
        } finally {
            setVotingPollId(null)
        }
    }

    const handleCreatePoll = async () => {
        if (!userId) {
            showToast('Please log in to create a poll', 'error')
            return
        }

        if (!newQuestion.trim()) {
            showToast('Please enter a question', 'error')
            return
        }

        const validOptions = newOptions.filter(o => o.trim())
        if (validOptions.length < 2) {
            showToast('Please add at least 2 options', 'error')
            return
        }

        setSubmitting(true)
        const supabase = createClient()

        try {
            const pollOptions = validOptions.map((text, i) => ({
                id: `opt_${i}`,
                text: text.trim(),
                vote_count: 0
            }))

            const { data, error } = await supabase
                .from('polls')
                .insert({
                    question: newQuestion.trim(),
                    description: newDescription.trim() || null,
                    options: pollOptions,
                    is_multiple_choice: isMultiple,
                    author_id: userId
                })
                .select(`
                    *,
                    author:users!author_id(name, email)
                `)
                .single()

            if (error) throw error

            setLocalPolls(prev => [data, ...prev])
            setNewQuestion('')
            setNewDescription('')
            setNewOptions(['', ''])
            setIsMultiple(false)
            setIsCreating(false)
            showToast('Poll created!', 'success')
        } catch (error) {
            showToast('Failed to create poll', 'error')
        } finally {
            setSubmitting(false)
        }
    }

    const handleDeletePoll = async (pollId: string) => {
        setDeletingPollId(pollId)

        try {
            const response = await fetch(`/api/polls/${pollId}`, {
                method: 'DELETE'
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Failed to delete poll')
            }

            setLocalPolls(prev => prev.filter(p => p.id !== pollId))
            showToast('Poll deleted successfully', 'success')
        } catch (error) {
            showToast(error instanceof Error ? error.message : 'Failed to delete poll', 'error')
        } finally {
            setDeletingPollId(null)
        }
    }

    const handleClosePoll = async (pollId: string) => {
        try {
            const response = await fetch(`/api/polls/${pollId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_active: false })
            })

            if (!response.ok) throw new Error('Failed to close poll')

            setLocalPolls(prev => prev.map(p =>
                p.id === pollId ? { ...p, is_active: false } : p
            ))
            showToast('Poll closed', 'success')
        } catch (error) {
            showToast('Failed to close poll', 'error')
        }
    }

    const addOption = () => {
        if (newOptions.length < 10) {
            setNewOptions([...newOptions, ''])
        }
    }

    const removeOption = (index: number) => {
        if (newOptions.length > 2) {
            setNewOptions(newOptions.filter((_, i) => i !== index))
        }
    }

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-display font-bold text-text dark:text-dark-text mb-1">
                        {tResearch('polls')}
                    </h1>
                    <p className="text-text-light dark:text-dark-text-muted">
                        {tResearch('pollsPage.subtitle')}
                    </p>
                </div>
                <button
                    onClick={() => setIsCreating(!isCreating)}
                    className="btn btn-primary flex items-center gap-2"
                >
                    {isCreating ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {isCreating ? tCommon('cancel') : t('createPoll')}
                </button>
            </div>

            {/* Create Poll Form */}
            {isCreating && (
                <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-6 mb-8">
                    <h3 className="text-lg font-semibold text-text dark:text-dark-text mb-4">
                        {t('createPoll')}
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-text dark:text-dark-text mb-1.5">
                                {t('question')}
                            </label>
                            <input
                                type="text"
                                value={newQuestion}
                                onChange={(e) => setNewQuestion(e.target.value)}
                                placeholder={t('questionPlaceholder')}
                                className="w-full px-3 py-2 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-text dark:text-dark-text placeholder-text-light dark:placeholder-dark-text-muted focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text dark:text-dark-text mb-1.5">
                                {tResearch('pollsPage.descriptionOptional')}
                            </label>
                            <input
                                type="text"
                                value={newDescription}
                                onChange={(e) => setNewDescription(e.target.value)}
                                placeholder={t('descriptionPlaceholder')}
                                className="w-full px-3 py-2 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-text dark:text-dark-text placeholder-text-light dark:placeholder-dark-text-muted focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text dark:text-dark-text mb-1.5">
                                {tResearch('options')}
                            </label>
                            <div className="space-y-2">
                                {newOptions.map((option, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={option}
                                            onChange={(e) => {
                                                const updated = [...newOptions]
                                                updated[index] = e.target.value
                                                setNewOptions(updated)
                                            }}
                                            placeholder={t('optionPlaceholder', { number: index + 1 })}
                                            className="flex-1 px-3 py-2 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-text dark:text-dark-text placeholder-text-light dark:placeholder-dark-text-muted focus:ring-2 focus:ring-primary focus:border-transparent"
                                        />
                                        {newOptions.length > 2 && (
                                            <button
                                                onClick={() => removeOption(index)}
                                                className="p-2 text-text-light hover:text-red-500 transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            {newOptions.length < 10 && (
                                <button
                                    onClick={addOption}
                                    className="mt-2 text-sm text-primary hover:underline"
                                >
                                    + {t('addOption')}
                                </button>
                            )}
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isMultiple}
                                onChange={(e) => setIsMultiple(e.target.checked)}
                                className="rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <span className="text-sm text-text dark:text-dark-text">
                                {t('multipleChoice')}
                            </span>
                        </label>

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                onClick={() => setIsCreating(false)}
                                className="btn btn-ghost"
                            >
                                {tCommon('cancel')}
                            </button>
                            <button
                                onClick={handleCreatePoll}
                                disabled={submitting}
                                className="btn btn-primary"
                            >
                                {submitting ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    t('createPoll')
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Results Modal */}
            {showResults && (
                <PollResultsModal
                    poll={localPolls.find(p => p.id === showResults)!}
                    onClose={() => setShowResults(null)}
                />
            )}

            {/* Polls List */}
            <div className="space-y-6">
                {localPolls.length > 0 ? (
                    localPolls.map((poll) => (
                        <PollCard
                            key={poll.id}
                            poll={poll}
                            userVote={localVotes[poll.id]}
                            onVote={(optionIds) => handleVote(poll.id, optionIds)}
                            onShowResults={() => setShowResults(poll.id)}
                            onEdit={() => setEditingPoll(poll)}
                            onDelete={() => handleDeletePoll(poll.id)}
                            onClose={() => handleClosePoll(poll.id)}
                            isVoting={votingPollId === poll.id}
                            isDeleting={deletingPollId === poll.id}
                            isLoggedIn={!!userId}
                            isAuthor={userId === poll.author_id}
                        />
                    ))
                ) : (
                    <div className="text-center py-16 bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border">
                        <Vote className="w-12 h-12 mx-auto text-gray-300 dark:text-dark-text-muted mb-4" />
                        <h3 className="font-semibold text-text dark:text-dark-text mb-2">
                            {t('noPolls')}
                        </h3>
                        <p className="text-text-light dark:text-dark-text-muted mb-4">
                            {tResearch('pollsPage.beFirstPoll')}
                        </p>
                        <button
                            onClick={() => setIsCreating(true)}
                            className="btn btn-outline"
                        >
                            {t('createPoll')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

// Poll Results Modal
function PollResultsModal({ poll, onClose }: { poll: Poll; onClose: () => void }) {
    const t = useTranslations('ResearchLab')
    const { showToast } = useToast()
    const [isExporting, setIsExporting] = useState(false)
    const [isSavingToResources, setIsSavingToResources] = useState(false)
    const totalVotes = poll.options.reduce((sum, opt) => sum + opt.vote_count, 0)

    const getPollData = () => {
        return {
            poll: {
                id: poll.id,
                question: poll.question,
                description: poll.description || null,
                isMultipleChoice: poll.is_multiple_choice,
                isAnonymous: poll.is_anonymous,
                totalVotes,
                createdAt: poll.created_at,
                endDate: poll.end_date || null,
                isActive: poll.is_active
            },
            results: poll.options.map(opt => ({
                option: opt.text,
                votes: opt.vote_count,
                percentage: totalVotes > 0 ? Math.round((opt.vote_count / totalVotes) * 100) : 0
            })),
            exportedAt: new Date().toISOString()
        }
    }

    const handleExportCSV = () => {
        setIsExporting(true)
        try {
            const headers = ['Option', 'Votes', 'Percentage']
            const rows = poll.options
                .sort((a, b) => b.vote_count - a.vote_count)
                .map(opt => {
                    const percentage = totalVotes > 0 ? Math.round((opt.vote_count / totalVotes) * 100) : 0
                    return [
                        opt.text.includes(',') ? `"${opt.text}"` : opt.text,
                        opt.vote_count.toString(),
                        `${percentage}%`
                    ].join(',')
                })

            const csvContent = [
                `# Poll: ${poll.question}`,
                `# Total Votes: ${totalVotes}`,
                `# Exported: ${new Date().toISOString()}`,
                '',
                headers.join(','),
                ...rows
            ].join('\n')

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `poll_${poll.question.slice(0, 30).replace(/[^a-z0-9]/gi, '_')}_results.csv`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)

            showToast(t('pollsPage.exportSuccess') || 'Poll results exported to CSV', 'success')
        } catch {
            showToast(t('pollsPage.exportError') || 'Failed to export poll results', 'error')
        } finally {
            setIsExporting(false)
        }
    }

    const handleExportJSON = () => {
        setIsExporting(true)
        try {
            const data = getPollData()
            const jsonContent = JSON.stringify(data, null, 2)

            const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' })
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `poll_${poll.question.slice(0, 30).replace(/[^a-z0-9]/gi, '_')}_results.json`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)

            showToast(t('pollsPage.exportSuccess') || 'Poll results exported to JSON', 'success')
        } catch {
            showToast(t('pollsPage.exportError') || 'Failed to export poll results', 'error')
        } finally {
            setIsExporting(false)
        }
    }

    const handleSaveToResources = async () => {
        setIsSavingToResources(true)
        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            
            if (!user) {
                showToast('Please log in to save to resources', 'error')
                return
            }

            const data = getPollData()
            const jsonContent = JSON.stringify(data, null, 2)
            const fileName = `poll_${poll.question.slice(0, 30).replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.json`

            // Upload to storage
            const { error: uploadError } = await supabase.storage
                .from('resources')
                .upload(`${user.id}/${fileName}`, new Blob([jsonContent], { type: 'application/json' }), {
                    contentType: 'application/json',
                    upsert: false
                })

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('resources')
                .getPublicUrl(`${user.id}/${fileName}`)

            // Create resource post
            const { error: postError } = await supabase
                .from('posts')
                .insert({
                    title: `Poll Results: ${poll.question}`,
                    content: `Dataset exported from poll "${poll.question}" with ${totalVotes} total votes.`,
                    tags: ['dataset', 'poll-results', 'research-data'],
                    content_type: 'resource',
                    author_id: user.id,
                    status: 'published',
                    metadata: {
                        url: publicUrl,
                        size: jsonContent.length,
                        mime_type: 'application/json',
                        original_name: fileName,
                        downloads: 0,
                        resource_type: 'dataset',
                        source_type: 'poll',
                        source_id: poll.id
                    }
                })

            if (postError) throw postError

            showToast(t('pollsPage.savedToResources') || 'Poll results saved to Resources!', 'success')
        } catch (error) {
            console.error('Error saving to resources:', error)
            showToast(t('pollsPage.saveToResourcesError') || 'Failed to save to resources', 'error')
        } finally {
            setIsSavingToResources(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white dark:bg-dark-surface rounded-xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h2 className="text-lg font-semibold text-text dark:text-dark-text">
                                {t('pollsPage.pollResults')}
                            </h2>
                            <p className="text-sm text-text-light dark:text-dark-text-muted">
                                {totalVotes} {t('pollsPage.totalVotesLabel')}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-text-light hover:text-text dark:hover:text-dark-text transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <h3 className="font-medium text-text dark:text-dark-text mb-4">
                        {poll.question}
                    </h3>

                    <div className="space-y-3">
                        {poll.options
                            .sort((a, b) => b.vote_count - a.vote_count)
                            .map((option, index) => {
                                const percentage = totalVotes > 0
                                    ? Math.round((option.vote_count / totalVotes) * 100)
                                    : 0

                                return (
                                    <div key={option.id}>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm text-text dark:text-dark-text flex items-center gap-2">
                                                {index === 0 && totalVotes > 0 && (
                                                    <span className="text-xs px-1.5 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded">
                                                        {t('pollsPage.leading')}
                                                    </span>
                                                )}
                                                {option.text}
                                            </span>
                                            <span className="text-sm font-medium text-text-light dark:text-dark-text-muted">
                                                {option.vote_count} ({percentage}%)
                                            </span>
                                        </div>
                                        <div className="h-3 bg-gray-100 dark:bg-dark-bg rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-secondary/80 dark:bg-secondary/60 rounded-full transition-all duration-500"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                )
                            })}
                    </div>

                    {/* Export Actions */}
                    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-dark-border">
                        <p className="text-sm text-text-light dark:text-dark-text-muted mb-3">
                            {t('pollsPage.exportData') || 'Export Data'}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={handleExportCSV}
                                disabled={isExporting || totalVotes === 0}
                                className="btn btn-outline btn-sm flex items-center gap-2"
                            >
                                <FileSpreadsheet className="w-4 h-4" />
                                CSV
                            </button>
                            <button
                                onClick={handleExportJSON}
                                disabled={isExporting || totalVotes === 0}
                                className="btn btn-outline btn-sm flex items-center gap-2"
                            >
                                <FileJson className="w-4 h-4" />
                                JSON
                            </button>
                            <button
                                onClick={handleSaveToResources}
                                disabled={isSavingToResources || totalVotes === 0}
                                className="btn btn-primary btn-sm flex items-center gap-2"
                            >
                                {isSavingToResources ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Upload className="w-4 h-4" />
                                )}
                                {t('pollsPage.saveToResources') || 'Save to Resources'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Individual Poll Card Component
interface PollCardProps {
    poll: Poll
    userVote?: string[]
    onVote: (optionIds: string[]) => void
    onShowResults: () => void
    onEdit: () => void
    onDelete: () => void
    onClose: () => void
    isVoting: boolean
    isDeleting: boolean
    isLoggedIn: boolean
    isAuthor: boolean
}

function PollCard({
    poll,
    userVote,
    onVote,
    onShowResults,
    onEdit,
    onDelete,
    onClose,
    isVoting,
    isDeleting,
    isLoggedIn,
    isAuthor
}: PollCardProps) {
    const t = useTranslations('ResearchLab')
    const tCommon = useTranslations('Common')
    const locale = useLocale()
    const dateLocale = locale === 'ar' ? ar : enUS
    const [selectedOptions, setSelectedOptions] = useState<string[]>(userVote || [])
    const [showMenu, setShowMenu] = useState(false)
    const [confirmDelete, setConfirmDelete] = useState(false)
    const [showShareDialog, setShowShareDialog] = useState(false)
    const hasVoted = !!userVote
    const canShowResults = hasVoted || poll.show_results_before_vote

    const handleOptionClick = (optionId: string) => {
        if (hasVoted || !poll.is_active) return

        if (poll.is_multiple_choice) {
            setSelectedOptions(prev =>
                prev.includes(optionId)
                    ? prev.filter(id => id !== optionId)
                    : [...prev, optionId]
            )
        } else {
            setSelectedOptions([optionId])
        }
    }

    const handleSubmitVote = () => {
        if (selectedOptions.length > 0) {
            onVote(selectedOptions)
        }
    }

    const totalVotes = poll.options.reduce((sum, opt) => sum + opt.vote_count, 0)

    return (
        <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-text dark:text-dark-text">
                            {poll.question}
                        </h3>
                        {hasVoted && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                <CheckCircle2 className="w-3 h-3" />
                                {t('pollsPage.voted')}
                            </span>
                        )}
                        {!poll.is_active && (
                            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 rounded-full">
                                {t('pollsPage.closed')}
                            </span>
                        )}
                    </div>
                    {poll.description && (
                        <p className="text-text-light dark:text-dark-text-muted text-sm">
                            {poll.description}
                        </p>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {poll.is_multiple_choice && !hasVoted && poll.is_active && (
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
                            {t('pollsPage.multipleChoice')}
                        </span>
                    )}
                    {isAuthor && (
                        <div className="relative">
                            <button
                                onClick={() => setShowMenu(!showMenu)}
                                className="p-2 text-text-light hover:text-text dark:hover:text-dark-text transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-dark-border"
                            >
                                <MoreVertical className="w-4 h-4" />
                            </button>
                            {showMenu && (
                                <>
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={() => setShowMenu(false)}
                                    />
                                    <div className="absolute right-0 top-full mt-1 z-20 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg shadow-lg py-1 min-w-[140px]">
                                        <button
                                            onClick={() => {
                                                setShowShareDialog(true)
                                                setShowMenu(false)
                                            }}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-border"
                                        >
                                            <Share2 className="w-4 h-4" />
                                            {t('pollsPage.share')}
                                        </button>
                                        <button
                                            onClick={() => {
                                                onShowResults()
                                                setShowMenu(false)
                                            }}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-border"
                                        >
                                            <BarChart2 className="w-4 h-4" />
                                            {t('pollsPage.viewResults')}
                                        </button>
                                        {poll.total_votes === 0 && (
                                            <button
                                                onClick={() => {
                                                    onEdit()
                                                    setShowMenu(false)
                                                }}
                                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-border"
                                            >
                                                <Edit className="w-4 h-4" />
                                                {t('pollsPage.editPoll')}
                                            </button>
                                        )}
                                        {poll.is_active && (
                                            <button
                                                onClick={() => {
                                                    onClose()
                                                    setShowMenu(false)
                                                }}
                                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-amber-600 hover:bg-gray-100 dark:hover:bg-dark-border"
                                            >
                                                <XCircle className="w-4 h-4" />
                                                {t('pollsPage.closePoll')}
                                            </button>
                                        )}
                                        <button
                                            onClick={() => {
                                                setConfirmDelete(true)
                                                setShowMenu(false)
                                            }}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-dark-border"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            {t('pollsPage.deletePoll')}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation */}
            {confirmDelete && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                    <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                        {t('pollsPage.confirmDeletePoll')}
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setConfirmDelete(false)}
                            className="btn btn-ghost btn-sm"
                        >
                            {tCommon('cancel')}
                        </button>
                        <button
                            onClick={() => {
                                onDelete()
                                setConfirmDelete(false)
                            }}
                            disabled={isDeleting}
                            className="btn btn-sm bg-red-500 hover:bg-red-600 text-white"
                        >
                            {isDeleting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                t('pollsPage.deletePoll')
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Options */}
            <div className="space-y-2 mb-4">
                {poll.options.map((option) => {
                    const percentage = totalVotes > 0
                        ? Math.round((option.vote_count / totalVotes) * 100)
                        : 0
                    const isSelected = selectedOptions.includes(option.id)
                    const wasVotedFor = userVote?.includes(option.id)

                    return (
                        <button
                            key={option.id}
                            onClick={() => handleOptionClick(option.id)}
                            disabled={hasVoted || isVoting || !poll.is_active}
                            className={`
                                w-full relative text-left p-3 rounded-lg border transition-all
                                ${!poll.is_active
                                    ? 'cursor-default opacity-70'
                                    : hasVoted
                                        ? 'cursor-default'
                                        : isSelected
                                            ? 'border-primary bg-primary/5'
                                            : 'border-gray-200 dark:border-dark-border hover:border-primary/50'
                                }
                            `}
                        >
                            {/* Progress bar background */}
                            {canShowResults && (
                                <div
                                    className={`absolute inset-0 rounded-lg transition-all ${wasVotedFor
                                        ? 'bg-primary/20'
                                        : 'bg-gray-100 dark:bg-dark-border/50'
                                        }`}
                                    style={{ width: `${percentage}%` }}
                                />
                            )}

                            <div className="relative flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    {!hasVoted && poll.is_active && (
                                        <div className={`
                                            w-5 h-5 rounded-full border-2 flex items-center justify-center
                                            ${isSelected
                                                ? 'border-primary bg-primary text-white'
                                                : 'border-gray-300 dark:border-dark-border'
                                            }
                                        `}>
                                            {isSelected && <Check className="w-3 h-3" />}
                                        </div>
                                    )}
                                    {wasVotedFor && (
                                        <Check className="w-4 h-4 text-primary dark:text-emerald-400" />
                                    )}
                                    <span className="text-text dark:text-dark-text">
                                        {option.text}
                                    </span>
                                </div>
                                {canShowResults && (
                                    <span className="text-sm font-medium text-text-light dark:text-dark-text-muted">
                                        {percentage}%
                                    </span>
                                )}
                            </div>
                        </button>
                    )
                })}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-dark-border">
                <div className="flex items-center gap-4 text-sm text-text-light dark:text-dark-text-muted">
                    <span className="flex items-center gap-1.5">
                        <Users className="w-4 h-4" />
                        {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
                    </span>
                    {poll.author && (
                        <span>
                            {t('pollsPage.by')} {poll.author.name || poll.author.email?.split('@')[0]}
                        </span>
                    )}
                    <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        {formatDistanceToNow(new Date(poll.created_at), { addSuffix: true, locale: dateLocale })}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    {hasVoted && (
                        <button
                            onClick={onShowResults}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-text-light dark:text-secondary hover:text-text dark:hover:text-secondary-light transition-colors"
                        >
                            <BarChart2 className="w-4 h-4" />
                            {t('results')}
                        </button>
                    )}

                    {!hasVoted && isLoggedIn && poll.is_active && selectedOptions.length > 0 && (
                        <button
                            onClick={handleSubmitVote}
                            disabled={isVoting}
                            className="btn btn-primary btn-sm"
                        >
                            {isVoting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                t('vote')
                            )}
                        </button>
                    )}

                    {!isLoggedIn && !hasVoted && poll.is_active && (
                        <span className="text-sm text-text-light dark:text-dark-text-muted">
                            {t('pollsPage.loginToVote')}
                        </span>
                    )}
                </div>
            </div>

            <ShareDialog
                isOpen={showShareDialog}
                onClose={() => setShowShareDialog(false)}
                type="poll"
                id={poll.id}
                title={poll.question}
                currentToken={poll.public_token}
                isPublic={poll.allow_public_responses}
            />
        </div>
    )
}
