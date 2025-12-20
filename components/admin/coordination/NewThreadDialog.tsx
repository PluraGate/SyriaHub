'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/toast'
import {
    X,
    FileText,
    User,
    MessagesSquare,
    AlertTriangle,
    MessageSquareWarning,
    Calendar,
    Loader2,
    Search,
    Check
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

interface NewThreadDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
    // Optional pre-selected object
    preSelectedType?: string
    preSelectedId?: string
    preSelectedTitle?: string
}

interface SearchResult {
    id: string
    title: string
    subtitle?: string
}

const objectTypes = [
    { value: 'post', labelKey: 'types.post', icon: FileText, table: 'posts', titleField: 'title' },
    { value: 'user', labelKey: 'types.user', icon: User, table: 'users', titleField: 'name' },
    { value: 'report', labelKey: 'types.report', icon: AlertTriangle, table: 'reports', titleField: 'reason' },
    { value: 'appeal', labelKey: 'types.appeal', icon: MessageSquareWarning, table: 'moderation_appeals', titleField: 'dispute_reason' },
    { value: 'event', labelKey: 'types.event', icon: Calendar, table: 'events', titleField: 'title' },
    { value: 'resource', labelKey: 'types.resource', icon: FileText, table: 'resources', titleField: 'title' }
]

const priorities = [
    { value: 'low', labelKey: 'low', color: 'bg-gray-100 text-gray-600' },
    { value: 'normal', labelKey: 'normal', color: 'bg-blue-100 text-blue-700' },
    { value: 'high', labelKey: 'high', color: 'bg-orange-100 text-orange-700' },
    { value: 'urgent', labelKey: 'urgent', color: 'bg-red-100 text-red-700' }
]

export function NewThreadDialog({
    open,
    onOpenChange,
    onSuccess,
    preSelectedType,
    preSelectedId,
    preSelectedTitle
}: NewThreadDialogProps) {
    const [objectType, setObjectType] = useState(preSelectedType || 'post')
    const t = useTranslations('Coordination')
    const tCommon = useTranslations('Common')

    const [selectedObject, setSelectedObject] = useState<SearchResult | null>(
        preSelectedId ? { id: preSelectedId, title: preSelectedTitle || t('selectedObject') } : null
    )
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<SearchResult[]>([])
    const [searching, setSearching] = useState(false)
    const [showResults, setShowResults] = useState(false)

    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [priority, setPriority] = useState('normal')
    const [initialMessage, setInitialMessage] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const supabase = useMemo(() => createClient(), [])
    const { showToast } = useToast()

    // Reset selected object when type changes
    useEffect(() => {
        if (!preSelectedId) {
            setSelectedObject(null)
            setSearchQuery('')
            setSearchResults([])
        }
    }, [objectType, preSelectedId])

    // Search for objects
    useEffect(() => {
        const searchObjects = async () => {
            if (searchQuery.length < 2) {
                setSearchResults([])
                return
            }

            setSearching(true)
            try {
                const typeConfig = objectTypes.find(t => t.value === objectType)
                if (!typeConfig) return

                let query = supabase
                    .from(typeConfig.table)
                    .select('id, ' + typeConfig.titleField)
                    .limit(10)

                // Add search filter based on type
                if (typeConfig.value === 'user') {
                    query = query.or(`name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`)
                } else if (typeConfig.value === 'report') {
                    query = query.ilike('reason', `%${searchQuery}%`)
                } else if (typeConfig.value === 'appeal') {
                    query = query.ilike('dispute_reason', `%${searchQuery}%`)
                } else {
                    query = query.ilike(typeConfig.titleField, `%${searchQuery}%`)
                }

                const { data, error } = await query

                if (error) {
                    console.error('Search error:', error)
                    return
                }

                const results: SearchResult[] = (data || []).map((item: any) => ({
                    id: item.id,
                    title: item[typeConfig.titleField] || 'Untitled',
                    subtitle: item.email // For users
                }))

                setSearchResults(results)
            } catch (error) {
                console.error('Search error:', error)
            } finally {
                setSearching(false)
            }
        }

        const debounce = setTimeout(searchObjects, 300)
        return () => clearTimeout(debounce)
    }, [searchQuery, objectType, supabase])

    const handleSelectObject = (result: SearchResult) => {
        setSelectedObject(result)
        setSearchQuery('')
        setShowResults(false)
        // Auto-fill title if empty
        if (!title) {
            setTitle(`${t('reviewTitlePrefix')}${result.title.substring(0, 50)}${result.title.length > 50 ? '...' : ''}`)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!selectedObject || !title.trim()) {
            showToast(t('selectObjectAndTitle'), 'error')
            return
        }

        setSubmitting(true)
        try {
            const response = await fetch('/api/coordination', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    objectType,
                    objectId: selectedObject.id,
                    title: title.trim(),
                    description: description.trim() || undefined,
                    priority,
                    initialMessage: initialMessage.trim() || undefined,
                    initialMessageType: 'NOTE'
                })
            })
            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || t('loadError'))
            }

            onSuccess()
        } catch (error: any) {
            showToast(error.message, 'error')
        } finally {
            setSubmitting(false)
        }
    }

    if (!open) return null

    const currentTypeConfig = objectTypes.find(t => t.value === objectType)
    const TypeIcon = currentTypeConfig?.icon || FileText

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white dark:bg-dark-surface rounded-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-dark-border">
                    <h2 className="text-lg font-semibold text-text dark:text-dark-text">
                        {t('newCoordinationThread')}
                    </h2>
                    <button
                        onClick={() => onOpenChange(false)}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-border transition-colors outline-none"
                    >
                        <X className="w-5 h-5 text-text-light dark:text-dark-text-muted" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    {/* Object Type */}
                    <div>
                        <label className="block text-sm font-medium text-text dark:text-dark-text mb-2">
                            {t('objectType')}
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {objectTypes.map((type) => {
                                const Icon = type.icon
                                return (
                                    <button
                                        key={type.value}
                                        type="button"
                                        onClick={() => setObjectType(type.value)}
                                        disabled={!!preSelectedType}
                                        className={cn(
                                            'flex flex-col items-center gap-1 p-3 rounded-lg text-sm transition-colors',
                                            objectType === type.value
                                                ? 'bg-primary text-white'
                                                : 'bg-gray-100 text-text-light dark:bg-dark-border dark:text-dark-text-muted hover:bg-gray-200 dark:hover:bg-dark-border/70',
                                            preSelectedType && 'opacity-50 cursor-not-allowed'
                                        )}
                                    >
                                        <Icon className="w-5 h-5" />
                                        {t(type.labelKey as any)}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Object Search */}
                    <div>
                        <label className="block text-sm font-medium text-text dark:text-dark-text mb-1">
                            {t('searchObject', { type: t(currentTypeConfig?.labelKey as any) })}
                        </label>

                        {selectedObject ? (
                            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                                    <div>
                                        <p className="text-sm font-medium text-green-800 dark:text-green-200 truncate max-w-[280px]">
                                            {selectedObject.title}
                                        </p>
                                        <p className="text-xs text-green-600 dark:text-green-400 font-mono">
                                            {selectedObject.id.substring(0, 8)}...
                                        </p>
                                    </div>
                                </div>
                                {!preSelectedId && (
                                    <button
                                        type="button"
                                        onClick={() => setSelectedObject(null)}
                                        className="text-xs text-green-700 dark:text-green-300 hover:underline"
                                    >
                                        {t('change')}
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="relative">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light dark:text-dark-text-muted" />
                                    <input
                                        type="text"
                                        placeholder={t('searchPlaceholder', { type: t(currentTypeConfig?.labelKey as any) })}
                                        value={searchQuery}
                                        onChange={(e) => {
                                            setSearchQuery(e.target.value)
                                            setShowResults(true)
                                        }}
                                        onFocus={() => setShowResults(true)}
                                        className="w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-text dark:text-dark-text outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                    {searching && (
                                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-text-light" />
                                    )}
                                </div>

                                {/* Search Results */}
                                {showResults && searchResults.length > 0 && (
                                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                        {searchResults.map((result) => (
                                            <button
                                                key={result.id}
                                                type="button"
                                                onClick={() => handleSelectObject(result)}
                                                className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-dark-border transition-colors"
                                            >
                                                <p className="text-sm text-text dark:text-dark-text truncate">
                                                    {result.title}
                                                </p>
                                                {result.subtitle && (
                                                    <p className="text-xs text-text-light dark:text-dark-text-muted">
                                                        {result.subtitle}
                                                    </p>
                                                )}
                                                <p className="text-xs text-text-light dark:text-dark-text-muted font-mono">
                                                    {result.id.substring(0, 8)}...
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {showResults && searchQuery.length >= 2 && searchResults.length === 0 && !searching && (
                                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg shadow-lg p-3">
                                        <p className="text-sm text-text-light dark:text-dark-text-muted text-center">
                                            {t('noObjectsFound', { type: t(currentTypeConfig?.labelKey as any) })}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-text dark:text-dark-text mb-1">
                            {t('threadTitle')}
                        </label>
                        <input
                            type="text"
                            placeholder={t('threadTitlePlaceholder')}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-text dark:text-dark-text outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-text dark:text-dark-text mb-1">
                            {t('descriptionOptional')}
                        </label>
                        <textarea
                            placeholder={t('descriptionPlaceholder')}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-text dark:text-dark-text resize-none outline-none focus:ring-2 focus:ring-primary/20"
                            rows={2}
                        />
                    </div>

                    {/* Priority */}
                    <div>
                        <label className="block text-sm font-medium text-text dark:text-dark-text mb-2">
                            {t('priority')}
                        </label>
                        <div className="flex gap-2">
                            {priorities.map((p) => (
                                <button
                                    key={p.value}
                                    type="button"
                                    onClick={() => setPriority(p.value)}
                                    className={cn(
                                        'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                                        priority === p.value
                                            ? p.color
                                            : 'bg-gray-50 text-text-light dark:bg-dark-border dark:text-dark-text-muted'
                                    )}
                                >
                                    {t(p.labelKey as any)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Initial Message */}
                    <div>
                        <label className="block text-sm font-medium text-text dark:text-dark-text mb-1">
                            {t('initialMessageOptional')}
                        </label>
                        <textarea
                            placeholder={t('initialMessagePlaceholder')}
                            value={initialMessage}
                            onChange={(e) => setInitialMessage(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-text dark:text-dark-text resize-none outline-none focus:ring-2 focus:ring-primary/20"
                            rows={3}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 justify-end pt-2">
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                            {tCommon('cancel')}
                        </Button>
                        <Button type="submit" disabled={submitting || !selectedObject || !title.trim()}>
                            {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {t('createThread')}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
