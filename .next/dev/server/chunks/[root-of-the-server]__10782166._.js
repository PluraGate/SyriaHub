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
"[project]/RiderProjects/SyriaHub/app/api/public/survey/[token]/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/lib/supabase/server.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
;
;
;
// Generate a fingerprint hash from request headers
function generateFingerprint(request) {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    // Create a hash of IP + User Agent for fingerprinting
    const data = `${ip}|${userAgent}`;
    return __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].createHash('sha256').update(data).digest('hex').slice(0, 32);
}
async function GET(request, { params }) {
    const { token } = await params;
    const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createClient"])();
    // Fetch survey by public token
    const { data: survey, error: surveyError } = await supabase.from('surveys').select('id, title, description, is_anonymous, allow_multiple_responses').eq('public_token', token).eq('allow_public_responses', true).eq('status', 'active').single();
    if (surveyError || !survey) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Survey not found or not available'
        }, {
            status: 404
        });
    }
    // Check if survey has ended
    const { data: fullSurvey } = await supabase.from('surveys').select('end_date').eq('id', survey.id).single();
    if (fullSurvey?.end_date && new Date(fullSurvey.end_date) < new Date()) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'This survey has ended'
        }, {
            status: 400
        });
    }
    // Fetch questions
    const { data: questions, error: questionsError } = await supabase.from('survey_questions').select('id, question_text, question_type, options, required, description, order_index').eq('survey_id', survey.id).order('order_index', {
        ascending: true
    });
    if (questionsError) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Failed to fetch questions'
        }, {
            status: 500
        });
    }
    // Check if this fingerprint has already responded
    const fingerprint = generateFingerprint(request);
    let hasResponded = false;
    if (!survey.allow_multiple_responses) {
        const { data: existingResponse } = await supabase.from('survey_responses').select('id').eq('survey_id', survey.id).eq('metadata->>fingerprint_hash', fingerprint).single();
        hasResponded = !!existingResponse;
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        survey: {
            ...survey,
            questions: questions || []
        },
        hasResponded
    });
}
async function POST(request, { params }) {
    const { token } = await params;
    const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createClient"])();
    const fingerprint = generateFingerprint(request);
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    // Fetch survey
    const { data: survey, error: surveyError } = await supabase.from('surveys').select('id, allow_multiple_responses, end_date').eq('public_token', token).eq('allow_public_responses', true).eq('status', 'active').single();
    if (surveyError || !survey) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Survey not found or not available'
        }, {
            status: 404
        });
    }
    // Check if survey has ended
    if (survey.end_date && new Date(survey.end_date) < new Date()) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'This survey has ended'
        }, {
            status: 400
        });
    }
    // Check for duplicate response
    if (!survey.allow_multiple_responses) {
        const { data: existingResponse } = await supabase.from('survey_responses').select('id').eq('survey_id', survey.id).eq('metadata->>fingerprint_hash', fingerprint).single();
        if (existingResponse) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'You have already responded to this survey'
            }, {
                status: 400
            });
        }
    }
    try {
        const body = await request.json();
        const { answers } = body;
        if (!answers || typeof answers !== 'object') {
            return __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Invalid answers format'
            }, {
                status: 400
            });
        }
        // Insert response with metadata for fingerprinting
        const { error: insertError } = await supabase.from('survey_responses').insert({
            survey_id: survey.id,
            respondent_id: null,
            answers,
            is_complete: true,
            metadata: {
                fingerprint_hash: fingerprint,
                ip_hash: __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].createHash('sha256').update(ip).digest('hex').slice(0, 16),
                user_agent: userAgent.slice(0, 200),
                source: 'public_link'
            }
        });
        if (insertError) {
            console.error('Failed to save response:', insertError);
            return __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Failed to save response'
            }, {
                status: 500
            });
        }
        // Increment response count
        await supabase.rpc('increment_survey_responses', {
            survey_id: survey.id
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true
        });
    } catch (error) {
        console.error('Survey response error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Invalid request'
        }, {
            status: 400
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__10782166._.js.map