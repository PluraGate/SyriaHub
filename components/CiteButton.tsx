'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Quote, Copy, Check, FileEdit, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/components/ui/toast'
import { useTranslations } from 'next-intl'
import { generateCitation, CitationFormat } from '@/lib/citations'

interface CiteButtonProps {
    postId: string
    postTitle: string
    postAuthor?: {
        name?: string | null
        email?: string | null
        affiliation?: string | null
    } | null
    postCreatedAt?: string
    postContent?: string
    postTags?: string[]
}

interface Draft {
    id: string
    title: string
    updated_at: string
}

export function CiteButton({
    postId,
    postTitle,
    postAuthor,
    postCreatedAt,
    postContent,
    postTags
}: CiteButtonProps) {
    const [drafts, setDrafts] = useState<Draft[]>([])
    const [loadingDrafts, setLoadingDrafts] = useState(false)
    const [showCopyCitation, setShowCopyCitation] = useState(false)
    const [copiedFormat, setCopiedFormat] = useState<string | null>(null)
    const supabase = useMemo(() => createClient(), [])
    const router = useRouter()
    const { showToast } = useToast()
    const t = useTranslations('Post')

    // Fetch user's active drafts
    useEffect(() => {
        async function fetchDrafts() {
            setLoadingDrafts(true)
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return

                const { data } = await supabase
                    .from('posts')
                    .select('id, title, updated_at')
                    .eq('author_id', user.id)
                    .eq('status', 'draft')
                    .order('updated_at', { ascending: false })
                    .limit(5)

                setDrafts(data || [])
            } catch (error) {
                console.error('Error fetching drafts:', error)
            } finally {
                setLoadingDrafts(false)
            }
        }

        fetchDrafts()
    }, [supabase])

    // Add citation to a specific draft
    const addToDraft = async (draftId: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                showToast('Please sign in to add citations', 'error')
                return
            }

            // Create citation linking draft to this post
            const { error } = await supabase
                .from('citations')
                .insert({
                    source_post_id: draftId,
                    target_post_id: postId,
                    type: 'internal',
                    created_by: user.id,
                })

            if (error) {
                if (error.code === '23505') { // Unique violation
                    showToast('This reference is already in your draft', 'warning')
                } else {
                    throw error
                }
                return
            }

            showToast(`Added reference to your draft`, 'success')
            router.push(`/editor?id=${draftId}`)
        } catch (error: any) {
            console.error('Error adding citation:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
            showToast('Failed to add reference', 'error')
        }
    }

    // Generate citation data for export
    const citationData = {
        id: postId,
        title: postTitle,
        author: {
            name: postAuthor?.name || undefined,
            email: postAuthor?.email || undefined,
            affiliation: postAuthor?.affiliation || undefined,
        },
        content: postContent,
        tags: postTags,
        created_at: postCreatedAt || new Date().toISOString(),
        url: typeof window !== 'undefined' ? `${window.location.origin}/post/${postId}` : undefined,
    }

    // Copy citation in specific format
    const copyCitation = (format: CitationFormat) => {
        try {
            const citation = generateCitation(citationData, format)
            navigator.clipboard.writeText(citation)
            setCopiedFormat(format)
            setTimeout(() => setCopiedFormat(null), 2000)
            showToast(`${format.toUpperCase()} citation copied`, 'success')
        } catch (error) {
            console.error('Error copying citation:', error)
            showToast('Failed to copy citation', 'error')
        }
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                        <Quote className="w-4 h-4" />
                        {t('citeThis')}
                        <ChevronDown className="w-3 h-3 opacity-60" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64">
                    {/* Add to Draft Section */}
                    {drafts.length > 0 && (
                        <>
                            <div className="px-2 py-1.5 text-xs font-semibold text-text-light dark:text-dark-text-muted">
                                {t('addReference')}
                            </div>
                            {drafts.map((draft) => (
                                <DropdownMenuItem
                                    key={draft.id}
                                    onClick={() => addToDraft(draft.id)}
                                    className="cursor-pointer"
                                >
                                    <FileEdit className="w-4 h-4 mr-2 text-primary" />
                                    <span className="truncate">{draft.title || 'Untitled draft'}</span>
                                </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                        </>
                    )}

                    {/* Start New Post with this as Reference */}
                    <DropdownMenuItem
                        onClick={() => router.push(`/editor?critique_of=${postId}`)}
                        className="cursor-pointer"
                    >
                        <FileEdit className="w-4 h-4 mr-2" />
                        {t('citeInNewPost')}
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    {/* Copy Citation */}
                    <DropdownMenuItem
                        onClick={() => setShowCopyCitation(true)}
                        className="cursor-pointer"
                    >
                        <Copy className="w-4 h-4 mr-2" />
                        {t('copyCitation')}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Copy Citation Dialog */}
            <Dialog open={showCopyCitation} onOpenChange={setShowCopyCitation}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{t('copyCitation')}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3" role="list" aria-label="Citation formats">
                        {(['apa', 'chicago', 'mla', 'bibtex', 'ris'] as CitationFormat[]).map((format) => (
                            <button
                                key={format}
                                onClick={() => copyCitation(format)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault()
                                        copyCitation(format)
                                    }
                                }}
                                className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-dark-surface transition-colors text-left"
                                role="listitem"
                                aria-label={`Copy ${format.toUpperCase()} citation`}
                            >
                                <div>
                                    <span className="font-semibold text-text dark:text-dark-text">
                                        {format.toUpperCase()}
                                    </span>
                                    <p className="text-xs text-text-light dark:text-dark-text-muted mt-0.5">
                                        {format === 'apa' && 'American Psychological Association'}
                                        {format === 'chicago' && 'Chicago Manual of Style'}
                                        {format === 'bibtex' && 'LaTeX bibliography format'}
                                        {format === 'mla' && 'Modern Language Association'}
                                        {format === 'ris' && 'Zotero, Mendeley, EndNote'}
                                    </p>
                                </div>
                                {copiedFormat === format ? (
                                    <Check className="w-5 h-5 text-green-500" aria-hidden="true" />
                                ) : (
                                    <Copy className="w-5 h-5 text-text-light dark:text-dark-text-muted" aria-hidden="true" />
                                )}
                            </button>
                        ))}
                        <div className="text-xs text-text-light dark:text-dark-text-muted pt-3 border-t border-gray-100 dark:border-dark-border">
                            <p className="text-center mb-1.5 font-medium">Choose based on discipline</p>
                            <div className="flex flex-wrap justify-center gap-x-3 gap-y-1">
                                <span>APA → social sciences</span>
                                <span>Chicago → history</span>
                                <span>MLA → humanities</span>
                                <span>BibTeX → LaTeX</span>
                                <span>RIS → reference managers</span>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
