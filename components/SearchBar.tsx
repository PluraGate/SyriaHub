'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, FileText, Users, Globe, Calendar, Loader2, X } from 'lucide-react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useTypeahead } from '@/hooks/useTypeahead'

interface Suggestion {
  id: string
  type: 'post' | 'user' | 'group' | 'event'
  title: string
  description: string
  url: string
}

function debounce<T extends (...args: Parameters<T>) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function SearchBar() {
  const t = useTranslations('Forms')
  const tSearch = useTranslations('Search')
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [isExpanded, setIsExpanded] = useState(false)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const expandedInputRef = useRef<HTMLInputElement>(null)

  // Typeahead hook for inline completion
  const { completion, acceptCompletion, trackSearch } = useTypeahead(query, {
    debounceMs: 100,
    minChars: 2
  })

  // Fetch suggestions
  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSuggestions([])
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(searchQuery)}`)
      if (response.ok) {
        const data = await response.json()
        setSuggestions(data.suggestions || [])
      }
    } catch (error) {
      console.error('Failed to fetch suggestions:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Debounced fetch
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedFetch = useCallback(debounce(fetchSuggestions, 300), [fetchSuggestions])

  useEffect(() => {
    debouncedFetch(query)
  }, [query, debouncedFetch])

  // Focus input when expanded
  useEffect(() => {
    if (isExpanded && expandedInputRef.current) {
      expandedInputRef.current.focus()
    }
  }, [isExpanded])

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

  // Close expanded search on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isExpanded) {
        setIsExpanded(false)
        setShowDropdown(false)
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isExpanded])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setShowDropdown(false)
    setIsExpanded(false)
    trackSearch(query.trim()) // Track the search term
    router.push(`/search?q=${encodeURIComponent(query)}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle Tab or Right Arrow to accept typeahead completion
    if ((e.key === 'Tab' || e.key === 'ArrowRight') && completion && !e.shiftKey) {
      const activeInput = isExpanded ? expandedInputRef.current : inputRef.current
      const cursorAtEnd = activeInput?.selectionStart === query.length
      if (cursorAtEnd) {
        e.preventDefault()
        const acceptedTerm = acceptCompletion()
        if (acceptedTerm) {
          setQuery(acceptedTerm)
        }
        return
      }
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
      case 'Enter':
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          e.preventDefault()
          setShowDropdown(false)
          setIsExpanded(false)
          router.push(suggestions[selectedIndex].url)
        }
        break
      case 'Escape':
        setShowDropdown(false)
        setSelectedIndex(-1)
        break
    }
  }

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

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'post':
        return 'Post'
      case 'user':
        return 'User'
      case 'group':
        return 'Group'
      case 'event':
        return 'Event'
      default:
        return type
    }
  }

  // Render suggestions dropdown
  const renderSuggestions = () => {
    if (!showDropdown || query.length < 2) return null

    return (
      <div
        ref={dropdownRef}
        className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg shadow-lg overflow-hidden z-50"
      >
        {suggestions.length > 0 ? (
          <div className="max-h-80 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <Link
                key={`${suggestion.type}-${suggestion.id}`}
                href={suggestion.url}
                onClick={() => {
                  setShowDropdown(false)
                  setIsExpanded(false)
                }}
                className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-dark-border transition-colors ${index === selectedIndex ? 'bg-gray-50 dark:bg-dark-border' : ''
                  }`}
              >
                <div className="mt-0.5">
                  {getTypeIcon(suggestion.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      {getTypeLabel(suggestion.type)}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-text dark:text-dark-text truncate">
                    {suggestion.title}
                  </p>
                  {suggestion.description && (
                    <p className="text-xs text-muted-foreground truncate">
                      {suggestion.description}
                    </p>
                  )}
                </div>
              </Link>
            ))}

            {/* View all results link */}
            <div className="border-t border-gray-100 dark:border-dark-border">
              <button
                type="button"
                onClick={() => {
                  setShowDropdown(false)
                  setIsExpanded(false)
                  trackSearch(query.trim())
                  router.push(`/search?q=${encodeURIComponent(query)}`)
                }}
                className="w-full px-4 py-3 text-sm text-primary dark:text-accent-light font-medium hover:bg-gray-50 dark:hover:bg-dark-border transition-colors text-center"
              >
                {tSearch('viewAllResults', { query })}
              </button>
            </div>
          </div>
        ) : !isLoading ? (
          <div className="px-4 py-6 text-center">
            <p className="text-sm text-muted-foreground">
              {tSearch('noResults')}
            </p>
            <button
              type="button"
              onClick={() => {
                setShowDropdown(false)
                setIsExpanded(false)
                trackSearch(query.trim())
                router.push(`/search?q=${encodeURIComponent(query)}`)
              }}
              className="mt-2 text-sm text-primary dark:text-accent-light font-medium hover:underline"
            >
              {tSearch('searchFor', { query })}
            </button>
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <>
      {/* Compact search button - visible at md to xl, hidden at xl+ */}
      <button
        onClick={() => setIsExpanded(true)}
        className="hidden md:flex lg:hidden p-2 text-text-light dark:text-dark-text-muted hover:text-primary dark:hover:text-accent-light hover:bg-gray-100 dark:hover:bg-dark-border rounded-full transition-all focus-ring"
        aria-label="Search"
      >
        <Search className="w-4 h-4" />
      </button>

      {/* Full search bar - only visible at xl+ */}
      <div className="relative hidden lg:block w-48 lg:w-64 xl:w-80 transition-all duration-300" suppressHydrationWarning>
        <form onSubmit={handleSearch}>
          <div className="relative">
            {/* Typeahead overlay - shows greyed out completion */}
            <div className="pointer-events-none absolute inset-0 flex items-center overflow-hidden rounded-lg">
              <div className="pl-10 pr-12 py-2 whitespace-pre overflow-hidden text-ellipsis max-w-full">
                <span className="text-transparent">{query}</span>
                <span className="text-gray-400 dark:text-gray-500">
                  {completion || ''}
                </span>
              </div>
            </div>

            {/* Actual input */}
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
              onKeyDown={handleKeyDown}
              placeholder={t('searchPlaceholder')}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-text dark:text-dark-text placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              style={{ background: 'transparent', position: 'relative', zIndex: 1 }}
              autoComplete="off"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
            {isLoading && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin z-10" />
            )}
          </div>
        </form>

        {/* Suggestions Dropdown */}
        {renderSuggestions()}
      </div>

      {/* Expanded search overlay - appears when compact button is clicked */}
      {isExpanded && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setIsExpanded(false)
              setShowDropdown(false)
            }}
          />

          {/* Search container */}
          <div className="absolute top-0 left-0 right-0 bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border p-4 shadow-lg">
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                {/* Typeahead overlay */}
                <div className="pointer-events-none absolute inset-0 flex items-center overflow-hidden rounded-lg">
                  <div className="pl-10 pr-12 py-2 whitespace-pre overflow-hidden text-ellipsis max-w-full">
                    <span className="text-transparent">{query}</span>
                    <span className="text-gray-400 dark:text-gray-500">
                      {completion || ''}
                    </span>
                  </div>
                </div>

                <input
                  ref={expandedInputRef}
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value)
                    setShowDropdown(true)
                    setSelectedIndex(-1)
                  }}
                  onFocus={() => setShowDropdown(true)}
                  onKeyDown={handleKeyDown}
                  placeholder={t('searchPlaceholder')}
                  className="w-full pl-10 pr-12 py-3 rounded-lg border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-text dark:text-dark-text placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  style={{ background: 'transparent', position: 'relative', zIndex: 1 }}
                  autoComplete="off"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />

                {/* Close button */}
                <button
                  type="button"
                  onClick={() => {
                    setIsExpanded(false)
                    setShowDropdown(false)
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-text dark:hover:text-dark-text z-10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Suggestions in expanded view */}
            {renderSuggestions()}
          </div>
        </div>
      )}
    </>
  )
}

