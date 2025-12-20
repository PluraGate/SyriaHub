'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
    Bookmark, Globe, Database, Calendar, ExternalLink, Trash2,
    Clock, AlertTriangle, Search, SortAsc, SortDesc, Filter
} from 'lucide-react'
import { CopyCitationButton } from '@/components/CopyCitationButton'
import { useTranslations } from 'next-intl'

interface SavedPost {
    id: string
    title: string
    content?: string
    tags?: string[]
    created_at: string
    author?: { id: string; name: string; email?: string }
    bookmark_id: string
}

interface SavedReference {
    id: string
    title: string
    url: string
    snippet?: string
    source?: string
    citation?: string
    created_at: string
}

interface SavedEvent {
    id: string
    title: string
    event_date?: string
    location?: string
    description?: string
    created_at: string
    bookmark_id: string
}

interface SavedItemsManagerProps {
    posts: SavedPost[]
    references: SavedReference[]
    events?: SavedEvent[]
}

type ItemType = 'all' | 'posts' | 'events' | 'web'
type SortOrder = 'newest' | 'oldest' | 'alphabetical'

export function SavedItemsManager({ posts, references, events = [] }: SavedItemsManagerProps) {
    const t = useTranslations('Saved')
    const tCommon = useTranslations('Common')
    const [activeFilter, setActiveFilter] = useState<ItemType>('all')
    const [sortOrder, setSortOrder] = useState<SortOrder>('newest')
    const [localPosts, setLocalPosts] = useState(posts)
    const [localReferences, setLocalReferences] = useState(references)
    const [localEvents, setLocalEvents] = useState(events)
    const [deleting, setDeleting] = useState<string | null>(null)

    // Remove a bookmarked post
    const removePost = async (bookmarkId: string) => {
        setDeleting(bookmarkId)
        try {
            const res = await fetch(`/api/bookmarks?id=${bookmarkId}`, { method: 'DELETE' })
            if (res.ok) {
                setLocalPosts(prev => prev.filter(p => p.bookmark_id !== bookmarkId))
            }
        } catch (error) {
            console.error('Error removing post:', error)
        } finally {
            setDeleting(null)
        }
    }

    // Remove a web reference
    const removeReference = async (id: string) => {
        setDeleting(id)
        try {
            const res = await fetch(`/api/saved-references?id=${id}`, { method: 'DELETE' })
            if (res.ok) {
                setLocalReferences(prev => prev.filter(r => r.id !== id))
            }
        } catch (error) {
            console.error('Error removing reference:', error)
        } finally {
            setDeleting(null)
        }
    }

    // Remove an event bookmark
    const removeEvent = async (bookmarkId: string) => {
        setDeleting(bookmarkId)
        try {
            const res = await fetch(`/api/bookmarks?id=${bookmarkId}`, { method: 'DELETE' })
            if (res.ok) {
                setLocalEvents(prev => prev.filter(e => e.bookmark_id !== bookmarkId))
            }
        } catch (error) {
            console.error('Error removing event:', error)
        } finally {
            setDeleting(null)
        }
    }

    // Sort items by date or alphabetically
    const sortItems = <T extends { title: string; created_at: string }>(items: T[]): T[] => {
        return [...items].sort((a, b) => {
            if (sortOrder === 'alphabetical') {
                return a.title.localeCompare(b.title)
            }
            const dateA = new Date(a.created_at).getTime()
            const dateB = new Date(b.created_at).getTime()
            return sortOrder === 'newest' ? dateB - dateA : dateA - dateB
        })
    }

    // Get counts
    const counts = {
        all: localPosts.length + localReferences.length + localEvents.length,
        posts: localPosts.length,
        events: localEvents.length,
        web: localReferences.length
    }

    // Filter buttons configuration
    const filterButtons: { type: ItemType; icon: typeof Database; label: string; color: string }[] = [
        { type: 'all', icon: Bookmark, label: 'All', color: 'gray' },
        { type: 'posts', icon: Database, label: 'Posts', color: 'primary' },
        { type: 'events', icon: Calendar, label: 'Events', color: 'purple' },
        { type: 'web', icon: Globe, label: 'Web', color: 'blue' }
    ]

    const getColorClasses = (color: string, isActive: boolean) => {
        if (!isActive) return 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
        switch (color) {
            case 'primary': return 'bg-primary/10 text-primary'
            case 'blue': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
            case 'purple': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
            default: return 'bg-gray-200 dark:bg-dark-border text-gray-800 dark:text-gray-200'
        }
    }

    return (
        <div>
            {/* Header with filters and sort */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                {/* Type Filters */}
                <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-dark-border rounded-lg">
                    {filterButtons.map(({ type, icon: Icon, label, color }) => (
                        <button
                            key={type}
                            onClick={() => setActiveFilter(type)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${getColorClasses(color, activeFilter === type)}`}
                        >
                            <Icon className="w-4 h-4" />
                            {label}
                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeFilter === type ? 'bg-white/50' : 'bg-gray-200 dark:bg-dark-bg'}`}>
                                {counts[type]}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Sort dropdown */}
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">{t('sort')}:</span>
                    <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                        className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface"
                    >
                        <option value="newest">{t('newestFirst')}</option>
                        <option value="oldest">{t('oldestFirst')}</option>
                        <option value="alphabetical">{t('alphabetical')}</option>
                    </select>
                </div>
            </div>

            {/* Items List */}
            <div className="space-y-4">
                {/* Posts */}
                {(activeFilter === 'all' || activeFilter === 'posts') && sortItems(localPosts).map((post) => (
                    <div
                        key={post.id}
                        className="bg-white dark:bg-dark-surface rounded-xl border border-primary/20 dark:border-primary/30 p-4 hover:shadow-md transition-all group"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                                <div className="shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <Database className="w-4 h-4 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Link
                                            href={`/post/${post.id}`}
                                            className="font-medium text-gray-900 dark:text-gray-100 hover:text-primary transition-colors line-clamp-1"
                                        >
                                            {post.title}
                                        </Link>
                                        <span className="text-xs px-1.5 py-0.5 bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 rounded font-medium">
                                            Post
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                                        {post.author?.name && <span>{post.author.name}</span>}
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            Saved {new Date(post.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => removePost(post.bookmark_id)}
                                disabled={deleting === post.bookmark_id}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors disabled:opacity-50"
                                title="Remove from saved"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}

                {/* Events */}
                {(activeFilter === 'all' || activeFilter === 'events') && sortItems(localEvents).map((event) => (
                    <div
                        key={event.id}
                        className="bg-white dark:bg-dark-surface rounded-xl border border-purple-200 dark:border-purple-900/30 p-4 hover:shadow-md transition-all group"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                                <div className="shrink-0 w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                    <Calendar className="w-4 h-4 text-purple-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Link
                                            href={`/events/${event.id}`}
                                            className="font-medium text-gray-900 dark:text-gray-100 hover:text-purple-600 transition-colors line-clamp-1"
                                        >
                                            {event.title}
                                        </Link>
                                        <span className="text-xs px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded font-medium">
                                            Event
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                                        {event.event_date && <span>{new Date(event.event_date).toLocaleDateString()}</span>}
                                        {event.location && <span>• {event.location}</span>}
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            Saved {new Date(event.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => removeEvent(event.bookmark_id)}
                                disabled={deleting === event.bookmark_id}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors disabled:opacity-50"
                                title="Remove from saved"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}

                {/* Web References */}
                {(activeFilter === 'all' || activeFilter === 'web') && sortItems(localReferences).map((ref) => (
                    <div
                        key={ref.id}
                        className="bg-white dark:bg-dark-surface rounded-xl border border-blue-100 dark:border-blue-900/30 p-4 hover:shadow-md transition-all group"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                                <div className="shrink-0 w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                                    <Globe className="w-4 h-4 text-blue-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <a
                                            href={ref.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 transition-colors line-clamp-1"
                                        >
                                            {ref.title}
                                        </a>
                                        <span className="text-xs px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded font-medium">
                                            Web
                                        </span>
                                        <span className="text-xs px-1.5 py-0.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded flex items-center gap-1">
                                            <AlertTriangle className="w-3 h-3" />
                                            Unassessed
                                        </span>
                                    </div>
                                    {ref.snippet && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1 mb-1">{ref.snippet}</p>
                                    )}
                                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                                        {ref.source && <span className="flex items-center gap-1"><Globe className="w-3 h-3 text-blue-500" />{ref.source}</span>}
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            Saved {new Date(ref.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <a
                                            href={ref.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600 transition-colors"
                                        >
                                            <ExternalLink className="w-3 h-3" />
                                            Open
                                        </a>
                                        {ref.citation && <CopyCitationButton citation={ref.citation} />}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => removeReference(ref.id)}
                                disabled={deleting === ref.id}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors disabled:opacity-50"
                                title="Remove from saved"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}

                {/* Empty State */}
                {counts[activeFilter] === 0 && (
                    <div className="text-center py-16">
                        <Bookmark className="w-12 h-12 mx-auto text-gray-300 dark:text-dark-border mb-4" />
                        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                            No {activeFilter === 'all' ? 'saved items' : activeFilter} yet
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">
                            {activeFilter === 'posts' && 'Bookmark posts from the feed to save them here.'}
                            {activeFilter === 'events' && 'Save events from the events page to see them here.'}
                            {activeFilter === 'web' && 'Save web search results from the Research Lab.'}
                            {activeFilter === 'all' && 'Start saving posts, events, and web references to see them here.'}
                        </p>
                        <Link href={activeFilter === 'web' ? '/research-lab/search' : '/feed'} className="btn btn-primary">
                            {activeFilter === 'web' ? 'Go to Search Engine' : 'Explore Content'}
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
