'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface TypeaheadResult {
    completion: string | null
    fullTerm: string | null
    source: string | null
}

interface UseTypeaheadOptions {
    debounceMs?: number
    minChars?: number
    enabled?: boolean
}

export function useTypeahead(
    query: string,
    options: UseTypeaheadOptions = {}
) {
    const { debounceMs = 150, minChars = 2, enabled = true } = options

    const [completion, setCompletion] = useState<string | null>(null)
    const [fullTerm, setFullTerm] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const abortControllerRef = useRef<AbortController | null>(null)

    const fetchCompletion = useCallback(async (searchQuery: string) => {
        if (!enabled || searchQuery.length < minChars) {
            setCompletion(null)
            setFullTerm(null)
            return
        }

        // Cancel previous request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
        }

        abortControllerRef.current = new AbortController()
        setIsLoading(true)

        try {
            const response = await fetch(
                `/api/search/typeahead?q=${encodeURIComponent(searchQuery)}`,
                { signal: abortControllerRef.current.signal }
            )

            if (response.ok) {
                const data: TypeaheadResult = await response.json()
                setCompletion(data.completion)
                setFullTerm(data.fullTerm)
            }
        } catch (error) {
            if (error instanceof Error && error.name !== 'AbortError') {
                console.error('Typeahead fetch error:', error)
            }
        } finally {
            setIsLoading(false)
        }
    }, [enabled, minChars])

    // Debounced fetch
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchCompletion(query)
        }, debounceMs)

        return () => {
            clearTimeout(timer)
            if (abortControllerRef.current) {
                abortControllerRef.current.abort()
            }
        }
    }, [query, debounceMs, fetchCompletion])

    // Accept the current completion
    const acceptCompletion = useCallback((): string | null => {
        if (fullTerm) {
            const accepted = fullTerm
            setCompletion(null)
            setFullTerm(null)
            return accepted
        }
        return null
    }, [fullTerm])

    // Clear completion
    const clearCompletion = useCallback(() => {
        setCompletion(null)
        setFullTerm(null)
    }, [])

    // Track a search term (call when search is performed)
    const trackSearch = useCallback(async (term: string) => {
        if (term.length >= 3) {
            try {
                await fetch('/api/search/typeahead', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ term })
                })
            } catch {
                // Silently fail - tracking is non-critical
            }
        }
    }, [])

    return {
        completion,
        fullTerm,
        isLoading,
        acceptCompletion,
        clearCompletion,
        trackSearch
    }
}
