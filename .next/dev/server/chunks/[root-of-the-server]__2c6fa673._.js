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
"[project]/RiderProjects/SyriaHub/app/api/web-search/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/next/server.js [app-route] (ecmascript)");
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
        // Try to use the search_web tool via API or fall back to curated sources
        const results = [];
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
        ];
        // Create synthetic results pointing to relevant search pages
        // In production, this would call actual search APIs
        reconstructionSources.forEach((source, index)=>{
            results.push({
                id: `web-${index}`,
                title: `${query} - ${source.name} Resources`,
                snippet: `Search ${source.name} for documents, reports, and data related to "${query}" and Syria reconstruction.`,
                url: source.searchUrl,
                source: source.name,
                date: new Date().toLocaleDateString()
            });
        });
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
        ];
        academicSources.forEach((source, index)=>{
            results.push({
                id: `academic-${index}`,
                title: `Academic papers on "${query}"`,
                snippet: `Find peer-reviewed research papers and academic publications about ${query} related to Syria conflict and reconstruction.`,
                url: source.url,
                source: source.name,
                date: new Date().toLocaleDateString()
            });
        });
        const duration = Date.now() - startTime;
        return __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            results: results.slice(0, limit),
            total: results.length,
            search_duration_ms: duration,
            query
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

//# sourceMappingURL=%5Broot-of-the-server%5D__2c6fa673._.js.map