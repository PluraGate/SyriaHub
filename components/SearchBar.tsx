'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X, Filter } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface SearchFilters {
  query: string
  type: 'all' | 'title' | 'tag' | 'author'
}

interface SearchResult {
  id: string
  title: string
  content: string
  tags?: string[]
  author?: {
    id?: string
    name?: string | null
    email?: string | null
  } | null
}

export function SearchBar() {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({ query: '', type: 'all' })
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setShowFilters(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const searchPosts = async () => {
      if (filters.query.length < 2) {
        setResults([])
        return
      }

      setLoading(true)
      try {
        const queryText = filters.query.trim()
        if (!queryText) {
          setResults([])
          return
        }

        const baseQuery = supabase
          .from('posts')
          .select(
            `
            *,
            author:users!posts_author_id_fkey(id, name, email)
          `
          )
          .eq('status', 'published')
          .order('created_at', { ascending: false })
          .limit(10)

        let finalQuery = baseQuery

        if (filters.type === 'tag') {
          finalQuery = finalQuery.contains('tags', [queryText])
        } else if (filters.type === 'author') {
          const { data: authors, error: authorError } = await supabase
            .from('users')
            .select('id')
            .or(`name.ilike.%${queryText}%,email.ilike.%${queryText}%`)
            .limit(10)

          if (authorError) {
            console.error('Author search error:', authorError)
            setResults([])
            return
          }

          const authorIds = authors?.map((author) => author.id).filter(Boolean) || []

          if (authorIds.length === 0) {
            setResults([])
            return
          }

          finalQuery = finalQuery.in('author_id', authorIds)
        } else if (filters.type === 'title') {
          finalQuery = finalQuery.ilike('title', `%${queryText}%`)
        } else {
          finalQuery = finalQuery.or(
            `title.ilike.%${queryText}%,content.ilike.%${queryText}%`
          )
        }

        const { data, error } = await finalQuery

        if (!error && data) {
          setResults(data)
        }
      } catch (error) {
        console.error('Search error:', error)
      } finally {
        setLoading(false)
      }
    }

    const debounce = setTimeout(searchPosts, 300)
    return () => clearTimeout(debounce)
  }, [filters, supabase])

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search posts, tags, or authors..."
          value={filters.query}
          onChange={(e) => setFilters({ ...filters, query: e.target.value })}
          onFocus={() => setIsOpen(true)}
          className="w-full pl-12 pr-20 py-3 rounded-full border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-accent-light focus:border-transparent transition-all"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-border transition-colors ${
              showFilters ? 'bg-gray-100 dark:bg-dark-border' : ''
            }`}
            aria-label="Toggle filters"
          >
            <Filter className="w-4 h-4" />
          </button>
          {filters.query && (
            <button
              onClick={() => setFilters({ ...filters, query: '' })}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-border transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {showFilters && (
        <div className="absolute top-full mt-2 w-full bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg shadow-lg p-4 z-50">
          <p className="text-sm font-medium mb-2 text-text dark:text-dark-text">Search in:</p>
          <div className="flex flex-wrap gap-2">
            {(['all', 'title', 'tag', 'author'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilters({ ...filters, type })}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  filters.type === type
                    ? 'bg-primary dark:bg-accent-light text-white'
                    : 'bg-gray-100 dark:bg-dark-border text-text dark:text-dark-text hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      {isOpen && filters.query.length >= 2 && (
        <div className="absolute top-full mt-2 w-full bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary dark:border-accent-light"></div>
            </div>
          ) : results.length > 0 ? (
            <div className="py-2">
              {results.map((result) => (
                <Link
                  key={result.id}
                  href={`/post/${result.id}`}
                  className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-dark-border transition-colors"
                  onClick={() => {
                    setIsOpen(false)
                    setFilters({ ...filters, query: '' })
                  }}
                >
                  <h4 className="font-medium text-text dark:text-dark-text mb-1">{result.title}</h4>
                  {result.author && (
                    <p className="text-xs text-gray-500 dark:text-dark-text-muted mb-1">
                      {result.author.name || result.author.email?.split('@')[0] || 'Anonymous'}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 dark:text-dark-text-muted line-clamp-1">
                    {result.content}
                  </p>
                  {result.tags && result.tags.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {result.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-1 bg-gray-100 dark:bg-dark-border text-gray-600 dark:text-dark-text-muted rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500 dark:text-dark-text-muted">
              No results found for &quot;{filters.query}&quot;
            </div>
          )}
        </div>
      )}
    </div>
  )
}
