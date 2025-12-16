import { NextRequest, NextResponse } from 'next/server'

// Web search API using a search service
// This can be connected to various search APIs like Bing, Google Custom Search, or DuckDuckGo

interface WebSearchResult {
    id: string
    title: string
    snippet: string
    url: string
    source: string
    date?: string
}

export async function POST(request: NextRequest) {
    try {
        const { query, limit = 10 } = await request.json()

        if (!query || typeof query !== 'string') {
            return NextResponse.json({ error: 'Query is required' }, { status: 400 })
        }

        const startTime = Date.now()

        // Try to use the search_web tool via API or fall back to curated sources
        const results: WebSearchResult[] = []

        // Search reconstruction-related sources
        const reconstructionSources = [
            {
                name: 'World Bank',
                baseUrl: 'https://www.worldbank.org',
                searchUrl: `https://www.worldbank.org/en/search?q=${encodeURIComponent(query)}`
            },
            {
                name: 'ReliefWeb',
                baseUrl: 'https://reliefweb.int',
                searchUrl: `https://reliefweb.int/search?search=${encodeURIComponent(query)}`
            },
            {
                name: 'UNHCR',
                baseUrl: 'https://www.unhcr.org',
                searchUrl: `https://www.unhcr.org/search?query=${encodeURIComponent(query)}`
            },
            {
                name: 'UNHABITAT',
                baseUrl: 'https://unhabitat.org',
                searchUrl: `https://unhabitat.org/?s=${encodeURIComponent(query)}`
            },
            {
                name: 'OCHA',
                baseUrl: 'https://www.unocha.org',
                searchUrl: `https://www.unocha.org/search?keywords=${encodeURIComponent(query)}`
            }
        ]

        // Create synthetic results pointing to relevant search pages
        // In production, this would call actual search APIs
        reconstructionSources.forEach((source, index) => {
            results.push({
                id: `web-${index}`,
                title: `${query} - ${source.name} Resources`,
                snippet: `Search ${source.name} for documents, reports, and data related to "${query}" and Syria reconstruction.`,
                url: source.searchUrl,
                source: source.name,
                date: new Date().toLocaleDateString()
            })
        })

        // Add academic sources
        const academicSources = [
            {
                name: 'Google Scholar',
                url: `https://scholar.google.com/scholar?q=${encodeURIComponent(query + ' Syria reconstruction')}`
            },
            {
                name: 'ResearchGate',
                url: `https://www.researchgate.net/search/publication?q=${encodeURIComponent(query + ' Syria')}`
            }
        ]

        academicSources.forEach((source, index) => {
            results.push({
                id: `academic-${index}`,
                title: `Academic papers on "${query}"`,
                snippet: `Find peer-reviewed research papers and academic publications about ${query} related to Syria conflict and reconstruction.`,
                url: source.url,
                source: source.name,
                date: new Date().toLocaleDateString()
            })
        })

        const duration = Date.now() - startTime

        return NextResponse.json({
            results: results.slice(0, limit),
            total: results.length,
            search_duration_ms: duration,
            query
        })

    } catch (error) {
        console.error('Web search error:', error)
        return NextResponse.json(
            { error: 'Failed to perform web search' },
            { status: 500 }
        )
    }
}
