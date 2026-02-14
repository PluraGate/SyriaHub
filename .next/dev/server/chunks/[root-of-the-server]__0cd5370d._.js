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
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[project]/RiderProjects/SyriaHub/lib/externalData.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * External Data Service
 * 
 * Integrates with external APIs for research data:
 * - ReliefWeb: Social impact reports and documents
 * - HDX: Data Exchange datasets
 * - World Bank: Economic indicators and data
 */ __turbopack_context__.s([
    "searchAllExternalSources",
    ()=>searchAllExternalSources,
    "searchExternalWithCache",
    ()=>searchExternalWithCache,
    "searchHDX",
    ()=>searchHDX,
    "searchReliefWeb",
    ()=>searchReliefWeb,
    "searchWorldBank",
    ()=>searchWorldBank
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/lib/supabase/server.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
;
;
/**
 * Generate a hash for caching purposes
 */ function hashQuery(query, params) {
    const content = JSON.stringify({
        query,
        params
    });
    return __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["createHash"]('md5').update(content).digest('hex');
}
/**
 * Check cache for existing data
 */ async function getCachedData(supabase, sourceId, queryHash) {
    const { data } = await supabase.rpc('get_cached_external_data', {
        p_source_id: sourceId,
        p_query_hash: queryHash
    });
    if (data) {
        return data.response_data;
    }
    return null;
}
/**
 * Store data in cache
 */ async function cacheData(supabase, sourceId, queryHash, queryParams, responseData, cacheDays = 7) {
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + cacheDays);
    await supabase.from('external_data_cache').insert({
        source_id: sourceId,
        query_hash: queryHash,
        query_params: queryParams,
        response_data: responseData,
        valid_until: validUntil.toISOString()
    });
}
async function searchReliefWeb(query, limit = 5) {
    try {
        const params = new URLSearchParams({
            appname: 'syriahub',
            query: {
                value: query,
                operator: 'AND'
            }
        });
        const response = await fetch(`https://api.reliefweb.int/v1/reports?appname=syriahub&query[value]=${encodeURIComponent(query)}&limit=${limit}&preset=latest`, {
            headers: {
                'Accept': 'application/json'
            },
            next: {
                revalidate: 3600
            } // Cache for 1 hour
        });
        if (!response.ok) {
            console.error('ReliefWeb API error:', response.status);
            return [];
        }
        const data = await response.json();
        return (data.data || []).map((item)=>({
                id: `reliefweb-${item.id}`,
                title: item.fields?.title || 'Untitled',
                snippet: item.fields?.body?.substring(0, 200) || '',
                url: item.fields?.url_alias ? `https://reliefweb.int${item.fields.url_alias}` : `https://reliefweb.int/node/${item.id}`,
                source: 'ReliefWeb',
                source_id: 'reliefweb',
                date: item.fields?.date?.created,
                type: 'report'
            }));
    } catch (error) {
        console.error('ReliefWeb search error:', error);
        return [];
    }
}
async function searchHDX(query, limit = 5) {
    try {
        const response = await fetch(`https://data.humdata.org/api/3/action/package_search?q=${encodeURIComponent(query)}&rows=${limit}`, {
            headers: {
                'Accept': 'application/json'
            },
            next: {
                revalidate: 3600
            }
        });
        if (!response.ok) {
            console.error('HDX API error:', response.status);
            return [];
        }
        const data = await response.json();
        return (data.result?.results || []).map((item)=>({
                id: `hdx-${item.id}`,
                title: item.title || 'Untitled Dataset',
                snippet: item.notes?.substring(0, 200) || '',
                url: `https://data.humdata.org/dataset/${item.name}`,
                source: 'HDX',
                source_id: 'hdx',
                date: item.metadata_created,
                type: 'dataset'
            }));
    } catch (error) {
        console.error('HDX search error:', error);
        return [];
    }
}
async function searchWorldBank(query, limit = 5) {
    try {
        // World Bank doesn't have a direct search API, so we search for Syria indicators
        // and filter based on query keywords
        const response = await fetch(`https://api.worldbank.org/v2/country/SYR/indicator?format=json&per_page=50`, {
            headers: {
                'Accept': 'application/json'
            },
            next: {
                revalidate: 86400
            } // Cache for 24 hours (indicators don't change often)
        });
        if (!response.ok) {
            console.error('World Bank API error:', response.status);
            // Return fallback link to World Bank Syria page
            return [
                {
                    id: 'worldbank-syria',
                    title: `World Bank Data: ${query}`,
                    snippet: 'Explore World Bank data and indicators for Syria including GDP, population, and development metrics.',
                    url: 'https://data.worldbank.org/country/syria',
                    source: 'World Bank',
                    source_id: 'worldbank',
                    type: 'data'
                }
            ];
        }
        const data = await response.json();
        const indicators = data[1] || [];
        // Filter indicators by query keywords
        const queryLower = query.toLowerCase();
        const filteredIndicators = indicators.filter((ind)=>ind.indicator?.value?.toLowerCase().includes(queryLower) || queryLower.split(' ').some((word)=>ind.indicator?.value?.toLowerCase().includes(word))).slice(0, limit);
        if (filteredIndicators.length === 0) {
            // Return general Syria data link
            return [
                {
                    id: 'worldbank-syria-search',
                    title: `World Bank: Syria Development Data`,
                    snippet: `Explore World Bank data related to "${query}". Access economic indicators, development metrics, and research.`,
                    url: `https://data.worldbank.org/country/syria`,
                    source: 'World Bank',
                    source_id: 'worldbank',
                    type: 'data'
                }
            ];
        }
        return filteredIndicators.map((item)=>({
                id: `worldbank-${item.indicator?.id}`,
                title: item.indicator?.value || 'Syria Indicator',
                snippet: `Latest value: ${item.value || 'N/A'} (${item.date || 'N/A'})`,
                url: `https://data.worldbank.org/indicator/${item.indicator?.id}?locations=SY`,
                source: 'World Bank',
                source_id: 'worldbank',
                date: item.date,
                type: 'indicator'
            }));
    } catch (error) {
        console.error('World Bank search error:', error);
        return [
            {
                id: 'worldbank-fallback',
                title: 'World Bank Syria Data',
                snippet: 'Access World Bank economic and development data for Syria.',
                url: 'https://data.worldbank.org/country/syria',
                source: 'World Bank',
                source_id: 'worldbank',
                type: 'data'
            }
        ];
    }
}
async function searchAllExternalSources(query, limit = 3) {
    const [reliefwebResults, hdxResults, worldbankResults] = await Promise.allSettled([
        searchReliefWeb(query, limit),
        searchHDX(query, limit),
        searchWorldBank(query, limit)
    ]);
    const results = [];
    if (reliefwebResults.status === 'fulfilled') {
        results.push(...reliefwebResults.value);
    }
    if (hdxResults.status === 'fulfilled') {
        results.push(...hdxResults.value);
    }
    if (worldbankResults.status === 'fulfilled') {
        results.push(...worldbankResults.value);
    }
    return results;
}
async function searchExternalWithCache(query, limit = 3) {
    try {
        const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createClient"])();
        const queryHash = hashQuery(query, {
            limit
        });
        // Check cache first
        const cached = await getCachedData(supabase, 'combined', queryHash);
        if (cached) {
            return cached;
        }
        // Fetch fresh data
        const results = await searchAllExternalSources(query, limit);
        // Cache results if any
        if (results.length > 0) {
            await cacheData(supabase, 'combined', queryHash, {
                query,
                limit
            }, results, 7);
        }
        return results;
    } catch (error) {
        console.error('External search with cache error:', error);
        // Fall back to direct search without caching
        return searchAllExternalSources(query, limit);
    }
}
}),
"[project]/RiderProjects/SyriaHub/app/api/web-search/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$lib$2f$externalData$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/lib/externalData.ts [app-route] (ecmascript)");
;
;
async function POST(request) {
    try {
        const { query, limit = 10 } = await request.json();
        if (!query || typeof query !== 'string') {
            return __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Query is required'
            }, {
                status: 400
            });
        }
        const startTime = Date.now();
        // Fetch from real external APIs
        const externalResults = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$lib$2f$externalData$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["searchAllExternalSources"])(query, Math.ceil(limit / 3));
        // Transform to consistent format
        const results = externalResults.map((result)=>({
                id: result.id,
                title: result.title,
                snippet: result.snippet,
                url: result.url,
                source: result.source,
                date: result.date || new Date().toLocaleDateString(),
                type: result.type
            }));
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
            ];
            curatedSources.forEach((source, index)=>{
                if (results.length < limit) {
                    results.push({
                        id: `curated-${index}`,
                        title: `Search ${source.name}: "${query}"`,
                        snippet: `Find more resources about "${query}" on ${source.name}`,
                        url: source.url,
                        source: source.name,
                        date: new Date().toLocaleDateString(),
                        type: source.type
                    });
                }
            });
        }
        const duration = Date.now() - startTime;
        return __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            results: results.slice(0, limit),
            total: results.length,
            search_duration_ms: duration,
            query,
            sources: [
                'ReliefWeb',
                'HDX',
                'World Bank',
                'Curated'
            ]
        });
    } catch (error) {
        console.error('Web search error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Failed to perform web search'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0cd5370d._.js.map