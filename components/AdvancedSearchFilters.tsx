'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { Search, X, SlidersHorizontal, ChevronDown, ChevronUp, Tag as TagIcon, Clock, Users, FileText, Globe, ArrowUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

interface Tag {
    id: string
    label: string
    discipline: string
    color: string
}

export function AdvancedSearchFilters() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isExpanded, setIsExpanded] = useState(true)
    const [tags, setTags] = useState<Tag[]>([])
    const [loadingTags, setLoadingTags] = useState(true)

    // Get current filter values
    const query = searchParams.get('q') || ''
    const currentType = searchParams.get('type') || ''
    const currentDate = searchParams.get('date') || ''
    const currentTag = searchParams.get('tag') || ''
    const currentSort = searchParams.get('sort') || 'relevance'

    // Fetch available tags
    useEffect(() => {
        async function fetchTags() {
            const supabase = createClient()
            const { data } = await supabase
                .from('tags')
                .select('id, label, discipline, color')
                .order('label')

            if (data) setTags(data)
            setLoadingTags(false)
        }
        fetchTags()
    }, [])

    const createQueryString = useCallback(
        (updates: Record<string, string>) => {
            const params = new URLSearchParams(searchParams.toString())
            Object.entries(updates).forEach(([key, value]) => {
                if (value) {
                    params.set(key, value)
                } else {
                    params.delete(key)
                }
            })
            return params.toString()
        },
        [searchParams]
    )

    const handleFilterChange = (name: string, value: string) => {
        router.push(`/search?${createQueryString({ [name]: value })}`)
    }

    const clearAllFilters = () => {
        router.push(`/search?q=${encodeURIComponent(query)}`)
    }

    const hasActiveFilters = currentType || currentDate || currentTag || currentSort !== 'relevance'

    const typeOptions = [
        { value: '', label: 'All Types', icon: null },
        { value: 'post', label: 'Posts', icon: FileText },
        { value: 'group', label: 'Groups', icon: Globe },
        { value: 'user', label: 'Users', icon: Users },
    ]

    const dateOptions = [
        { value: '', label: 'Any time' },
        { value: 'today', label: 'Past 24 hours' },
        { value: 'week', label: 'Past week' },
        { value: 'month', label: 'Past month' },
        { value: 'year', label: 'Past year' },
    ]

    const sortOptions = [
        { value: 'relevance', label: 'Most Relevant' },
        { value: 'recent', label: 'Most Recent' },
        { value: 'popular', label: 'Most Popular' },
    ]

    // Group tags by discipline
    const tagsByDiscipline = tags.reduce((acc, tag) => {
        const discipline = tag.discipline || 'Other'
        if (!acc[discipline]) acc[discipline] = []
        acc[discipline].push(tag)
        return acc
    }, {} as Record<string, Tag[]>)

    return (
        <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border overflow-hidden">
            {/* Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors"
            >
                <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-5 h-5 text-primary" />
                    <span className="font-semibold text-text dark:text-dark-text">Filters</span>
                    {hasActiveFilters && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full">
                            Active
                        </span>
                    )}
                </div>
                {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-text-light dark:text-dark-text-muted" />
                ) : (
                    <ChevronDown className="w-5 h-5 text-text-light dark:text-dark-text-muted" />
                )}
            </button>

            {isExpanded && (
                <div className="p-4 pt-0 space-y-6">
                    {/* Clear Filters */}
                    {hasActiveFilters && (
                        <button
                            onClick={clearAllFilters}
                            className="flex items-center gap-2 text-sm text-primary hover:underline"
                        >
                            <X className="w-4 h-4" />
                            Clear all filters
                        </button>
                    )}

                    {/* Content Type */}
                    <div>
                        <h3 className="flex items-center gap-2 font-semibold mb-3 text-sm text-text dark:text-dark-text">
                            <FileText className="w-4 h-4 text-text-light dark:text-dark-text-muted" />
                            Content Type
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                            {typeOptions.map((option) => {
                                const Icon = option.icon
                                return (
                                    <button
                                        key={option.value}
                                        onClick={() => handleFilterChange('type', option.value)}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${currentType === option.value
                                                ? 'bg-primary text-white'
                                                : 'bg-gray-100 dark:bg-dark-bg text-text-light dark:text-dark-text-muted hover:bg-gray-200 dark:hover:bg-dark-border'
                                            }`}
                                    >
                                        {Icon && <Icon className="w-4 h-4" />}
                                        {option.label}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Date Range */}
                    <div>
                        <h3 className="flex items-center gap-2 font-semibold mb-3 text-sm text-text dark:text-dark-text">
                            <Clock className="w-4 h-4 text-text-light dark:text-dark-text-muted" />
                            Date Range
                        </h3>
                        <div className="space-y-1">
                            {dateOptions.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => handleFilterChange('date', option.value)}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${currentDate === option.value
                                            ? 'bg-primary/10 text-primary font-medium'
                                            : 'text-text-light dark:text-dark-text-muted hover:bg-gray-100 dark:hover:bg-dark-bg'
                                        }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Sort By */}
                    <div>
                        <h3 className="flex items-center gap-2 font-semibold mb-3 text-sm text-text dark:text-dark-text">
                            <ArrowUpDown className="w-4 h-4 text-text-light dark:text-dark-text-muted" />
                            Sort By
                        </h3>
                        <div className="space-y-1">
                            {sortOptions.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => handleFilterChange('sort', option.value)}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${currentSort === option.value
                                            ? 'bg-primary/10 text-primary font-medium'
                                            : 'text-text-light dark:text-dark-text-muted hover:bg-gray-100 dark:hover:bg-dark-bg'
                                        }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tags */}
                    {currentType !== 'user' && currentType !== 'group' && (
                        <div>
                            <h3 className="flex items-center gap-2 font-semibold mb-3 text-sm text-text dark:text-dark-text">
                                <TagIcon className="w-4 h-4 text-text-light dark:text-dark-text-muted" />
                                Tags
                            </h3>
                            {loadingTags ? (
                                <div className="space-y-2">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="h-8 bg-gray-100 dark:bg-dark-bg rounded-lg animate-pulse" />
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                                    {/* Clear tag selection */}
                                    {currentTag && (
                                        <button
                                            onClick={() => handleFilterChange('tag', '')}
                                            className="flex items-center gap-2 text-sm text-primary hover:underline mb-2"
                                        >
                                            <X className="w-3 h-3" />
                                            Clear tag filter
                                        </button>
                                    )}

                                    {Object.entries(tagsByDiscipline).map(([discipline, disciplineTags]) => (
                                        <div key={discipline}>
                                            <p className="text-xs font-medium text-text-light dark:text-dark-text-muted uppercase tracking-wider mb-2">
                                                {discipline}
                                            </p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {disciplineTags.map((tag) => (
                                                    <button
                                                        key={tag.id}
                                                        onClick={() => handleFilterChange('tag', tag.label)}
                                                        className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${currentTag === tag.label
                                                                ? 'ring-2 ring-primary ring-offset-2 dark:ring-offset-dark-surface'
                                                                : ''
                                                            }`}
                                                        style={{
                                                            backgroundColor: `${tag.color}20`,
                                                            color: tag.color,
                                                        }}
                                                    >
                                                        #{tag.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
