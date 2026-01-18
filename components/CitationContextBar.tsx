'use client'

import { useEffect, useState, useMemo } from 'react'
import { Link } from '@/navigation'
import { createClient } from '@/lib/supabase/client'
import { Link2, ArrowRight, X, ChevronDown, ChevronUp, MoreHorizontal } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

interface RelatedPost {
    id: string
    title: string
    tags: string[]
    discipline: string
    connectionType: 'citation' | 'tag-overlap' | 'fork'
    contentType?: string
}

interface CitationContextBarProps {
    postId: string
    currentTags?: string[]
}

export function CitationContextBar({ postId, currentTags = [] }: CitationContextBarProps) {
    const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([])
    const [tagColors, setTagColors] = useState<Record<string, string>>({})
    const [isExpanded, setIsExpanded] = useState(false) // Collapsed by default
    const [showAll, setShowAll] = useState(false)
    const [isVisible, setIsVisible] = useState(true)
    const [loading, setLoading] = useState(true)
    const [animatedTextIndex, setAnimatedTextIndex] = useState(0)
    const supabase = useMemo(() => createClient(), [])
    const t = useTranslations('Post')

    // Animated text cycling
    useEffect(() => {
        if (relatedPosts.length === 0 || isExpanded) return

        const interval = setInterval(() => {
            setAnimatedTextIndex((prev) => (prev + 1) % 2)
        }, 3000) // Switch every 3 seconds

        return () => clearInterval(interval)
    }, [relatedPosts.length, isExpanded])

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
            posts!citations_target_post_id_fkey(id, title, tags, content_type)
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
                            connectionType: 'citation',
                            contentType: c.posts.content_type
                        })
                    }
                })

                const { data: citationsIn } = await supabase
                    .from('citations')
                    .select(`
            source_post_id,
            posts!citations_source_post_id_fkey(id, title, tags, content_type)
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
                            connectionType: 'citation',
                            contentType: c.posts.content_type
                        })
                    }
                })

                // 2. Fetch posts with overlapping tags (cross-disciplinary)
                if (currentTags.length > 0) {
                    const { data: tagOverlap } = await supabase
                        .from('posts')
                        .select('id, title, tags, content_type')
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
                                connectionType: 'tag-overlap',
                                contentType: post.content_type
                            })
                        }
                    })
                }

                // 3. Fetch forks
                const { data: forks } = await supabase
                    .from('posts')
                    .select('id, title, tags, content_type')
                    .eq('forked_from_id', postId)
                    .limit(2)

                forks?.forEach((fork: any) => {
                    if (!related.find(r => r.id === fork.id)) {
                        related.push({
                            id: fork.id,
                            title: fork.title,
                            tags: fork.tags || [],
                            discipline: fork.tags?.[0] || 'Research',
                            connectionType: 'fork',
                            contentType: fork.content_type
                        })
                    }
                })

                setRelatedPosts(related.slice(0, 10)) // Keep more for "View more"
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
            case 'citation': return t('cites') // Check if 'cites' exists or add it
            case 'tag-overlap': return t('relatedTo')
            case 'fork': return t('inspired') // Check if 'inspired' exists or add it
            default: return t('connectsTo') // Check if 'connectsTo' exists or add it
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

    const disciplineCount = Object.keys(disciplineGroups).length
    const firstPostTitle = relatedPosts[0]?.title || 'Related content'

    // Animated text options
    const animatedTexts = [
        t('connectionsAcross', { count: relatedPosts.length, disciplines: disciplineCount }),
        `${t('relatedTo')}: ${firstPostTitle.length > 40 ? firstPostTitle.slice(0, 37) + '...' : firstPostTitle}`
    ]

    // Limit displayed items based on showAll state
    const displayLimit = showAll ? Object.keys(disciplineGroups).length : 3
    const visibleDisciplineEntries = Object.entries(disciplineGroups).slice(0, displayLimit)
    const hasMore = Object.keys(disciplineGroups).length > 3

    return (
        <div className="fixed bottom-8 z-40 left-4 right-28 md:left-0 md:right-0 md:px-6 mx-auto max-w-4xl">
            <style>{`
                @media (max-width: 768px) {
                    .global-fab {
                        bottom: 2rem !important;
                    }
                }
            `}</style>
            <div className="bg-white/95 dark:bg-dark-surface/95 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-dark-border shadow-soft-lg overflow-hidden">
                {/* Header */}
                <div
                    className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-bg/50 transition-colors"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="p-1.5 rounded-lg bg-primary/10 flex-shrink-0">
                            <Link2 className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-sm font-semibold text-text dark:text-dark-text whitespace-nowrap">
                            {t('contextualThreads')}
                        </span>
                        {/* Animated text with fixed width and horizontal scroll for long text */}
                        <div className="relative overflow-hidden flex-1 min-w-0 h-5">
                            <div
                                className="absolute inset-0 flex items-center whitespace-nowrap animate-fade-in"
                                key={animatedTextIndex}
                            >
                                <span
                                    className={`text-xs text-text-light dark:text-gray-400 ${animatedTexts[animatedTextIndex].length > 45 ? 'animate-marquee' : ''}`}
                                >
                                    {animatedTexts[animatedTextIndex]}
                                </span>
                            </div>
                        </div>
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
                            <X className="w-4 h-4 text-text-light dark:text-gray-400" />
                        </button>
                        {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-text-light dark:text-gray-400" />
                        ) : (
                            <ChevronUp className="w-4 h-4 text-text-light dark:text-gray-400" />
                        )}
                    </div>
                </div>

                {/* Content - Progressive Disclosure */}
                {
                    isExpanded && (
                        <div className="px-4 pb-4 space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            {visibleDisciplineEntries.map(([discipline, posts]) => (
                                <div key={discipline} className="flex flex-col md:flex-row items-start gap-2 md:gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-bg/30 transition-colors">
                                    {/* Discipline Badge */}
                                    <span
                                        className="px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap min-w-fit text-white"
                                        style={{ backgroundColor: tagColors[discipline] || '#6B7280' }}
                                    >
                                        {discipline}
                                    </span>

                                    <div className="flex-1 min-w-0 space-y-1 w-full">
                                        {posts.map((post) => (
                                            <Link
                                                key={post.id}
                                                href={post.contentType === 'resource' ? `/resources/${post.id}` : `/post/${post.id}`}
                                                className="block group"
                                            >
                                                <span className="text-sm font-medium text-text dark:text-dark-text truncate group-hover:text-primary dark:group-hover:text-accent-light transition-colors">
                                                    {post.title}
                                                </span>
                                            </Link>
                                        ))}
                                    </div>

                                    <ArrowRight className="w-4 h-4 text-text-light dark:text-dark-text-muted flex-shrink-0" />
                                </div>
                            ))}

                            {/* View More Button */}
                            {hasMore && !showAll && (
                                <button
                                    onClick={() => setShowAll(true)}
                                    className="flex items-center gap-2 text-sm text-primary hover:text-primary-dark transition-colors mx-auto"
                                >
                                    <MoreHorizontal className="w-4 h-4" />
                                    {t('viewAllDisciplines', { count: Object.keys(disciplineGroups).length })}
                                </button>
                            )}

                            {/* Collapse button when expanded */}
                            {showAll && hasMore && (
                                <button
                                    onClick={() => setShowAll(false)}
                                    className="flex items-center gap-2 text-sm text-text-light dark:text-dark-text-muted hover:text-text transition-colors mx-auto"
                                >
                                    <ChevronUp className="w-4 h-4" />
                                    {t('showLess')}
                                </button>
                            )}
                        </div>
                    )
                }
            </div >
        </div >
    )
}
