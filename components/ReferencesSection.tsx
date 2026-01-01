'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { BookOpen, ExternalLink, FileText, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface InternalCitation {
    id: string
    type: 'internal'
    quote_content?: string | null
    target_post: {
        id: string
        title: string
        created_at: string
        author?: {
            name?: string | null
            email?: string | null
        } | null
    }
}

interface ExternalCitation {
    id: string
    type: 'external'
    external_url?: string | null
    external_doi?: string | null
    external_title?: string | null
    external_author?: string | null
    external_year?: number | null
    external_source?: string | null
}

type Citation = InternalCitation | ExternalCitation

interface ReferencesSectionProps {
    postId: string
}

export function ReferencesSection({ postId }: ReferencesSectionProps) {
    const [citations, setCitations] = useState<Citation[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = useMemo(() => createClient(), [])
    const t = useTranslations('Post')

    useEffect(() => {
        async function fetchReferences() {
            if (!postId) {
                setLoading(false)
                return
            }

            try {
                // Fetch citations with a joined query matching the pattern in PostPage
                // We are explicit about the table and the foreign key relationship
                const { data, error } = await supabase
                    .from('citations')
                    .select(`
                        id,
                        type,
                        quote_content,
                        external_url,
                        external_doi,
                        external_title,
                        external_author,
                        external_year,
                        external_source,
                        target_post:posts!citations_target_post_id_fkey (
                            id,
                            title,
                            created_at,
                            author:users!posts_author_id_fkey (
                                name,
                                email
                            )
                        )
                    `)
                    .eq('source_post_id', postId)
                    .order('created_at', { ascending: true })

                if (error) {
                    console.error('ReferencesSection: Supabase error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
                    console.error('ReferencesSection: Supabase error details:', {
                        message: error.message,
                        code: error.code,
                        details: error.details,
                        hint: error.hint
                    })
                    return
                }

                if (!data) {
                    setCitations([])
                    return
                }

                setCitations(data as Citation[])
            } catch (err: any) {
                console.error('ReferencesSection: Caught exception', {
                    message: err.message || 'Unknown error',
                    stack: err.stack,
                    fullError: err
                })
            } finally {
                setLoading(false)
            }
        }

        fetchReferences()
    }, [postId, supabase])

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-text-light" />
            </div>
        )
    }

    if (citations.length === 0) {
        return null // Don't show empty section
    }

    const internalCitations = citations.filter((c): c is InternalCitation => c.type === 'internal')
    const externalCitations = citations.filter((c): c is ExternalCitation => c.type === 'external')

    return (
        <section className="border-t border-gray-200 dark:border-dark-border pt-8 mt-8">
            <div className="flex items-center gap-2 mb-6">
                <BookOpen className="w-5 h-5 text-primary dark:text-primary-light" />
                <h2 className="text-xl font-bold text-text dark:text-dark-text">
                    {t('references')} ({citations.length})
                </h2>
            </div>

            <div className="space-y-6">
                {/* Internal (SyriaHub) References */}
                {internalCitations.length > 0 && (
                    <div>
                        <h3 className="text-sm font-semibold text-text-light dark:text-dark-text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            {t('internalReference')}
                        </h3>
                        <ol className="list-decimal list-inside space-y-3 pl-1">
                            {internalCitations.map((citation) => (
                                <li key={citation.id} className="text-sm">
                                    <Link
                                        href={`/post/${citation.target_post.id}`}
                                        className="text-primary dark:text-primary-light hover:underline font-medium"
                                    >
                                        {citation.target_post.title}
                                    </Link>
                                    <span className="text-text-light dark:text-dark-text-muted">
                                        {' '}— {citation.target_post.author?.name || citation.target_post.author?.email?.split('@')[0] || 'Anonymous'}
                                        {citation.target_post.created_at && (
                                            <> ({new Date(citation.target_post.created_at).getFullYear()})</>
                                        )}
                                    </span>
                                    {citation.quote_content && (
                                        <blockquote className="mt-1 pl-3 border-l-2 border-gray-300 dark:border-dark-border text-text-light dark:text-dark-text-muted italic text-xs line-clamp-2">
                                            &quot;{citation.quote_content}&quot;
                                        </blockquote>
                                    )}
                                </li>
                            ))}
                        </ol>
                    </div>
                )}

                {/* External References */}
                {externalCitations.length > 0 && (
                    <div>
                        <h3 className="text-sm font-semibold text-text-light dark:text-dark-text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
                            <ExternalLink className="w-4 h-4" />
                            {t('externalReference')}
                        </h3>
                        <ol className="list-decimal list-inside space-y-3 pl-1" start={internalCitations.length + 1}>
                            {externalCitations.map((citation) => {
                                const url = citation.external_url || (citation.external_doi ? `https://doi.org/${citation.external_doi}` : null)
                                const displayTitle = citation.external_title || citation.external_doi || citation.external_url || 'Unknown source'

                                return (
                                    <li key={citation.id} className="text-sm">
                                        {url ? (
                                            <a
                                                href={url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary dark:text-primary-light hover:underline font-medium inline-flex items-center gap-1"
                                            >
                                                {displayTitle}
                                                <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                            </a>
                                        ) : (
                                            <span className="font-medium text-text dark:text-dark-text">{displayTitle}</span>
                                        )}
                                        <span className="text-text-light dark:text-dark-text-muted">
                                            {citation.external_author && <> — {citation.external_author}</>}
                                            {citation.external_year && <> ({citation.external_year})</>}
                                            {citation.external_source && <> • {citation.external_source}</>}
                                        </span>
                                        {citation.external_doi && (
                                            <span className="text-xs text-text-light dark:text-dark-text-muted ml-2">
                                                DOI: {citation.external_doi}
                                            </span>
                                        )}
                                    </li>
                                )
                            })}
                        </ol>
                    </div>
                )}
            </div>
        </section>
    )
}
