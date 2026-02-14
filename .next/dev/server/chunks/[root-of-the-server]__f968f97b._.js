module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/RiderProjects/SyriaHub/lib/supabase/server.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createClient",
    ()=>createClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/@supabase/ssr/dist/module/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/@supabase/ssr/dist/module/createServerClient.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/next/headers.js [app-route] (ecmascript)");
;
;
async function createClient() {
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createServerClient"])(("TURBOPACK compile-time value", "https://bwrdwbmhxtrghyrrfofb.supabase.co"), ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3cmR3Ym1oeHRyZ2h5cnJmb2ZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5NzU1NzMsImV4cCI6MjA3NDU1MTU3M30.yf4aP7pq_QkhRx_4nacfCcZ6mSsPtE3LeHw442gyv9U"), {
        cookies: {
            get (name) {
                return cookieStore.get(name)?.value;
            },
            set (name, value, options) {
                try {
                    cookieStore.set({
                        name,
                        value,
                        ...options
                    });
                } catch (error) {
                // The `set` method was called from a Server Component.
                // This can be ignored if you have middleware refreshing
                // user sessions.
                }
            },
            remove (name, options) {
                try {
                    cookieStore.set({
                        name,
                        value: '',
                        ...options
                    });
                } catch (error) {
                // The `delete` method was called from a Server Component.
                // This can be ignored if you have middleware refreshing
                // user sessions.
                }
            }
        }
    });
}
}),
"[project]/RiderProjects/SyriaHub/app/api/research-search/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/lib/supabase/server.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$openai$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/openai/index.mjs [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$openai$2f$client$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__OpenAI__as__default$3e$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/openai/client.mjs [app-route] (ecmascript) <export OpenAI as default>");
;
;
;
const openai = new __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$openai$2f$client$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__OpenAI__as__default$3e$__["default"]({
    apiKey: process.env.OPENAI_API_KEY
});
async function POST(request) {
    const startTime = Date.now();
    try {
        const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createClient"])();
        const { data: { user } } = await supabase.auth.getUser();
        const body = await request.json();
        const { query, filters = {}, explain = true, limit = 20, offset = 0 } = body;
        if (!query || query.trim().length < 2) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Query must be at least 2 characters'
            }, {
                status: 400
            });
        }
        // Generate embedding for query
        let queryEmbedding = [];
        try {
            const embeddingResponse = await openai.embeddings.create({
                model: 'text-embedding-3-small',
                input: query.trim()
            });
            queryEmbedding = embeddingResponse.data[0].embedding;
        } catch (embError) {
            console.error('Embedding error:', embError);
            // Fall back to text-based search
            return fallbackTextSearch(supabase, query, filters, limit, offset, startTime, user?.id);
        }
        // Extract filters
        const { disciplines, evidence_tiers, conflict_phase, min_trust_score = 0, primary_evidence_only = false } = filters;
        // Call semantic search function
        const { data: searchResults, error: searchError } = await supabase.rpc('semantic_search', {
            p_query_embedding: `[${queryEmbedding.join(',')}]`,
            p_limit: limit,
            p_disciplines: disciplines || null,
            p_evidence_tiers: primary_evidence_only ? [
                'primary'
            ] : evidence_tiers || null,
            p_conflict_phase: conflict_phase || null,
            p_min_trust_score: min_trust_score
        });
        if (searchError) {
            console.error('Semantic search error:', searchError);
            return fallbackTextSearch(supabase, query, filters, limit, offset, startTime, user?.id);
        }
        // Enrich results with full data and explanations
        const enrichedResults = await Promise.all((searchResults || []).map(async (result)=>{
            // Get content details
            let content = null;
            if (result.content_type === 'post') {
                const { data } = await supabase.from('posts').select('id, title, content, tags, author_id, created_at, author:users!posts_author_id_fkey(name)').eq('id', result.content_id).single();
                content = data;
            }
            if (!content) return null;
            // Get trust profile
            const { data: trustProfile } = await supabase.from('trust_profiles').select('*').eq('content_id', result.content_id).eq('content_type', result.content_type).single();
            // Get linked resources
            const { data: linkedResources } = await supabase.from('linked_resources').select('resource_type, title').eq('source_id', result.content_id).eq('source_type', result.content_type).limit(5);
            // Get contradictions
            const { data: contradictions } = await supabase.from('content_relationships').select('source_id, source_type, relationship_detail').eq('target_id', result.content_id).eq('target_type', result.content_type).eq('relationship', 'contradicts').limit(3);
            // Build explanation
            const explanation = explain ? buildExplanation(query, content, result, trustProfile, linkedResources || [], contradictions || []) : null;
            return {
                id: result.content_id,
                type: result.content_type,
                title: content.title,
                snippet: truncateText(content.content, 200),
                similarity_score: result.similarity,
                final_score: result.final_score,
                evidence_tier: result.evidence_tier,
                trust_profile: trustProfile,
                explanation,
                linked_resources: (linkedResources || []).map((lr)=>({
                        type: lr.resource_type,
                        title: lr.title,
                        connection: 'References'
                    })),
                contradictions: (contradictions || []).map((c)=>({
                        content_id: c.source_id,
                        content_type: c.source_type,
                        detail: c.relationship_detail
                    }))
            };
        }));
        // Filter out nulls
        const validResults = enrichedResults.filter(Boolean);
        // Create search session for analytics
        const searchDuration = Date.now() - startTime;
        const { data: session } = await supabase.from('search_sessions').insert({
            user_id: user?.id || null,
            query_text: query,
            disciplines: disciplines || [],
            evidence_tiers: evidence_tiers || [],
            conflict_phase: conflict_phase || null,
            result_count: validResults.length,
            top_result_id: validResults[0]?.id || null,
            search_duration_ms: searchDuration
        }).select('id').single();
        return __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            session_id: session?.id,
            results: validResults,
            total_count: validResults.length,
            search_duration_ms: searchDuration,
            query_disciplines: disciplines || []
        });
    } catch (error) {
        console.error('Research search error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Internal server error'
        }, {
            status: 500
        });
    }
}
// Fallback to text search if embeddings fail
async function fallbackTextSearch(supabase, query, filters, limit, offset, startTime, userId) {
    const { data, error } = await supabase.from('posts').select(`
      id, title, content, tags, created_at,
      author:users!posts_author_id_fkey(name)
    `).or(`title.ilike.%${query}%,content.ilike.%${query}%`).eq('status', 'published').range(offset, offset + limit - 1);
    if (error) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Search failed'
        }, {
            status: 500
        });
    }
    const results = (data || []).map((post)=>({
            id: post.id,
            type: 'post',
            title: post.title,
            snippet: truncateText(post.content, 200),
            similarity_score: null,
            final_score: null,
            evidence_tier: 'secondary',
            trust_profile: null,
            explanation: {
                match_reasons: [
                    {
                        reason: `Text match for "${query}"`,
                        weight: 1.0
                    }
                ],
                supporting_evidence: [],
                credibility_score: 50,
                credibility_breakdown: {},
                data_gaps: [
                    {
                        gap: 'Semantic search unavailable',
                        severity: 'low'
                    }
                ],
                uncertainty_flags: []
            },
            linked_resources: [],
            contradictions: []
        }));
    return __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        session_id: null,
        results,
        total_count: results.length,
        search_duration_ms: Date.now() - startTime,
        query_disciplines: [],
        fallback: true
    });
}
// Build explanation for a search result
function buildExplanation(query, content, result, trustProfile, linkedResources, contradictions) {
    const matchReasons = [];
    const supportingEvidence = [];
    const dataGaps = [];
    const uncertaintyFlags = [];
    // Query matching
    const title = (content.title || '').toLowerCase();
    const queryTerms = query.toLowerCase().split(' ');
    const matchedTerms = queryTerms.filter((term)=>title.includes(term));
    if (matchedTerms.length > 0) {
        matchReasons.push({
            reason: `Query terms "${matchedTerms.join(', ')}" found in title`,
            weight: 0.3
        });
    }
    matchReasons.push({
        reason: `Semantic similarity: ${(result.similarity * 100).toFixed(1)}%`,
        weight: 0.4
    });
    // Trust score contribution
    if (result.trust_score >= 70) {
        matchReasons.push({
            reason: 'High trust profile',
            weight: 0.2
        });
    } else if (result.trust_score >= 50) {
        matchReasons.push({
            reason: 'Medium trust profile',
            weight: 0.1
        });
    }
    // Linked resources
    if (linkedResources.length > 0) {
        const types = [
            ...new Set(linkedResources.map((lr)=>lr.resource_type))
        ];
        supportingEvidence.push({
            type: 'linked_resource',
            count: linkedResources.length,
            detail: `Linked to ${linkedResources.length} resources`,
            types
        });
    }
    // Data gaps
    if (!trustProfile) {
        dataGaps.push({
            gap: 'No trust profile available',
            severity: 'medium'
        });
    } else {
        if (!trustProfile.t3_firsthand) {
            dataGaps.push({
                gap: 'No first-hand field verification',
                severity: 'medium'
            });
        }
        if (trustProfile.t4_is_time_sensitive) {
            const timestamp = trustProfile.t4_data_timestamp;
            if (timestamp && new Date(timestamp) < new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)) {
                dataGaps.push({
                    gap: 'Data may be outdated (over 1 year)',
                    severity: 'medium'
                });
            }
        }
    }
    // Contradictions
    if (contradictions.length > 0) {
        uncertaintyFlags.push({
            flag: `Contradicted by ${contradictions.length} source(s)`,
            detail: contradictions[0]?.relationship_detail
        });
    }
    // Calculate credibility score
    const credibilityScore = Math.min(100, Math.max(0, (trustProfile ? Math.round(result.trust_score) : 50) + linkedResources.length * 5 - contradictions.length * 10 - dataGaps.length * 5));
    return {
        match_reasons: matchReasons,
        supporting_evidence: supportingEvidence,
        credibility_score: credibilityScore,
        credibility_breakdown: trustProfile ? {
            source: trustProfile.t1_source_score,
            method: trustProfile.t2_method_score,
            proximity: trustProfile.t3_proximity_score,
            temporal: trustProfile.t4_temporal_score,
            validation: trustProfile.t5_validation_score
        } : {},
        data_gaps: dataGaps,
        uncertainty_flags: uncertaintyFlags
    };
}
// Truncate text to specified length
function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__f968f97b._.js.map