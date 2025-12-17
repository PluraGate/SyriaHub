import { NextRequest, NextResponse } from 'next/server'
import { searchAllExternalSources, ExternalResult } from '@/lib/externalData'

// Web search API - integrates with external data sources
// ReliefWeb, HDX (Humanitarian Data Exchange), World Bank

interface WebSearchResult {
    id: string
    title: string
    snippet: string
    url: string
    source: string
    date?: string
    type?: string
}

export async function POST(request: NextRequest) {
    try {
        const { query, limit = 10 } = await request.json()

        if (!query || typeof query !== 'string') {
            return NextResponse.json({ error: 'Query is required' }, { status: 400 })
        }

        const startTime = Date.now()

        // Fetch from real external APIs
        const externalResults = await searchAllExternalSources(query, Math.ceil(limit / 3))

        // Transform to consistent format
        const results: WebSearchResult[] = externalResults.map((result: ExternalResult) => ({
            id: result.id,
            title: result.title,
            snippet: result.snippet,
            url: result.url,
            source: result.source,
            date: result.date || new Date().toLocaleDateString(),
            type: result.type
        }))

        // If we got fewer results than desired, add curated search links as fallback
        if (results.length < limit) {
            const curatedSources = [
                {
                    name: 'Google Scholar',
                    url: `https://scholar.google.com/scholar?q=${encodeURIComponent(query + ' Syria reconstruction')}`,
                    type: 'academic'
                },
                {
                    name: 'UNHCR',
                    url: `https://www.unhcr.org/search?query=${encodeURIComponent(query + ' Syria')}`,
                    type: 'humanitarian'
                },
                {
                    name: 'UN-Habitat',
                    url: `https://unhabitat.org/?s=${encodeURIComponent(query + ' Syria')}`,
                    type: 'urban'
                },
                {
                    name: 'OCHA',
                    url: `https://www.unocha.org/search?keywords=${encodeURIComponent(query + ' Syria')}`,
                    type: 'coordination'
                }
            ]

            curatedSources.forEach((source, index) => {
                if (results.length < limit) {
                    results.push({
                        id: `curated-${index}`,
                        title: `Search ${source.name}: "${query}"`,
                        snippet: `Find more resources about "${query}" on ${source.name}`,
                        url: source.url,
                        source: source.name,
                        date: new Date().toLocaleDateString(),
                        type: source.type
                    })
                }
            })
        }

        const duration = Date.now() - startTime

        return NextResponse.json({
            results: results.slice(0, limit),
            total: results.length,
            search_duration_ms: duration,
            query,
            sources: ['ReliefWeb', 'HDX', 'World Bank', 'Curated']
        })

    } catch (error) {
        console.error('Web search error:', error)
        return NextResponse.json(
            { error: 'Failed to perform web search' },
            { status: 500 }
        )
    }
}
