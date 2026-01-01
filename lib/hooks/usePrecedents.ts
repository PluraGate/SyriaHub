import { useState, useEffect } from 'react'

export interface Precedent {
    id: string
    title: string
    title_ar?: string
    summary: string
    summary_ar?: string
    pattern_id: string
    governorate?: string
    source_url?: string
    source_name?: string
    trust_level: string
}

export function usePrecedents(patternIds: string[], governorate?: string) {
    const [precedents, setPrecedents] = useState<Precedent[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    // Create a stable key for the dependency array to prevent infinite loops
    // when a new array reference is passed on every render
    const patternKey = patternIds.join(',')

    useEffect(() => {
        if (patternIds.length === 0) {
            setPrecedents([])
            setLoading(false)
            return
        }

        async function fetchPrecedents() {
            setLoading(true)
            setError(null)
            try {
                const results: Precedent[] = []
                // Limit to first 2 patterns to avoid excessive requests
                for (const patternId of patternIds.slice(0, 2)) {
                    const params = new URLSearchParams({ pattern: patternId })
                    if (governorate) params.append('governorate', governorate)

                    const res = await fetch(`/api/precedents?${params}&limit=2`)
                    if (res.ok) {
                        const contentType = res.headers.get('content-type')
                        if (contentType?.includes('application/json')) {
                            const data = await res.json()
                            if (Array.isArray(data)) {
                                results.push(...data)
                            }
                        }
                    }
                }

                // Deduplicate based on ID
                const unique = results.filter((p, i, arr) =>
                    arr.findIndex(x => x.id === p.id) === i
                ).slice(0, 3)

                setPrecedents(unique)
            } catch (err) {
                console.error('Failed to fetch precedents:', err)
                setError(err instanceof Error ? err : new Error('Unknown error'))
            } finally {
                setLoading(false)
            }
        }

        fetchPrecedents()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [patternKey, governorate])


    return { precedents, loading, error }
}
