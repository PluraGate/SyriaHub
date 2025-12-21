'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, BookOpen, ExternalLink, Plus, Loader2, X, Check, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { useToast } from '@/components/ui/toast'
import { useTranslations } from 'next-intl'

interface InternalPost {
    id: string
    title: string
    author?: {
        name?: string | null
        email?: string | null
    } | null
    created_at: string
}

interface ExternalCitationData {
    url: string
    doi: string
    title: string
    author: string
    year: string
    source: string
}

interface Citation {
    type: 'internal' | 'external'
    // Internal
    target_post_id?: string
    target_post?: InternalPost
    quote_content?: string
    // External
    external_url?: string
    external_doi?: string
    external_title?: string
    external_author?: string
    external_year?: number
    external_source?: string
}

interface AddCitationDialogProps {
    citations: Citation[]
    onCitationsChange: (citations: Citation[]) => void
}

export function AddCitationDialog({ citations, onCitationsChange }: AddCitationDialogProps) {
    const [open, setOpen] = useState(false)
    const [activeTab, setActiveTab] = useState<'internal' | 'external'>('internal')
    const supabase = useMemo(() => createClient(), [])
    const { showToast } = useToast()
    const t = useTranslations('Editor')

    // Internal search state
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<InternalPost[]>([])
    const [searching, setSearching] = useState(false)

    // External form state
    const [externalData, setExternalData] = useState<ExternalCitationData>({
        url: '',
        doi: '',
        title: '',
        author: '',
        year: '',
        source: '',
    })
    const [resolvingDOI, setResolvingDOI] = useState(false)
    const [doiError, setDoiError] = useState<string | null>(null)

    // Search internal posts
    useEffect(() => {
        if (!searchQuery.trim() || searchQuery.length < 2) {
            setSearchResults([])
            return
        }

        const timer = setTimeout(async () => {
            setSearching(true)
            try {
                const { data, error } = await supabase
                    .from('posts')
                    .select(`
            id,
            title,
            created_at,
            author:users!posts_author_id_fkey(name, email)
          `)
                    .ilike('title', `%${searchQuery}%`)
                    .eq('status', 'published')
                    .order('created_at', { ascending: false })
                    .limit(10)

                if (error) throw error
                setSearchResults((data as InternalPost[]) || [])
            } catch (error) {
                console.error('Error searching posts:', error)
            } finally {
                setSearching(false)
            }
        }, 300)

        return () => clearTimeout(timer)
    }, [searchQuery, supabase])

    // Add internal citation
    const addInternalCitation = useCallback((post: InternalPost) => {
        // Check if already added
        if (citations.some(c => c.type === 'internal' && c.target_post_id === post.id)) {
            showToast('This reference is already added', 'warning')
            return
        }

        const newCitation: Citation = {
            type: 'internal',
            target_post_id: post.id,
            target_post: post,
        }
        onCitationsChange([...citations, newCitation])
        setSearchQuery('')
        setSearchResults([])
        showToast('Reference added', 'success')
    }, [citations, onCitationsChange, showToast])

    // Resolve DOI
    const resolveDOI = async () => {
        if (!externalData.doi.trim()) return

        setResolvingDOI(true)
        setDoiError(null)

        try {
            const res = await fetch(`/api/citations/resolve-doi?doi=${encodeURIComponent(externalData.doi)}`)
            const data = await res.json()

            if (!res.ok) {
                setDoiError(data.error || 'Failed to resolve DOI')
                return
            }

            setExternalData(prev => ({
                ...prev,
                title: data.title || prev.title,
                author: data.author || prev.author,
                year: data.year?.toString() || prev.year,
                source: data.source || prev.source,
                url: data.url || prev.url,
            }))
            showToast('DOI resolved successfully', 'success')
        } catch (error) {
            console.error('Error resolving DOI:', error)
            setDoiError('Failed to resolve DOI')
        } finally {
            setResolvingDOI(false)
        }
    }

    // Add external citation
    const addExternalCitation = useCallback(() => {
        if (!externalData.doi.trim() && !externalData.url.trim()) {
            showToast('Please enter a DOI or URL', 'warning')
            return
        }

        // Check for duplicate
        const isDuplicate = citations.some(c =>
            c.type === 'external' &&
            ((externalData.doi && c.external_doi === externalData.doi) ||
                (externalData.url && c.external_url === externalData.url))
        )
        if (isDuplicate) {
            showToast('This reference is already added', 'warning')
            return
        }

        const newCitation: Citation = {
            type: 'external',
            external_doi: externalData.doi || undefined,
            external_url: externalData.url || undefined,
            external_title: externalData.title || undefined,
            external_author: externalData.author || undefined,
            external_year: externalData.year ? parseInt(externalData.year) : undefined,
            external_source: externalData.source || undefined,
        }
        onCitationsChange([...citations, newCitation])

        // Reset form
        setExternalData({
            url: '',
            doi: '',
            title: '',
            author: '',
            year: '',
            source: '',
        })
        showToast('External reference added', 'success')
    }, [citations, externalData, onCitationsChange, showToast])

    // Remove citation
    const removeCitation = (index: number) => {
        const newCitations = citations.filter((_, i) => i !== index)
        onCitationsChange(newCitations)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Reference
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>Add Reference</DialogTitle>
                </DialogHeader>

                {/* Tabs */}
                <div className="flex gap-2 p-1 bg-gray-100 dark:bg-dark-bg rounded-lg">
                    <button
                        onClick={() => setActiveTab('internal')}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'internal'
                                ? 'bg-white dark:bg-dark-surface shadow-sm text-primary'
                                : 'text-text-light dark:text-dark-text-muted hover:text-text'
                            }`}
                    >
                        <BookOpen className="w-4 h-4" />
                        SyriaHub
                    </button>
                    <button
                        onClick={() => setActiveTab('external')}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'external'
                                ? 'bg-white dark:bg-dark-surface shadow-sm text-primary'
                                : 'text-text-light dark:text-dark-text-muted hover:text-text'
                            }`}
                    >
                        <ExternalLink className="w-4 h-4" />
                        External
                    </button>
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto space-y-4">
                    {activeTab === 'internal' ? (
                        <>
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search SyriaHub posts..."
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface text-text dark:text-dark-text placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20"
                                />
                            </div>

                            {/* Search Results */}
                            {searching ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                                </div>
                            ) : searchResults.length > 0 ? (
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {searchResults.map((post) => {
                                        const isAdded = citations.some(c => c.type === 'internal' && c.target_post_id === post.id)
                                        return (
                                            <button
                                                key={post.id}
                                                onClick={() => !isAdded && addInternalCitation(post)}
                                                disabled={isAdded}
                                                className={`w-full text-left p-3 rounded-lg border transition-colors ${isAdded
                                                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                                        : 'border-gray-200 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-bg'
                                                    }`}
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div>
                                                        <p className="font-medium text-sm text-text dark:text-dark-text line-clamp-2">
                                                            {post.title}
                                                        </p>
                                                        <p className="text-xs text-text-light dark:text-dark-text-muted mt-1">
                                                            {post.author?.name || post.author?.email?.split('@')[0] || 'Anonymous'} • {new Date(post.created_at).getFullYear()}
                                                        </p>
                                                    </div>
                                                    {isAdded && <Check className="w-4 h-4 text-green-600 flex-shrink-0" />}
                                                </div>
                                            </button>
                                        )
                                    })}
                                </div>
                            ) : searchQuery.length >= 2 ? (
                                <p className="text-center text-sm text-text-light dark:text-dark-text-muted py-4">
                                    No posts found
                                </p>
                            ) : (
                                <p className="text-center text-sm text-text-light dark:text-dark-text-muted py-4">
                                    Type at least 2 characters to search
                                </p>
                            )}
                        </>
                    ) : (
                        <>
                            {/* DOI Input */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-text dark:text-dark-text">
                                    DOI
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={externalData.doi}
                                        onChange={(e) => setExternalData(prev => ({ ...prev, doi: e.target.value }))}
                                        placeholder="10.1000/xyz123"
                                        className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface text-text dark:text-dark-text placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={resolveDOI}
                                        disabled={resolvingDOI || !externalData.doi.trim()}
                                    >
                                        {resolvingDOI ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Lookup'}
                                    </Button>
                                </div>
                                {doiError && (
                                    <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        {doiError}
                                    </p>
                                )}
                            </div>

                            {/* URL Input */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-text dark:text-dark-text">
                                    URL
                                </label>
                                <input
                                    type="url"
                                    value={externalData.url}
                                    onChange={(e) => setExternalData(prev => ({ ...prev, url: e.target.value }))}
                                    placeholder="https://..."
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface text-text dark:text-dark-text placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20"
                                />
                            </div>

                            {/* Metadata Fields */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="col-span-2 space-y-1.5">
                                    <label className="text-xs font-medium text-text-light dark:text-dark-text-muted">Title</label>
                                    <input
                                        type="text"
                                        value={externalData.title}
                                        onChange={(e) => setExternalData(prev => ({ ...prev, title: e.target.value }))}
                                        placeholder="Source title"
                                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface text-text dark:text-dark-text placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-text-light dark:text-dark-text-muted">Author(s)</label>
                                    <input
                                        type="text"
                                        value={externalData.author}
                                        onChange={(e) => setExternalData(prev => ({ ...prev, author: e.target.value }))}
                                        placeholder="Smith, J."
                                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface text-text dark:text-dark-text placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-text-light dark:text-dark-text-muted">Year</label>
                                    <input
                                        type="text"
                                        value={externalData.year}
                                        onChange={(e) => setExternalData(prev => ({ ...prev, year: e.target.value }))}
                                        placeholder="2024"
                                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface text-text dark:text-dark-text placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                                <div className="col-span-2 space-y-1.5">
                                    <label className="text-xs font-medium text-text-light dark:text-dark-text-muted">Source/Journal</label>
                                    <input
                                        type="text"
                                        value={externalData.source}
                                        onChange={(e) => setExternalData(prev => ({ ...prev, source: e.target.value }))}
                                        placeholder="Nature, World Bank, etc."
                                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface text-text dark:text-dark-text placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                            </div>

                            <Button onClick={addExternalCitation} className="w-full">
                                <Plus className="w-4 h-4 mr-2" />
                                Add External Reference
                            </Button>
                        </>
                    )}
                </div>

                {/* Current Citations Preview */}
                {citations.length > 0 && (
                    <div className="border-t border-gray-200 dark:border-dark-border pt-4">
                        <h4 className="text-sm font-medium text-text dark:text-dark-text mb-2">
                            Added References ({citations.length})
                        </h4>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                            {citations.map((citation, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between gap-2 p-2 bg-gray-50 dark:bg-dark-bg rounded-lg text-sm"
                                >
                                    <div className="flex items-center gap-2 min-w-0">
                                        {citation.type === 'internal' ? (
                                            <BookOpen className="w-4 h-4 text-primary flex-shrink-0" />
                                        ) : (
                                            <ExternalLink className="w-4 h-4 text-secondary flex-shrink-0" />
                                        )}
                                        <span className="truncate text-text dark:text-dark-text">
                                            {citation.type === 'internal'
                                                ? citation.target_post?.title
                                                : citation.external_title || citation.external_doi || citation.external_url}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => removeCitation(index)}
                                        className="p-1 text-text-light hover:text-red-500 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
