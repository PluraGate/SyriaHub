'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { Search, Filter, Loader2, ChevronDown, X, Info, AlertTriangle, Link2, Quote, FileDown, Bookmark, ExternalLink, MoreHorizontal, Globe, Database, History, Copy, Plus, GitBranch, Check, Clock, FileText, Users, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TrustBadge } from '@/components/TrustProfileCard'
import { InlineConflictBadge } from '@/components/ConflictWarning'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useTypeahead } from '@/hooks/useTypeahead'
import type {
    SearchResult, SearchFilters, Discipline, EvidenceTier, ConflictPhase,
    DisciplineCategory
} from '@/types/advanced'

// Discipline categories for filter UI
const DISCIPLINE_CATEGORIES: { id: DisciplineCategory; name: string; disciplines: Discipline[] }[] = [
    { id: 'built_environment', name: 'Built Environment', disciplines: ['architecture', 'structural_engineering', 'urban_planning', 'heritage_conservation', 'construction_methods'] },
    { id: 'earth_spatial', name: 'Earth & Spatial', disciplines: ['gis_remote_sensing', 'topography_surveying', 'environmental_science', 'hydrology_climate'] },
    { id: 'data_tech', name: 'Data & Tech', disciplines: ['digital_twins', 'bim_scan', 'ai_ml', 'iot_monitoring', 'simulation_modelling'] },
    { id: 'socio_political', name: 'Socio-Political', disciplines: ['governance_policy', 'housing_land_property', 'legal_frameworks', 'economics_financing'] },
    { id: 'human_cultural', name: 'Human & Cultural', disciplines: ['sociology', 'anthropology', 'oral_history', 'memory_documentation', 'conflict_studies'] },
    { id: 'transitional', name: 'Transitional', disciplines: ['shelter_housing', 'water_sanitation', 'energy_infrastructure', 'transport_logistics'] },
]

const EVIDENCE_TIERS: { value: EvidenceTier; label: string; description: string }[] = [
    { value: 'primary', label: 'Primary', description: 'Field surveys, scans, photos' },
    { value: 'secondary', label: 'Secondary', description: 'Papers, reports, documents' },
    { value: 'derived', label: 'Derived', description: 'Models, simulations, AI' },
    { value: 'interpretive', label: 'Interpretive', description: 'Analysis, commentary' },
]

const CONFLICT_PHASES: { value: ConflictPhase; label: string }[] = [
    { value: 'pre_conflict', label: 'Pre-2011' },
    { value: 'active_conflict', label: 'Conflict (2011-2020)' },
    { value: 'de_escalation', label: 'De-escalation' },
    { value: 'early_reconstruction', label: 'Early Reconstruction' },
    { value: 'active_reconstruction', label: 'Active Reconstruction' },
]

// Utility to strip Markdown formatting from text
function stripMarkdown(text: string): string {
    if (!text) return ''
    return text
        // Remove headers (## Header)
        .replace(/^#{1,6}\s+/gm, '')
        // Remove bold/italic (**text**, *text*, __text__, _text_)
        .replace(/(\*\*|__)(.*?)\1/g, '$2')
        .replace(/(\*|_)(.*?)\1/g, '$2')
        // Remove links [text](url)
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        // Remove inline code `code`
        .replace(/`([^`]+)`/g, '$1')
        // Remove images ![alt](url)
        .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
        // Remove horizontal rules
        .replace(/^[-*_]{3,}\s*$/gm, '')
        // Remove blockquotes
        .replace(/^>\s+/gm, '')
        // Remove list markers
        .replace(/^[\s]*[-*+]\s+/gm, '')
        .replace(/^[\s]*\d+\.\s+/gm, '')
        // Clean up extra whitespace
        .replace(/\n{2,}/g, ' ')
        .replace(/\s{2,}/g, ' ')
        .trim()
}

// Suggestion type for autocomplete dropdown
interface Suggestion {
    id: string
    type: 'post' | 'user' | 'group' | 'event'
    title: string
    description: string
    url: string
}

export function ResearchSearchEngine() {
    const t = useTranslations('ResearchLab.searchEnginePage')
    const [query, setQuery] = useState('')
    const [filters, setFilters] = useState<SearchFilters>({})
    const [results, setResults] = useState<SearchResult[]>([])
    const [webResults, setWebResults] = useState<WebSearchResult[]>([])
    const [loading, setLoading] = useState(false)
    const [showFilters, setShowFilters] = useState(false)
    const [searchDuration, setSearchDuration] = useState<number | null>(null)
    const [expandedResult, setExpandedResult] = useState<string | null>(null)
    const [searchSource, setSearchSource] = useState<'internal' | 'web' | 'all'>('all')
    const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([])
    const [loadingSaved, setLoadingSaved] = useState(false)
    const [copiedId, setCopiedId] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<'search' | 'saved'>('search')
    const [savingSearch, setSavingSearch] = useState(false)
    const [isFromCache, setIsFromCache] = useState(false) // Track if results are from cache

    // Autocomplete dropdown state
    const [suggestions, setSuggestions] = useState<Suggestion[]>([])
    const [showDropdown, setShowDropdown] = useState(false)
    const [selectedIndex, setSelectedIndex] = useState(-1)
    const [loadingSuggestions, setLoadingSuggestions] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Typeahead hook for inline completion
    const { completion, acceptCompletion, trackSearch } = useTypeahead(query, {
        debounceMs: 100,
        minChars: 2
    })

    // Saved search type (matches database schema)
    interface SavedSearch {
        id: string
        query: string
        filters: SearchFilters
        source_type: 'internal' | 'web' | 'all'
        result_count: number
        title?: string
        notes?: string
        is_pinned: boolean
        created_at: string
        cached_results?: Record<string, unknown>
    }

    // Web search result type
    interface WebSearchResult {
        id: string
        title: string
        snippet: string
        url: string
        source: string
        date?: string
    }

    const handleSearch = useCallback(async () => {
        if (!query.trim()) return

        setLoading(true)
        setResults([])
        setWebResults([])
        setIsFromCache(false) // Fresh search, not from cache

        try {
            const promises: Promise<void>[] = []

            // Internal search (posts/resources)
            if (searchSource === 'internal' || searchSource === 'all') {
                promises.push(
                    fetch('/api/research-search', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            query: query.trim(),
                            filters,
                            explain: true,
                            limit: 20
                        })
                    })
                        .then(res => res.json())
                        .then(data => {
                            if (data.results) {
                                setResults(data.results)
                                setSearchDuration(data.search_duration_ms)
                            }
                        })
                )
            }

            // Web search (external sources)
            if (searchSource === 'web' || searchSource === 'all') {
                promises.push(
                    fetch('/api/web-search', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            query: `Syria reconstruction ${query.trim()}`,
                            limit: 10
                        })
                    })
                        .then(res => res.json())
                        .then(data => {
                            if (data.results) {
                                setWebResults(data.results)
                            }
                        })
                        .catch(() => {
                            // Web search failed, continue with internal results
                            console.log('Web search unavailable')
                        })
                )
            }

            await Promise.all(promises)
        } catch (error) {
            console.error('Search error:', error)
        } finally {
            setLoading(false)
        }
    }, [query, filters, searchSource])

    const updateFilter = <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => {
        setFilters(prev => ({ ...prev, [key]: value }))
    }

    const clearFilters = () => {
        setFilters({})
    }

    const activeFilterCount = Object.values(filters).filter(v =>
        v !== undefined && (Array.isArray(v) ? v.length > 0 : true)
    ).length

    // Load saved searches from database
    const loadSavedSearches = useCallback(async () => {
        setLoadingSaved(true)
        try {
            const response = await fetch('/api/saved-searches')
            const data = await response.json()
            if (data.searches) {
                setSavedSearches(data.searches)
            }
        } catch (error) {
            console.error('Error loading saved searches:', error)
        } finally {
            setLoadingSaved(false)
        }
    }, [])

    // Save current search to database
    const saveSearch = useCallback(async () => {
        if (!query.trim()) return

        setSavingSearch(true)
        try {
            const response = await fetch('/api/saved-searches', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: query.trim(),
                    filters,
                    source_type: searchSource,
                    result_count: results.length + webResults.length,
                    cached_results: {
                        internal: results,
                        web: webResults
                    }
                })
            })

            const data = await response.json()
            if (data.search) {
                setSavedSearches(prev => [data.search, ...prev])
            }
        } catch (error) {
            console.error('Error saving search:', error)
        } finally {
            setSavingSearch(false)
        }
    }, [query, filters, searchSource, results, webResults])

    // Delete a saved search
    const deleteSavedSearch = useCallback(async (id: string) => {
        try {
            await fetch(`/api/saved-searches?id=${id}`, { method: 'DELETE' })
            setSavedSearches(prev => prev.filter(s => s.id !== id))
        } catch (error) {
            console.error('Error deleting search:', error)
        }
    }, [])

    // Branch from saved search (load and modify)
    const branchSearch = useCallback((search: SavedSearch) => {
        setQuery(search.query)
        setFilters(search.filters)
        setSearchSource(search.source_type)
        setActiveTab('search')
    }, [])

    // Restore search from cache (NO API call - uses cached results)
    const restoreFromCache = useCallback((search: SavedSearch) => {
        setQuery(search.query)
        setFilters(search.filters)
        setSearchSource(search.source_type)
        setActiveTab('search')

        // Restore cached results if available
        if (search.cached_results) {
            const cached = search.cached_results as { internal?: any[], web?: any[] }
            if (cached.internal) {
                setResults(cached.internal)
            }
            if (cached.web) {
                setWebResults(cached.web)
            }
            setSearchDuration(null) // Cached, not measured
            setIsFromCache(true) // Mark as cached results
        } else {
            setIsFromCache(false)
        }
    }, [])

    // Copy link to clipboard
    const copyToClipboard = useCallback((text: string, id: string) => {
        navigator.clipboard.writeText(text)
        setCopiedId(id)
        setTimeout(() => setCopiedId(null), 2000)
    }, [])

    // Fetch autocomplete suggestions
    const fetchSuggestions = useCallback(async (searchQuery: string) => {
        if (searchQuery.length < 2) {
            setSuggestions([])
            return
        }

        setLoadingSuggestions(true)
        try {
            const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(searchQuery)}`)
            if (response.ok) {
                const data = await response.json()
                setSuggestions(data.suggestions || [])
            }
        } catch (error) {
            console.error('Failed to fetch suggestions:', error)
        } finally {
            setLoadingSuggestions(false)
        }
    }, [])

    // Debounced fetch for suggestions
    useEffect(() => {
        const timer = setTimeout(() => {
            if (query.trim()) {
                fetchSuggestions(query)
            } else {
                setSuggestions([])
            }
        }, 200)
        return () => clearTimeout(timer)
    }, [query, fetchSuggestions])

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                inputRef.current &&
                !inputRef.current.contains(event.target as Node)
            ) {
                setShowDropdown(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Handle keyboard navigation for autocomplete
    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        // Handle Tab or Right Arrow to accept typeahead completion
        if ((e.key === 'Tab' || e.key === 'ArrowRight') && completion && !e.shiftKey) {
            const cursorAtEnd = inputRef.current?.selectionStart === query.length
            if (cursorAtEnd) {
                e.preventDefault()
                const acceptedTerm = acceptCompletion()
                if (acceptedTerm) {
                    setQuery(acceptedTerm)
                }
                return
            }
        }

        // Handle Enter to search
        if (e.key === 'Enter') {
            if (selectedIndex >= 0 && suggestions[selectedIndex]) {
                // Navigate to selected suggestion
                e.preventDefault()
                setShowDropdown(false)
                window.location.href = suggestions[selectedIndex].url
            } else {
                // Perform search
                setShowDropdown(false)
                trackSearch(query.trim())
                handleSearch()
            }
            return
        }

        if (!showDropdown || suggestions.length === 0) return

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault()
                setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1))
                break
            case 'ArrowUp':
                e.preventDefault()
                setSelectedIndex(prev => Math.max(prev - 1, -1))
                break
            case 'Escape':
                setShowDropdown(false)
                setSelectedIndex(-1)
                break
        }
    }

    // Get icon for suggestion type
    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'post':
                return <FileText className="w-4 h-4 text-blue-500" />
            case 'user':
                return <Users className="w-4 h-4 text-purple-500" />
            case 'group':
                return <Globe className="w-4 h-4 text-green-500" />
            case 'event':
                return <Calendar className="w-4 h-4 text-orange-500" />
            default:
                return <FileText className="w-4 h-4 text-gray-400" />
        }
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header with Tabs */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('title')}</h1>

                    {/* Tab Buttons */}
                    <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-dark-border rounded-lg">
                        <button
                            onClick={() => setActiveTab('search')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'search'
                                ? 'bg-white dark:bg-dark-surface text-primary dark:text-white/80 shadow-sm'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                }`}
                        >
                            <Search className="w-4 h-4" />
                            {t('search')}
                        </button>
                        <button
                            onClick={() => {
                                setActiveTab('saved')
                                loadSavedSearches()
                            }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'saved'
                                ? 'bg-white dark:bg-dark-surface text-primary dark:text-white/80 shadow-sm'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                }`}
                        >
                            <Bookmark className="w-4 h-4" />
                            {t('saved')}
                            {savedSearches.length > 0 && (
                                <span className="px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded-full">
                                    {savedSearches.length}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Save Search Button - only visible when there are results */}
                {activeTab === 'search' && (results.length > 0 || webResults.length > 0) && (
                    <div className="flex justify-end mb-4">
                        <button
                            onClick={saveSearch}
                            disabled={savingSearch}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-primary/10 dark:bg-primary/20 text-primary dark:text-white/50 hover:bg-primary/20 dark:hover:bg-primary/30 rounded-md transition-colors disabled:opacity-50"
                        >
                            {savingSearch ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Plus className="w-4 h-4" />
                            )}
                            {savingSearch ? 'Saving...' : t('saveThisSearch')}
                        </button>
                    </div>
                )}
            </div>

            {/* Saved Searches Tab Content */}
            {activeTab === 'saved' && (
                <div className="mb-8">
                    {loadingSaved ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        </div>
                    ) : savedSearches.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 dark:bg-dark-bg rounded-xl border border-gray-200 dark:border-dark-border">
                            <Bookmark className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                            <p className="text-gray-500 dark:text-gray-400">{t('noSavedSearches')}</p>
                            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                                {t('saveSearchHint')}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {savedSearches.map((search) => (
                                <div
                                    key={search.id}
                                    className="flex items-center justify-between p-4 bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border hover:shadow-md transition-shadow"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-medium text-gray-900 dark:text-gray-100 truncate">
                                                {search.title || search.query}
                                            </span>
                                            <span className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-dark-border rounded text-gray-500">
                                                {search.source_type}
                                            </span>
                                            {search.is_pinned && (
                                                <span className="text-xs px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded">
                                                    {t('pinned')}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                            <Clock className="w-3 h-3" />
                                            {new Date(search.created_at).toLocaleDateString()}
                                            <span>•</span>
                                            <span>{search.result_count} {t('results')}</span>
                                            {search.notes && (
                                                <>
                                                    <span>•</span>
                                                    <span className="truncate max-w-[200px]">{search.notes}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 ml-4">
                                        <button
                                            onClick={() => branchSearch(search)}
                                            className="p-2 text-gray-400 hover:text-primary hover:bg-gray-100 dark:hover:bg-dark-border rounded-md transition-colors"
                                            title="Load and modify this search"
                                        >
                                            <GitBranch className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => restoreFromCache(search)}
                                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-md transition-colors"
                                            title="Restore from cache (no API call)"
                                        >
                                            <Search className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => deleteSavedSearch(search.id)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                                            title="Delete this search"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Search Tab Content */}
            {activeTab === 'search' && (
                <>
                    {/* Source Toggle */}
                    <div className="inline-flex items-center gap-1 p-1 bg-gray-100 dark:bg-dark-border rounded-lg mb-4">
                        <button
                            onClick={() => setSearchSource('all')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${searchSource === 'all'
                                ? 'bg-white dark:bg-dark-surface text-primary dark:text-white/80 shadow-sm'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                }`}
                        >
                            {t('sources.allSources')}
                        </button>
                        <button
                            onClick={() => setSearchSource('internal')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${searchSource === 'internal'
                                ? 'bg-white dark:bg-dark-surface text-primary dark:text-white/80 shadow-sm'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                }`}
                        >
                            <Database className="w-3.5 h-3.5" />
                            {t('sources.internal')}
                        </button>
                        <button
                            onClick={() => setSearchSource('web')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${searchSource === 'web'
                                ? 'bg-white dark:bg-dark-surface text-primary dark:text-white/80 shadow-sm'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                }`}
                        >
                            <Globe className="w-3.5 h-3.5" />
                            {t('sources.web')}
                        </button>
                    </div>

                    {/* Search Bar with Typeahead */}
                    <div className="relative mb-4">
                        <div className="relative bg-white dark:bg-dark-surface rounded-2xl shadow-lg dark:shadow-none border border-gray-100 dark:border-dark-border overflow-hidden">
                            <div className="flex items-center relative">
                                <Search className="absolute start-5 w-5 h-5 text-gray-400 dark:text-gray-500 z-10" />

                                {/* Typeahead overlay - shows greyed out completion */}
                                <div className="pointer-events-none absolute inset-0 flex items-center overflow-hidden rounded-2xl">
                                    <div className="ps-14 pe-48 py-4 whitespace-pre overflow-hidden text-ellipsis max-w-full text-lg">
                                        <span className="text-transparent">{query}</span>
                                        <span className="text-gray-400 dark:text-gray-500">
                                            {completion || ''}
                                        </span>
                                    </div>
                                </div>

                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={query}
                                    onChange={(e) => {
                                        setQuery(e.target.value)
                                        setShowDropdown(true)
                                        setSelectedIndex(-1)
                                    }}
                                    onFocus={() => setShowDropdown(true)}
                                    onKeyDown={handleInputKeyDown}
                                    placeholder={t('searchPlaceholder')}
                                    className="flex-1 ps-14 pe-4 py-4 bg-transparent text-gray-900 dark:text-gray-100 text-lg placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none relative z-[1]"
                                    autoComplete="off"
                                />

                                <div className="flex items-center gap-1.5 sm:gap-2 pe-2 sm:pe-3 z-10 shrink-0">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowFilters(!showFilters)}
                                        className="gap-1.5 border-gray-200 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-bg px-2 sm:px-3 h-9"
                                        title={t('filters')}
                                        aria-label={t('filters')}
                                    >
                                        <Filter className="w-4 h-4" />
                                        <span className="hidden sm:inline">{t('filters')}</span>
                                        {activeFilterCount > 0 && (
                                            <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary text-white rounded-full">
                                                {activeFilterCount}
                                            </span>
                                        )}
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            setShowDropdown(false)
                                            trackSearch(query.trim())
                                            handleSearch()
                                        }}
                                        disabled={loading || !query.trim()}
                                        className="px-3 sm:px-5 h-9"
                                        title={t('search')}
                                        aria-label={t('search')}
                                    >
                                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                                            <>
                                                <Search className="w-4 h-4 sm:hidden" />
                                                <span className="hidden sm:inline">{t('search')}</span>
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Autocomplete Dropdown */}
                        {showDropdown && query.length >= 2 && (
                            <div
                                ref={dropdownRef}
                                className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl shadow-lg overflow-hidden z-50"
                            >
                                {suggestions.length > 0 ? (
                                    <div className="max-h-80 overflow-y-auto">
                                        {suggestions.map((suggestion, index) => (
                                            <Link
                                                key={`${suggestion.type}-${suggestion.id}`}
                                                href={suggestion.url}
                                                onClick={() => setShowDropdown(false)}
                                                className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-dark-border transition-colors ${index === selectedIndex ? 'bg-gray-50 dark:bg-dark-border' : ''
                                                    }`}
                                            >
                                                <div className="mt-0.5">
                                                    {getTypeIcon(suggestion.type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                                            {suggestion.type}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                                        {suggestion.title}
                                                    </p>
                                                    {suggestion.description && (
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                            {suggestion.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </Link>
                                        ))}

                                        {/* Full search link */}
                                        <div className="border-t border-gray-100 dark:border-dark-border">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowDropdown(false)
                                                    trackSearch(query.trim())
                                                    handleSearch()
                                                }}
                                                className="w-full px-4 py-3 text-sm text-primary dark:text-accent-light font-medium hover:bg-gray-50 dark:hover:bg-dark-border transition-colors text-center"
                                            >
                                                {t('searchFor', { query })}
                                            </button>
                                        </div>
                                    </div>
                                ) : loadingSuggestions ? (
                                    <div className="px-4 py-6 text-center">
                                        <Loader2 className="w-5 h-5 animate-spin mx-auto text-gray-400" />
                                    </div>
                                ) : (
                                    <div className="px-4 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                        {t('noSuggestions') || 'No suggestions found'}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>


                    {/* Filters Panel */}
                    {showFilters && (
                        <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-5 mb-6 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100">{t('searchFilters')}</h3>
                                {activeFilterCount > 0 && (
                                    <button onClick={clearFilters} className="text-sm text-primary hover:text-primary/80 transition-colors font-medium">
                                        {t('clearAll')}
                                    </button>
                                )}
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                {/* Disciplines */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{t('disciplines')}</label>
                                    <div className="space-y-4 max-h-56 overflow-y-auto pr-2 scrollbar-thin">
                                        {DISCIPLINE_CATEGORIES.map(cat => (
                                            <div key={cat.id} className="space-y-2">
                                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                                    {cat.name}
                                                </p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {cat.disciplines.map(d => (
                                                        <button
                                                            key={d}
                                                            onClick={() => {
                                                                const current = filters.disciplines || []
                                                                const updated = current.includes(d)
                                                                    ? current.filter(x => x !== d)
                                                                    : [...current, d]
                                                                updateFilter('disciplines', updated)
                                                            }}
                                                            className={`px-2.5 py-1 text-xs rounded-md border transition-all ${(filters.disciplines || []).includes(d)
                                                                ? 'bg-primary text-white border-primary shadow-sm'
                                                                : 'bg-gray-50 dark:bg-dark-bg border-gray-200 dark:border-dark-border text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary dark:hover:text-primary'
                                                                }`}
                                                        >
                                                            {d.replace(/_/g, ' ')}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Evidence Tiers & Phase */}
                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{t('evidenceType')}</label>
                                        <div className="flex flex-wrap gap-2">
                                            {EVIDENCE_TIERS.map(tier => (
                                                <button
                                                    key={tier.value}
                                                    onClick={() => {
                                                        const current = filters.evidence_tiers || []
                                                        const updated = current.includes(tier.value)
                                                            ? current.filter(x => x !== tier.value)
                                                            : [...current, tier.value]
                                                        updateFilter('evidence_tiers', updated)
                                                    }}
                                                    className={`px-3 py-1.5 text-sm rounded-md border transition-all ${(filters.evidence_tiers || []).includes(tier.value)
                                                        ? 'bg-primary text-white border-primary shadow-sm'
                                                        : 'bg-gray-50 dark:bg-dark-bg border-gray-200 dark:border-dark-border text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary dark:hover:text-primary'
                                                        }`}
                                                    title={tier.description}
                                                >
                                                    {tier.label}
                                                </button>
                                            ))}
                                        </div>
                                        <label className="flex items-center gap-2 mt-3 text-sm text-gray-600 dark:text-gray-400 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={filters.primary_evidence_only || false}
                                                onChange={(e) => updateFilter('primary_evidence_only', e.target.checked)}
                                                className="rounded border-gray-300 dark:border-dark-border text-primary focus:ring-primary"
                                            />
                                            <span className="group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors">
                                                {t('primaryEvidenceOnly')}
                                            </span>
                                        </label>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('temporalPhase')}</label>
                                        <select
                                            value={filters.conflict_phase || ''}
                                            onChange={(e) => updateFilter('conflict_phase', e.target.value as ConflictPhase || undefined)}
                                            className="select-input"
                                        >
                                            <option value="">{t('allPhases')}</option>
                                            {CONFLICT_PHASES.map(p => (
                                                <option key={p.value} value={p.value}>{p.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{t('minTrustScore')}</label>
                                        <div className="space-y-2">
                                            <div className="relative">
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="100"
                                                    step="10"
                                                    value={filters.min_trust_score || 0}
                                                    onChange={(e) => updateFilter('min_trust_score', parseInt(e.target.value))}
                                                    className="w-full h-2 bg-gray-200 dark:bg-dark-border rounded-full appearance-none cursor-pointer accent-primary"
                                                />
                                            </div>
                                            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                                                <span>{t('any')}</span>
                                                <span className="font-medium text-primary">{filters.min_trust_score || 0}+</span>
                                                <span>100</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Internal Results - Evidence Space */}
                    {(searchSource === 'internal' || searchSource === 'all') && results.length > 0 && (
                        <div className="mb-8">
                            {/* Mode Banner - Internal Evidence Space */}
                            <div className="mb-4 p-3 bg-gradient-to-r from-primary/5 to-teal-50 dark:from-primary/10 dark:to-teal-900/10 border border-primary/20 dark:border-primary/30 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-primary/10 rounded-md">
                                            <Database className="w-4 h-4 text-primary" />
                                        </div>
                                        <div>
                                            <span className="font-semibold text-primary dark:text-primary">{t('internalEvidenceSpace')}</span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">{t('internalDesc')}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {isFromCache && (
                                            <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full font-medium flex items-center gap-1">
                                                <Database className="w-3 h-3" />
                                                {t('cached')}
                                            </span>
                                        )}
                                        <span className="text-sm text-gray-600 dark:text-gray-400">{results.length} {t('results')}</span>
                                        {searchDuration && <span className="text-xs text-gray-400">{searchDuration}ms</span>}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {results.map((result) => (
                                    <SearchResultCard
                                        key={result.id}
                                        result={result}
                                        expanded={expandedResult === result.id}
                                        onToggleExpand={() => setExpandedResult(
                                            expandedResult === result.id ? null : result.id
                                        )}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Web Results - Open Web */}
                    {(searchSource === 'web' || searchSource === 'all') && webResults.length > 0 && (
                        <div className="mb-8">
                            {/* Mode Banner - Open Web */}
                            <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-sky-50 dark:from-blue-900/10 dark:to-sky-900/10 border border-blue-200 dark:border-blue-800/40 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-md">
                                            <Globe className="w-4 h-4 text-blue-500" />
                                        </div>
                                        <div>
                                            <span className="font-semibold text-blue-600 dark:text-blue-400">{t('openWeb')}</span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">{t('webDesc')}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {isFromCache && (
                                            <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full font-medium flex items-center gap-1">
                                                <Globe className="w-3 h-3" />
                                                {t('cached')}
                                            </span>
                                        )}
                                        <span className="text-sm text-gray-600 dark:text-gray-400">{webResults.length} {t('results')}</span>
                                    </div>
                                </div>
                                <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" />
                                    {t('webWarning')}
                                </p>
                            </div>

                            <div className="space-y-4">
                                {webResults.map((result) => (
                                    <WebResultCard
                                        key={result.id}
                                        result={result}
                                        onCopyLink={copyToClipboard}
                                        copiedId={copiedId}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Empty state */}
                    {!loading && query && results.length === 0 && webResults.length === 0 && (
                        <div className="text-center py-12">
                            <Search className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                            <p className="text-gray-500 dark:text-gray-400">{t('noResults')}</p>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

interface SearchResultCardProps {
    result: SearchResult
    expanded: boolean
    onToggleExpand: () => void
}

function SearchResultCard({ result, expanded, onToggleExpand }: SearchResultCardProps) {
    const avgTrustScore = result.trust_profile
        ? Math.round((
            result.trust_profile.t1_source_score +
            result.trust_profile.t2_method_score +
            result.trust_profile.t3_proximity_score +
            result.trust_profile.t4_temporal_score +
            result.trust_profile.t5_validation_score
        ) / 5)
        : null

    return (
        <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-3">
                    <Link href={`/post/${result.id}`} className="flex-1 min-w-0 group">
                        <h3 className="font-medium text-lg text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors line-clamp-1">
                            {result.title}
                        </h3>
                    </Link>
                    <div className="flex items-center gap-2 shrink-0">
                        {avgTrustScore !== null && <TrustBadge score={avgTrustScore} size="sm" />}
                        <span className="text-xs px-2.5 py-1 rounded-md bg-gray-100 dark:bg-dark-border text-gray-600 dark:text-gray-300 font-medium capitalize">
                            {result.evidence_tier}
                        </span>
                    </div>
                </div>

                {/* Snippet */}
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">{stripMarkdown(result.snippet)}</p>

                {/* Meta row */}
                <div className="flex items-center gap-4 text-sm">
                    {result.similarity_score !== null && (
                        <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-gray-200 dark:bg-dark-border rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary rounded-full transition-all"
                                    style={{ width: `${result.similarity_score * 100}%` }}
                                />
                            </div>
                            <span className="text-gray-500 dark:text-gray-400 font-medium">
                                {(result.similarity_score * 100).toFixed(0)}%
                            </span>
                        </div>
                    )}
                    {result.linked_resources.length > 0 && (
                        <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                            <Link2 className="w-4 h-4" />
                            {result.linked_resources.length} linked
                        </span>
                    )}
                    {result.contradictions.length > 0 && (
                        <InlineConflictBadge count={result.contradictions.length} />
                    )}
                    <button
                        onClick={onToggleExpand}
                        className="ml-auto flex items-center gap-1.5 text-primary hover:text-primary/80 transition-colors text-sm font-medium"
                    >
                        <Info className="w-4 h-4" />
                        {expanded ? 'Hide' : 'Show'} explanation
                        <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                {/* Action buttons row */}
                <div className="flex items-center gap-1 pt-3 mt-3 border-t border-gray-100 dark:border-dark-border">
                    <button
                        onClick={() => {
                            // Copy citation to clipboard
                            const citation = `${result.title}. Retrieved from SyriaHub Research Archive.`
                            navigator.clipboard.writeText(citation)
                        }}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-border transition-colors"
                        title="Copy citation"
                    >
                        <Quote className="w-3.5 h-3.5" />
                        Cite
                    </button>
                    <button
                        onClick={() => {
                            // Navigate to extract data view
                            window.open(`/post/${result.id}?action=extract`, '_blank')
                        }}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-border transition-colors"
                        title="Extract data"
                    >
                        <FileDown className="w-3.5 h-3.5" />
                        Extract
                    </button>
                    <button
                        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-border transition-colors"
                        title="Save to collection"
                    >
                        <Bookmark className="w-3.5 h-3.5" />
                        Save
                    </button>
                    <Link
                        href={`/post/${result.id}`}
                        target="_blank"
                        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-border transition-colors ml-auto"
                    >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Open
                    </Link>
                </div>
            </div>

            {/* Expanded explanation */}
            {expanded && result.explanation && (
                <div className="border-t border-gray-200 dark:border-dark-border p-5 bg-gray-50 dark:bg-dark-bg">
                    <ExplanationPanel explanation={result.explanation} />
                </div>
            )}
        </div>
    )
}

interface ExplanationPanelProps {
    explanation: SearchResult['explanation']
}

function ExplanationPanel({ explanation }: ExplanationPanelProps) {
    return (
        <div className="space-y-4 text-sm">
            {/* Why it matched */}
            <div>
                <h4 className="font-medium mb-2 flex items-center gap-1">
                    <Info className="w-4 h-4 text-blue-500" />
                    Why this result appeared
                </h4>
                <ul className="space-y-1">
                    {explanation.match_reasons.map((reason, i) => (
                        <li key={i} className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            {reason.reason}
                            <span className="text-text-light">({(reason.weight * 100).toFixed(0)}% weight)</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Supporting evidence */}
            {explanation.supporting_evidence.length > 0 && (
                <div>
                    <h4 className="font-medium mb-2 flex items-center gap-1">
                        <Link2 className="w-4 h-4 text-green-500" />
                        Supporting data
                    </h4>
                    <ul className="space-y-1">
                        {explanation.supporting_evidence.map((ev, i) => (
                            <li key={i} className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                {ev.detail || `${ev.count} ${ev.type.replace(/_/g, ' ')}(s)`}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Data gaps */}
            {explanation.data_gaps.length > 0 && (
                <div>
                    <h4 className="font-medium mb-2 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        Data gaps & limitations
                    </h4>
                    <ul className="space-y-1">
                        {explanation.data_gaps.map((gap, i) => (
                            <li key={i} className="flex items-center gap-2">
                                <span className={`w-1.5 h-1.5 rounded-full ${gap.severity === 'high' ? 'bg-red-500' :
                                    gap.severity === 'medium' ? 'bg-amber-500' : 'bg-gray-400'
                                    }`} />
                                {gap.gap}
                                <span className="text-xs text-text-light capitalize">({gap.severity})</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Credibility score */}
            <div className="pt-2 border-t border-gray-200 dark:border-dark-border">
                <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Credibility Score</span>
                    <span className={`font-medium ${explanation.credibility_score >= 70 ? 'text-green-600' :
                        explanation.credibility_score >= 50 ? 'text-blue-600' :
                            explanation.credibility_score >= 30 ? 'text-amber-600' : 'text-red-600'
                        }`}>
                        {explanation.credibility_score}/100
                    </span>
                </div>
            </div>
        </div>
    )
}

// Web Result Card Component
interface WebResultCardProps {
    result: {
        id: string
        title: string
        snippet: string
        url: string
        source: string
        date?: string
    }
    onCopyLink?: (url: string, id: string) => void
    copiedId?: string | null
}

function WebResultCard({ result, onCopyLink, copiedId }: WebResultCardProps) {
    const [saved, setSaved] = useState(false)
    const [saving, setSaving] = useState(false)
    const [cited, setCited] = useState(false)

    // Handle save to database
    const handleSave = async () => {
        if (saved) {
            // Unsave
            try {
                await fetch(`/api/saved-references?url=${encodeURIComponent(result.url)}`, { method: 'DELETE' })
                setSaved(false)
            } catch (error) {
                console.error('Error unsaving reference:', error)
            }
        } else {
            // Save
            setSaving(true)
            try {
                const citation = `${result.title}. (${result.source}). Retrieved from ${result.url}`
                const response = await fetch('/api/saved-references', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: result.title,
                        url: result.url,
                        snippet: result.snippet,
                        source: result.source,
                        citation
                    })
                })

                if (response.ok) {
                    setSaved(true)
                }
            } catch (error) {
                console.error('Error saving reference:', error)
            } finally {
                setSaving(false)
            }
        }
    }

    // Handle cite with feedback
    const handleCite = () => {
        const citation = `${result.title}. (${result.source}). Retrieved from ${result.url}`
        navigator.clipboard.writeText(citation)
        setCited(true)
        setTimeout(() => setCited(false), 2000)
    }

    return (
        <div className="bg-white dark:bg-dark-surface rounded-xl border border-blue-100 dark:border-blue-900/30 p-5 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800/40 transition-all">
            <div className="flex items-start gap-3">
                <div className="shrink-0 w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                    <Globe className="w-4 h-4 text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <a
                            href={result.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 transition-colors line-clamp-1"
                        >
                            {result.title}
                        </a>
                        <span className="text-xs px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded font-medium">
                            Web
                        </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                        {stripMarkdown(result.snippet)}
                    </p>

                    {/* Meta info */}
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                            <Globe className="w-3 h-3 text-blue-500" />
                            {result.source}
                        </span>
                        {result.date && (
                            <span>{result.date}</span>
                        )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-100 dark:border-dark-border">
                        <button
                            onClick={() => onCopyLink?.(result.url, result.id)}
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-md transition-colors ${copiedId === result.id
                                ? 'bg-green-50 dark:bg-green-900/20 text-green-600'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-border'
                                }`}
                            title="Copy link"
                        >
                            {copiedId === result.id ? (
                                <>
                                    <Check className="w-3.5 h-3.5" />
                                    Copied!
                                </>
                            ) : (
                                <>
                                    <Copy className="w-3.5 h-3.5" />
                                    Copy Link
                                </>
                            )}
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-md transition-colors ${saved
                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-border'
                                } disabled:opacity-50`}
                            title="Save as reference"
                        >
                            {saving ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-current' : ''}`} />
                            )}
                            {saved ? 'Saved' : 'Save'}
                        </button>
                        <button
                            onClick={handleCite}
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-md transition-colors ${cited
                                ? 'bg-green-50 dark:bg-green-900/20 text-green-600'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-border'
                                }`}
                            title="Copy citation"
                        >
                            {cited ? (
                                <>
                                    <Check className="w-3.5 h-3.5" />
                                    Cited!
                                </>
                            ) : (
                                <>
                                    <Quote className="w-3.5 h-3.5" />
                                    Cite
                                </>
                            )}
                        </button>
                        <a
                            href={result.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-border transition-colors ml-auto"
                        >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Open
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}
