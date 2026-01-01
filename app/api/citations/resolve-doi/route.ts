// DOI Resolution API - Fetch metadata from Crossref
import { NextResponse } from 'next/server'
import {
    successResponse,
    errorResponse,
    getQueryParams,
    withErrorHandling,
} from '@/lib/apiUtils'

interface CrossrefWork {
    title?: string[]
    author?: Array<{ given?: string; family?: string; name?: string }>
    published?: { 'date-parts'?: number[][] }
    'container-title'?: string[]
    publisher?: string
    URL?: string
    DOI?: string
}

interface CrossrefResponse {
    status: string
    message: CrossrefWork
}

interface ResolvedDOI {
    doi: string
    title: string | null
    author: string | null
    year: number | null
    source: string | null
    url: string
}

/**
 * Normalize DOI: remove prefixes, lowercase
 */
function normalizeDOI(rawDOI: string): string {
    let doi = rawDOI.trim()
    // Remove URL prefixes
    doi = doi.replace(/^https?:\/\/(dx\.)?doi\.org\//i, '')
    doi = doi.replace(/^doi:/i, '')
    return doi.toLowerCase()
}

/**
 * Format authors from Crossref response
 */
function formatAuthors(authors: CrossrefWork['author']): string | null {
    if (!authors || authors.length === 0) return null

    return authors
        .map(a => {
            if (a.name) return a.name
            if (a.family && a.given) return `${a.family}, ${a.given}`
            return a.family || a.given || null
        })
        .filter(Boolean)
        .join('; ')
}

/**
 * Extract year from Crossref published date
 */
function extractYear(published: CrossrefWork['published']): number | null {
    if (!published?.['date-parts']?.[0]?.[0]) return null
    return published['date-parts'][0][0]
}

/**
 * GET /api/citations/resolve-doi
 * Resolve a DOI using Crossref API
 * Query params: doi
 * 
 * Uses Crossref "polite pool" with mailto parameter for better rate limits
 */
async function handleResolveDOI(request: Request): Promise<NextResponse> {
    const params = getQueryParams(request)
    const rawDOI = params.get('doi')

    if (!rawDOI) {
        return errorResponse('doi parameter is required', 422)
    }

    const doi = normalizeDOI(rawDOI)

    if (!doi || !/^10\.\d{4,}\//.test(doi)) {
        return errorResponse('Invalid DOI format. DOIs should start with "10."', 422)
    }

    try {
        // Use mailto for polite pool (better rate limits)
        const mailto = process.env.CROSSREF_MAILTO || 'admin@syrealize.com'
        const crossrefUrl = `https://api.crossref.org/works/${encodeURIComponent(doi)}?mailto=${encodeURIComponent(mailto)}`

        const response = await fetch(crossrefUrl, {
            headers: {
                'User-Agent': `SyriaHub/1.0 (mailto:${mailto})`,
                'Accept': 'application/json',
            },
            // Cache for 1 hour
            next: { revalidate: 3600 },
        })

        if (response.status === 404) {
            return errorResponse('DOI not found. This DOI may not be registered with Crossref.', 404)
        }

        if (!response.ok) {
            console.error('Crossref API error:', response.status, response.statusText)
            return errorResponse('Failed to resolve DOI. Please try again later.', 502)
        }

        const data: CrossrefResponse = await response.json()
        const work = data.message

        const resolved: ResolvedDOI = {
            doi,
            title: work.title?.[0] || null,
            author: formatAuthors(work.author),
            year: extractYear(work.published),
            source: work['container-title']?.[0] || work.publisher || null,
            url: work.URL || `https://doi.org/${doi}`,
        }

        return successResponse(resolved)
    } catch (error) {
        console.error('Error resolving DOI:', error)
        return errorResponse('Failed to resolve DOI. Please check the DOI and try again.', 500)
    }
}

export const GET = withErrorHandling(handleResolveDOI, {
    cache: {
        maxAge: 3600, // Cache for 1 hour
        staleWhileRevalidate: 86400, // Stale for 24 hours
    },
})
