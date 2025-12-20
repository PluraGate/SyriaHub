'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Search, Filter, X, ChevronDown, Database, FileText, Wrench, Film, FileSpreadsheet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useTranslations } from 'next-intl'

interface ResourceFiltersProps {
    onFiltersChange?: (filters: FilterState) => void
    className?: string
}

export interface FilterState {
    type: string | null
    discipline: string | null
    license: string | null
    search: string
    sort: string
}

const RESOURCE_TYPES = [
    { value: 'dataset', Icon: Database },
    { value: 'paper', Icon: FileText },
    { value: 'tool', Icon: Wrench },
    { value: 'media', Icon: Film },
    { value: 'template', Icon: FileSpreadsheet },
]

const LICENSES = [
    { value: 'CC-BY-4.0', label: 'CC BY 4.0' },
    { value: 'CC-BY-SA-4.0', label: 'CC BY-SA 4.0' },
    { value: 'CC-BY-NC-4.0', label: 'CC BY-NC 4.0' },
    { value: 'CC0-1.0', label: 'CC0 (Public Domain)' },
    { value: 'MIT', label: 'MIT License' },
    { value: 'Apache-2.0', label: 'Apache 2.0' },
    { value: 'Copyright', label: 'All Rights Reserved' },
]

const SORT_OPTIONS = [
    { value: 'date', key: 'sortNewest' },
    { value: 'downloads', key: 'sortDownloads' },
    { value: 'title', key: 'sortTitle' },
]

export function ResourceFilters({ onFiltersChange, className = '' }: ResourceFiltersProps) {
    const t = useTranslations('Resources')
    const router = useRouter()
    const searchParams = useSearchParams()
    const supabase = createClient()

    const [disciplines, setDisciplines] = useState<{ discipline: string; resource_count: number }[]>([])
    const [isExpanded, setIsExpanded] = useState(false)
    const [searchInput, setSearchInput] = useState(searchParams.get('q') || '')

    // Initialize filters from URL
    const [filters, setFilters] = useState<FilterState>({
        type: searchParams.get('type'),
        discipline: searchParams.get('discipline'),
        license: searchParams.get('license'),
        search: searchParams.get('q') || '',
        sort: searchParams.get('sort') || 'date',
    })

    // Fetch available disciplines
    useEffect(() => {
        async function fetchDisciplines() {
            const { data } = await supabase.rpc('get_resource_disciplines')
            if (data) {
                setDisciplines(data)
            }
        }
        fetchDisciplines()
    }, [supabase])

    // Update URL when filters change
    const updateFilters = (newFilters: Partial<FilterState>) => {
        const updated = { ...filters, ...newFilters }
        setFilters(updated)

        // Build URL params
        const params = new URLSearchParams()
        if (updated.type) params.set('type', updated.type)
        if (updated.discipline) params.set('discipline', updated.discipline)
        if (updated.license) params.set('license', updated.license)
        if (updated.search) params.set('q', updated.search)
        if (updated.sort && updated.sort !== 'date') params.set('sort', updated.sort)

        const queryString = params.toString()
        router.push(queryString ? `?${queryString}` : '?', { scroll: false })

        onFiltersChange?.(updated)
    }

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchInput !== filters.search) {
                updateFilters({ search: searchInput })
            }
        }, 300)
        return () => clearTimeout(timer)
    }, [searchInput])

    const clearFilters = () => {
        setSearchInput('')
        setFilters({
            type: null,
            discipline: null,
            license: null,
            search: '',
            sort: 'date',
        })
        router.push('?', { scroll: false })
        onFiltersChange?.({
            type: null,
            discipline: null,
            license: null,
            search: '',
            sort: 'date',
        })
    }

    const activeFilterCount = [
        filters.type,
        filters.discipline,
        filters.license,
        filters.search,
    ].filter(Boolean).length

    return (
        <div className={`bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-4 ${className}`}>
            {/* Search Bar */}
            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light dark:text-dark-text-muted" />
                <Input
                    type="text"
                    placeholder={t('searchPlaceholder')}
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Quick Filter Toggle */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center justify-between w-full text-sm font-medium text-text dark:text-dark-text mb-2"
            >
                <span className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    {t('filters')}
                    {activeFilterCount > 0 && (
                        <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                            {activeFilterCount}
                        </span>
                    )}
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </button>

            {/* Expanded Filters */}
            {isExpanded && (
                <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-dark-border">
                    {/* Resource Type */}
                    <div>
                        <Label className="text-xs text-text-light dark:text-dark-text-muted mb-2 block">
                            {t('resourceType')}
                        </Label>
                        <div className="flex flex-wrap gap-2">
                            {RESOURCE_TYPES.map((type) => {
                                const Icon = type.Icon
                                return (
                                    <button
                                        key={type.value}
                                        onClick={() => updateFilters({
                                            type: filters.type === type.value ? null : type.value
                                        })}
                                        className={`px-3 py-1.5 text-sm rounded-lg border transition-colors flex items-center gap-1.5 ${filters.type === type.value
                                            ? 'bg-primary text-white border-primary'
                                            : 'bg-white dark:bg-dark-bg border-gray-300 dark:border-dark-border text-gray-700 dark:text-gray-200 hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-dark-surface'
                                            }`}
                                    >
                                        <Icon className="w-3.5 h-3.5" />
                                        {t(`types.${type.value}`)}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Discipline */}
                    {disciplines.length > 0 && (
                        <div>
                            <Label className="text-xs text-text-light dark:text-dark-text-muted mb-2 block">
                                {t('discipline')}
                            </Label>
                            <div className="flex flex-wrap gap-2">
                                {disciplines.map((d) => (
                                    <button
                                        key={d.discipline}
                                        onClick={() => updateFilters({
                                            discipline: filters.discipline === d.discipline ? null : d.discipline
                                        })}
                                        className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${filters.discipline === d.discipline
                                            ? 'bg-primary text-white border-primary'
                                            : 'bg-white dark:bg-dark-bg border-gray-300 dark:border-dark-border text-gray-700 dark:text-gray-200 hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-dark-surface'
                                            }`}
                                    >
                                        {d.discipline}
                                        <span className="ml-1.5 text-xs opacity-70">({d.resource_count})</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* License */}
                    <div>
                        <Label className="text-xs text-text-light dark:text-dark-text-muted mb-2 block">
                            {t('license')}
                        </Label>
                        <select
                            value={filters.license || ''}
                            onChange={(e) => updateFilters({ license: e.target.value || null })}
                            className="w-full h-10 rounded-md border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface px-3 text-sm text-text dark:text-dark-text"
                        >
                            <option value="">{t('allLicenses')}</option>
                            {LICENSES.map((license) => (
                                <option key={license.value} value={license.value}>
                                    {license.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Sort */}
                    <div>
                        <Label className="text-xs text-text-light dark:text-dark-text-muted mb-2 block">
                            {t('sortBy')}
                        </Label>
                        <select
                            value={filters.sort}
                            onChange={(e) => updateFilters({ sort: e.target.value })}
                            className="w-full h-10 rounded-md border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface px-3 text-sm text-text dark:text-dark-text"
                        >
                            {SORT_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {t(option.key)}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Clear Filters */}
                    {activeFilterCount > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={clearFilters}
                            className="w-full"
                        >
                            <X className="w-4 h-4 mr-2" />
                            {t('clearFilters')}
                        </Button>
                    )}
                </div>
            )}
        </div>
    )
}
