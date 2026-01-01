/**
 * External Data Service
 * 
 * Integrates with external APIs for research data:
 * - ReliefWeb: Social impact reports and documents
 * - HDX: Data Exchange datasets
 * - World Bank: Economic indicators and data
 */

import { createClient } from '@/lib/supabase/server'
import * as crypto from 'crypto'

export interface ExternalResult {
    id: string
    title: string
    snippet: string
    url: string
    source: string
    source_id: string
    date?: string
    type?: string
}

interface CacheEntry {
    response_data: unknown
    valid_until: string
}

/**
 * Generate a hash for caching purposes
 */
function hashQuery(query: string, params?: Record<string, unknown>): string {
    const content = JSON.stringify({ query, params })
    return crypto.createHash('md5').update(content).digest('hex')
}

/**
 * Check cache for existing data
 */
async function getCachedData(
    supabase: Awaited<ReturnType<typeof createClient>>,
    sourceId: string,
    queryHash: string
): Promise<unknown | null> {
    const { data } = await supabase.rpc('get_cached_external_data', {
        p_source_id: sourceId,
        p_query_hash: queryHash
    })

    if (data) {
        return (data as CacheEntry).response_data
    }
    return null
}

/**
 * Store data in cache
 */
async function cacheData(
    supabase: Awaited<ReturnType<typeof createClient>>,
    sourceId: string,
    queryHash: string,
    queryParams: Record<string, unknown>,
    responseData: unknown,
    cacheDays: number = 7
): Promise<void> {
    const validUntil = new Date()
    validUntil.setDate(validUntil.getDate() + cacheDays)

    await supabase.from('external_data_cache').insert({
        source_id: sourceId,
        query_hash: queryHash,
        query_params: queryParams,
        response_data: responseData,
        valid_until: validUntil.toISOString()
    })
}

/**
 * Search ReliefWeb API
 * Documentation: https://reliefweb.int/help/api
 */
export async function searchReliefWeb(query: string, limit: number = 5): Promise<ExternalResult[]> {
    try {
        const params = new URLSearchParams({
            appname: 'syriahub',
            query: {
                value: query,
                operator: 'AND'
            }
        } as never)

        const response = await fetch(
            `https://api.reliefweb.int/v1/reports?appname=syriahub&query[value]=${encodeURIComponent(query)}&limit=${limit}&preset=latest`,
            {
                headers: {
                    'Accept': 'application/json'
                },
                next: { revalidate: 3600 } // Cache for 1 hour
            }
        )

        if (!response.ok) {
            console.error('ReliefWeb API error:', response.status)
            return []
        }

        const data = await response.json()

        return (data.data || []).map((item: { id: string; fields: { title: string; body?: string; url_alias?: string; date?: { created?: string }; source?: { name?: string }[] } }) => ({
            id: `reliefweb-${item.id}`,
            title: item.fields?.title || 'Untitled',
            snippet: item.fields?.body?.substring(0, 200) || '',
            url: item.fields?.url_alias
                ? `https://reliefweb.int${item.fields.url_alias}`
                : `https://reliefweb.int/node/${item.id}`,
            source: 'ReliefWeb',
            source_id: 'reliefweb',
            date: item.fields?.date?.created,
            type: 'report'
        }))
    } catch (error) {
        console.error('ReliefWeb search error:', error)
        return []
    }
}

/**
 * Search Humanitarian Data Exchange (HDX)
 * Documentation: https://data.humdata.org/api/3
 */
export async function searchHDX(query: string, limit: number = 5): Promise<ExternalResult[]> {
    try {
        const response = await fetch(
            `https://data.humdata.org/api/3/action/package_search?q=${encodeURIComponent(query)}&rows=${limit}`,
            {
                headers: {
                    'Accept': 'application/json'
                },
                next: { revalidate: 3600 }
            }
        )

        if (!response.ok) {
            console.error('HDX API error:', response.status)
            return []
        }

        const data = await response.json()

        return (data.result?.results || []).map((item: { id: string; title: string; notes?: string; name: string; organization?: { title?: string }; metadata_created?: string }) => ({
            id: `hdx-${item.id}`,
            title: item.title || 'Untitled Dataset',
            snippet: item.notes?.substring(0, 200) || '',
            url: `https://data.humdata.org/dataset/${item.name}`,
            source: 'HDX',
            source_id: 'hdx',
            date: item.metadata_created,
            type: 'dataset'
        }))
    } catch (error) {
        console.error('HDX search error:', error)
        return []
    }
}

/**
 * Search World Bank Data API
 * Documentation: https://datahelpdesk.worldbank.org/knowledgebase/topics/125589
 */
export async function searchWorldBank(query: string, limit: number = 5): Promise<ExternalResult[]> {
    try {
        // World Bank doesn't have a direct search API, so we search for Syria indicators
        // and filter based on query keywords
        const response = await fetch(
            `https://api.worldbank.org/v2/country/SYR/indicator?format=json&per_page=50`,
            {
                headers: {
                    'Accept': 'application/json'
                },
                next: { revalidate: 86400 } // Cache for 24 hours (indicators don't change often)
            }
        )

        if (!response.ok) {
            console.error('World Bank API error:', response.status)
            // Return fallback link to World Bank Syria page
            return [{
                id: 'worldbank-syria',
                title: `World Bank Data: ${query}`,
                snippet: 'Explore World Bank data and indicators for Syria including GDP, population, and development metrics.',
                url: 'https://data.worldbank.org/country/syria',
                source: 'World Bank',
                source_id: 'worldbank',
                type: 'data'
            }]
        }

        const data = await response.json()
        const indicators = data[1] || []

        // Filter indicators by query keywords
        const queryLower = query.toLowerCase()
        const filteredIndicators = indicators
            .filter((ind: { indicator?: { value?: string } }) =>
                ind.indicator?.value?.toLowerCase().includes(queryLower) ||
                queryLower.split(' ').some((word: string) =>
                    ind.indicator?.value?.toLowerCase().includes(word)
                )
            )
            .slice(0, limit)

        if (filteredIndicators.length === 0) {
            // Return general Syria data link
            return [{
                id: 'worldbank-syria-search',
                title: `World Bank: Syria Development Data`,
                snippet: `Explore World Bank data related to "${query}". Access economic indicators, development metrics, and research.`,
                url: `https://data.worldbank.org/country/syria`,
                source: 'World Bank',
                source_id: 'worldbank',
                type: 'data'
            }]
        }

        return filteredIndicators.map((item: { indicator?: { id?: string; value?: string }; date?: string; value?: number }) => ({
            id: `worldbank-${item.indicator?.id}`,
            title: item.indicator?.value || 'Syria Indicator',
            snippet: `Latest value: ${item.value || 'N/A'} (${item.date || 'N/A'})`,
            url: `https://data.worldbank.org/indicator/${item.indicator?.id}?locations=SY`,
            source: 'World Bank',
            source_id: 'worldbank',
            date: item.date,
            type: 'indicator'
        }))
    } catch (error) {
        console.error('World Bank search error:', error)
        return [{
            id: 'worldbank-fallback',
            title: 'World Bank Syria Data',
            snippet: 'Access World Bank economic and development data for Syria.',
            url: 'https://data.worldbank.org/country/syria',
            source: 'World Bank',
            source_id: 'worldbank',
            type: 'data'
        }]
    }
}

/**
 * Search all external sources
 */
export async function searchAllExternalSources(query: string, limit: number = 3): Promise<ExternalResult[]> {
    const [reliefwebResults, hdxResults, worldbankResults] = await Promise.allSettled([
        searchReliefWeb(query, limit),
        searchHDX(query, limit),
        searchWorldBank(query, limit)
    ])

    const results: ExternalResult[] = []

    if (reliefwebResults.status === 'fulfilled') {
        results.push(...reliefwebResults.value)
    }
    if (hdxResults.status === 'fulfilled') {
        results.push(...hdxResults.value)
    }
    if (worldbankResults.status === 'fulfilled') {
        results.push(...worldbankResults.value)
    }

    return results
}

/**
 * Search external sources with caching
 */
export async function searchExternalWithCache(
    query: string,
    limit: number = 3
): Promise<ExternalResult[]> {
    try {
        const supabase = await createClient()
        const queryHash = hashQuery(query, { limit })

        // Check cache first
        const cached = await getCachedData(supabase, 'combined', queryHash)
        if (cached) {
            return cached as ExternalResult[]
        }

        // Fetch fresh data
        const results = await searchAllExternalSources(query, limit)

        // Cache results if any
        if (results.length > 0) {
            await cacheData(supabase, 'combined', queryHash, { query, limit }, results, 7)
        }

        return results
    } catch (error) {
        console.error('External search with cache error:', error)
        // Fall back to direct search without caching
        return searchAllExternalSources(query, limit)
    }
}
