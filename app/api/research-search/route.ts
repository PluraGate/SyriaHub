import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})

// ============================================
// POST: Semantic search with explainability
// ============================================
export async function POST(request: NextRequest) {
    const startTime = Date.now()

    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        const body = await request.json()
        const {
            query,
            filters = {},
            explain = true,
            limit = 20,
            offset = 0
        } = body

        if (!query || query.trim().length < 2) {
            return NextResponse.json({ error: 'Query must be at least 2 characters' }, { status: 400 })
        }

        // Generate embedding for query
        let queryEmbedding: number[] = []
        try {
            const embeddingResponse = await openai.embeddings.create({
                model: 'text-embedding-3-small',
                input: query.trim()
            })
            queryEmbedding = embeddingResponse.data[0].embedding
        } catch (embError) {
            console.error('Embedding error:', embError)
            // Fall back to text-based search
            return fallbackTextSearch(supabase, query, filters, limit, offset, startTime, user?.id)
        }

        // Extract filters
        const {
            disciplines,
            evidence_tiers,
            conflict_phase,
            min_trust_score = 0,
            primary_evidence_only = false
        } = filters

        // Call semantic search function
        const { data: searchResults, error: searchError } = await supabase.rpc('semantic_search', {
            p_query_embedding: `[${queryEmbedding.join(',')}]`,
            p_limit: limit,
            p_disciplines: disciplines || null,
            p_evidence_tiers: primary_evidence_only ? ['primary'] : (evidence_tiers || null),
            p_conflict_phase: conflict_phase || null,
            p_min_trust_score: min_trust_score
        })

        if (searchError) {
            console.error('Semantic search error:', searchError)
            return fallbackTextSearch(supabase, query, filters, limit, offset, startTime, user?.id)
        }

        // Enrich results with full data and explanations
        const enrichedResults = await Promise.all(
            (searchResults || []).map(async (result: {
                content_id: string
                content_type: string
                similarity: number
                evidence_tier: string
                trust_score: number
                final_score: number
            }) => {
                // Get content details
                let content: Record<string, unknown> | null = null
                if (result.content_type === 'post') {
                    const { data } = await supabase
                        .from('posts')
                        .select('id, title, content, tags, author_id, created_at, author:users!posts_author_id_fkey(name)')
                        .eq('id', result.content_id)
                        .single()
                    content = data
                }

                if (!content) return null

                // Get trust profile
                const { data: trustProfile } = await supabase
                    .from('trust_profiles')
                    .select('*')
                    .eq('content_id', result.content_id)
                    .eq('content_type', result.content_type)
                    .single()

                // Get linked resources
                const { data: linkedResources } = await supabase
                    .from('linked_resources')
                    .select('resource_type, title')
                    .eq('source_id', result.content_id)
                    .eq('source_type', result.content_type)
                    .limit(5)

                // Get contradictions
                const { data: contradictions } = await supabase
                    .from('content_relationships')
                    .select('source_id, source_type, relationship_detail')
                    .eq('target_id', result.content_id)
                    .eq('target_type', result.content_type)
                    .eq('relationship', 'contradicts')
                    .limit(3)

                // Build explanation
                const explanation = explain ? buildExplanation(
                    query,
                    content,
                    result,
                    trustProfile,
                    linkedResources || [],
                    contradictions || []
                ) : null

                return {
                    id: result.content_id,
                    type: result.content_type,
                    title: content.title as string,
                    snippet: truncateText(content.content as string, 200),
                    similarity_score: result.similarity,
                    final_score: result.final_score,
                    evidence_tier: result.evidence_tier,
                    trust_profile: trustProfile,
                    explanation,
                    linked_resources: (linkedResources || []).map((lr: { resource_type: string; title: string }) => ({
                        type: lr.resource_type,
                        title: lr.title,
                        connection: 'References'
                    })),
                    contradictions: (contradictions || []).map((c: { source_id: string; source_type: string; relationship_detail: string }) => ({
                        content_id: c.source_id,
                        content_type: c.source_type,
                        detail: c.relationship_detail
                    }))
                }
            })
        )

        // Filter out nulls
        const validResults = enrichedResults.filter(Boolean)

        // Create search session for analytics
        const searchDuration = Date.now() - startTime
        const { data: session } = await supabase
            .from('search_sessions')
            .insert({
                user_id: user?.id || null,
                query_text: query,
                disciplines: disciplines || [],
                evidence_tiers: evidence_tiers || [],
                conflict_phase: conflict_phase || null,
                result_count: validResults.length,
                top_result_id: validResults[0]?.id || null,
                search_duration_ms: searchDuration
            })
            .select('id')
            .single()

        return NextResponse.json({
            session_id: session?.id,
            results: validResults,
            total_count: validResults.length,
            search_duration_ms: searchDuration,
            query_disciplines: disciplines || []
        })
    } catch (error) {
        console.error('Research search error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// Fallback to text search if embeddings fail
async function fallbackTextSearch(
    supabase: Awaited<ReturnType<typeof createClient>>,
    query: string,
    filters: Record<string, unknown>,
    limit: number,
    offset: number,
    startTime: number,
    userId?: string
) {
    // SECURITY: Escape LIKE pattern special characters to prevent pattern injection
    const sanitizedQuery = query.replace(/[%_\\]/g, '\\$&')
    const { data, error } = await supabase
        .from('posts')
        .select(`
      id, title, content, tags, created_at,
      author:users!posts_author_id_fkey(name)
    `)
        .or(`title.ilike.%${sanitizedQuery}%,content.ilike.%${sanitizedQuery}%`)
        .eq('status', 'published')
        .range(offset, offset + limit - 1)

    if (error) {
        return NextResponse.json({ error: 'Search failed' }, { status: 500 })
    }

    const results = (data || []).map((post: Record<string, unknown>) => ({
        id: post.id,
        type: 'post',
        title: post.title,
        snippet: truncateText(post.content as string, 200),
        similarity_score: null,
        final_score: null,
        evidence_tier: 'secondary',
        trust_profile: null,
        explanation: {
            match_reasons: [{ reason: `Text match for "${query}"`, weight: 1.0 }],
            supporting_evidence: [],
            credibility_score: 50,
            credibility_breakdown: {},
            data_gaps: [{ gap: 'Semantic search unavailable', severity: 'low' }],
            uncertainty_flags: []
        },
        linked_resources: [],
        contradictions: []
    }))

    return NextResponse.json({
        session_id: null,
        results,
        total_count: results.length,
        search_duration_ms: Date.now() - startTime,
        query_disciplines: [],
        fallback: true
    })
}

// Build explanation for a search result
function buildExplanation(
    query: string,
    content: Record<string, unknown>,
    result: { similarity: number; trust_score: number },
    trustProfile: Record<string, unknown> | null,
    linkedResources: { resource_type: string }[],
    contradictions: { relationship_detail: string }[]
) {
    const matchReasons = []
    const supportingEvidence = []
    const dataGaps = []
    const uncertaintyFlags = []

    // Query matching
    const title = (content.title as string || '').toLowerCase()
    const queryTerms = query.toLowerCase().split(' ')
    const matchedTerms = queryTerms.filter(term => title.includes(term))

    if (matchedTerms.length > 0) {
        matchReasons.push({
            reason: `Query terms "${matchedTerms.join(', ')}" found in title`,
            weight: 0.3
        })
    }

    matchReasons.push({
        reason: `Semantic similarity: ${(result.similarity * 100).toFixed(1)}%`,
        weight: 0.4
    })

    // Trust score contribution
    if (result.trust_score >= 70) {
        matchReasons.push({ reason: 'High trust profile', weight: 0.2 })
    } else if (result.trust_score >= 50) {
        matchReasons.push({ reason: 'Medium trust profile', weight: 0.1 })
    }

    // Linked resources
    if (linkedResources.length > 0) {
        const types = [...new Set(linkedResources.map(lr => lr.resource_type))]
        supportingEvidence.push({
            type: 'linked_resource',
            count: linkedResources.length,
            detail: `Linked to ${linkedResources.length} resources`,
            types
        })
    }

    // Data gaps
    if (!trustProfile) {
        dataGaps.push({ gap: 'No trust profile available', severity: 'medium' })
    } else {
        if (!(trustProfile as { t3_firsthand: boolean }).t3_firsthand) {
            dataGaps.push({ gap: 'No first-hand field verification', severity: 'medium' })
        }
        if ((trustProfile as { t4_is_time_sensitive: boolean }).t4_is_time_sensitive) {
            const timestamp = (trustProfile as { t4_data_timestamp: string }).t4_data_timestamp
            if (timestamp && new Date(timestamp) < new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)) {
                dataGaps.push({ gap: 'Data may be outdated (over 1 year)', severity: 'medium' })
            }
        }
    }

    // Contradictions
    if (contradictions.length > 0) {
        uncertaintyFlags.push({
            flag: `Contradicted by ${contradictions.length} source(s)`,
            detail: contradictions[0]?.relationship_detail
        })
    }

    // Calculate credibility score
    const credibilityScore = Math.min(100, Math.max(0,
        (trustProfile ? Math.round(result.trust_score) : 50) +
        (linkedResources.length * 5) -
        (contradictions.length * 10) -
        (dataGaps.length * 5)
    ))

    return {
        match_reasons: matchReasons,
        supporting_evidence: supportingEvidence,
        credibility_score: credibilityScore,
        credibility_breakdown: trustProfile ? {
            source: (trustProfile as { t1_source_score: number }).t1_source_score,
            method: (trustProfile as { t2_method_score: number }).t2_method_score,
            proximity: (trustProfile as { t3_proximity_score: number }).t3_proximity_score,
            temporal: (trustProfile as { t4_temporal_score: number }).t4_temporal_score,
            validation: (trustProfile as { t5_validation_score: number }).t5_validation_score
        } : {},
        data_gaps: dataGaps,
        uncertainty_flags: uncertaintyFlags
    }
}

// Truncate text to specified length
function truncateText(text: string, maxLength: number): string {
    if (!text) return ''
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength).trim() + '...'
}
