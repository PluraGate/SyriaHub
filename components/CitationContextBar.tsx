'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Link2, ArrowRight, X, ChevronDown, ChevronUp } from 'lucide-react'

interface RelatedPost {
    id: string
    title: string
    tags: string[]
    discipline: string
    connectionType: 'citation' | 'tag-overlap' | 'fork'
}

interface CitationContextBarProps {
    postId: string
    currentTags?: string[]
}

export function CitationContextBar({ postId, currentTags = [] }: CitationContextBarProps) {
    const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([])
    const [tagColors, setTagColors] = useState<Record<string, string>>({})
    const [isExpanded, setIsExpanded] = useState(true)
    const [isVisible, setIsVisible] = useState(true)
    const [loading, setLoading] = useState(true)
    const supabase = useMemo(() => createClient(), [])

    useEffect(() => {
        async function fetchRelatedContent() {
            try {
                // Fetch tag colors first
                const { data: tags } = await supabase.from('tags').select('label, color')
                if (tags) {
                    const colors: Record<string, string> = {}
                    tags.forEach((tag: any) => {
                        colors[tag.label] = tag.color
                    })
                    setTagColors(colors)
                }

                const related: RelatedPost[] = []

                // 1. Fetch citations (posts that cite or are cited by this post)
                const { data: citationsOut } = await supabase
                    .from('citations')
                    .select(`
            target_post_id,
            posts!citations_target_post_id_fkey(id, title, tags)
          `)
                    .eq('source_post_id', postId)
                    .limit(3)

                citationsOut?.forEach((c: any) => {
                    if (c.posts) {
                        related.push({
                            id: c.posts.id,
                            title: c.posts.title,
                            tags: c.posts.tags || [],
                            discipline: c.posts.tags?.[0] || 'Research',
                            connectionType: 'citation'
                        })
                    }
                })

                const { data: citationsIn } = await supabase
                    .from('citations')
                    .select(`
            source_post_id,
            posts!citations_source_post_id_fkey(id, title, tags)
          `)
                    .eq('target_post_id', postId)
                    .limit(3)

                citationsIn?.forEach((c: any) => {
                    if (c.posts && !related.find(r => r.id === c.posts.id)) {
                        related.push({
                            id: c.posts.id,
                            title: c.posts.title,
                            tags: c.posts.tags || [],
                            discipline: c.posts.tags?.[0] || 'Research',
                            connectionType: 'citation'
                        })
                    }
                })

                // 2. Fetch posts with overlapping tags (cross-disciplinary)
                if (currentTags.length > 0) {
                    const { data: tagOverlap } = await supabase
                        .from('posts')
                        .select('id, title, tags')
                        .neq('id', postId)
                        .overlaps('tags', currentTags)
                        .limit(5)

                    tagOverlap?.forEach((post: any) => {
                        if (!related.find(r => r.id === post.id)) {
                            // Find the first tag that's different from the current post's primary tag
                            const crossDiscipline = post.tags?.find(
                                (t: string) => currentTags[0] && t !== currentTags[0]
                            ) || post.tags?.[0]

                            related.push({
                                id: post.id,
                                title: post.title,
                                tags: post.tags || [],
                                discipline: crossDiscipline || 'Research',
                                connectionType: 'tag-overlap'
                            })
                        }
                    })
                }

                // 3. Fetch forks
                const { data: forks } = await supabase
                    .from('posts')
                    .select('id, title, tags')
                    .eq('forked_from_id', postId)
                    .limit(2)

                forks?.forEach((fork: any) => {
                    if (!related.find(r => r.id === fork.id)) {
                        related.push({
                            id: fork.id,
                            title: fork.title,
                            tags: fork.tags || [],
                            discipline: fork.tags?.[0] || 'Research',
                            connectionType: 'fork'
                        })
                    }
                })

                setRelatedPosts(related.slice(0, 6))
            } catch (error) {
                console.error('Error fetching related content:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchRelatedContent()
    }, [postId, currentTags, supabase])

    if (!isVisible || loading || relatedPosts.length === 0) {
        return null
    }

    const getConnectionLabel = (type: string) => {
        switch (type) {
            case 'citation': return 'cites'
            case 'tag-overlap': return 'relates to'
            case 'fork': return 'inspired'
            default: return 'connects to'
        }
    }

    // Group by discipline for cross-disciplinary display
    const disciplineGroups = relatedPosts.reduce((acc, post) => {
        const discipline = post.discipline
        if (!acc[discipline]) {
            acc[discipline] = []
        }
        acc[discipline].push(post)
        return acc
    }, {} as Record<string, RelatedPost[]>)

    return (
        <div className="sticky bottom-4 z-40 mx-auto max-w-4xl px-4">
            <div className="bg-white/95 dark:bg-dark-surface/95 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-dark-border shadow-soft-lg overflow-hidden">
                {/* Header */}
                <div
                    className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-bg/50 transition-colors"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-lg bg-primary/10">
                            <Link2 className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-sm font-semibold text-text dark:text-dark-text">
                            Contextual Threads
                        </span>
                        <span className="text-xs text-text-light dark:text-dark-text-muted">
                            {relatedPosts.length} connections across {Object.keys(disciplineGroups).length} disciplines
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                setIsVisible(false)
                            }}
                            className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-border transition-colors"
                            aria-label="Close"
                        >
                            <X className="w-4 h-4 text-text-light dark:text-dark-text-muted" />
                        </button>
                        {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-text-light dark:text-dark-text-muted" />
                        ) : (
                            <ChevronUp className="w-4 h-4 text-text-light dark:text-dark-text-muted" />
                        )}
                    </div>
                </div>

                {/* Content */}
                {isExpanded && (
                    <div className="px-4 pb-4 space-y-3">
                        {Object.entries(disciplineGroups).map(([discipline, posts]) => (
                            <div key={discipline} className="flex items-start gap-3">
                                {/* Discipline Badge */}
                                <div
                                    className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium text-white"
                                    style={{ backgroundColor: tagColors[discipline] || '#6B7280' }}
                                >
                                    {discipline}
                                </div>

                                {/* Related Posts */}
                                <div className="flex-1 flex flex-wrap items-center gap-2">
                                    {posts.map((post, idx) => (
                                        <div key={post.id} className="flex items-center gap-1.5">
                                            {idx > 0 && (
                                                <span className="text-xs text-text-light dark:text-dark-text-muted">•</span>
                                            )}
                                            <span className="text-xs text-text-light dark:text-dark-text-muted">
                                                {getConnectionLabel(post.connectionType)}
                                            </span>
                                            <Link
                                                href={`/post/${post.id}`}
                                                className="text-sm font-medium text-primary dark:text-primary-light hover:underline truncate max-w-[200px]"
                                                title={post.title}
                                            >
                                                {post.title}
                                            </Link>
                                        </div>
                                    ))}
                                </div>

                                <ArrowRight className="w-4 h-4 text-text-light dark:text-dark-text-muted flex-shrink-0" />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
