import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables for scripts
config({ path: '.env.local' })

// ==================== Configuration ====================

// Rate limiting: Maximum AI analyses per hour (persistent via database)
const MAX_ANALYSES_PER_HOUR = 30

// Model configuration - use gpt-4o-mini for cost efficiency
const OPENAI_MODEL = 'gpt-4o-mini' // ~$0.15/1M input vs $2.50/1M for gpt-4o
const MAX_TOKENS = 1000 // Limit response size

// Content limits to reduce token usage
const MAX_CONTENT_LENGTH = 3000 // Truncate long posts
const MAX_CONTEXT_POSTS = 5 // Fewer comparison posts
const MAX_CONTEXT_CONTENT_LENGTH = 200 // Shorter excerpts

// ==================== Rate Limiting (Database-backed) ====================

async function checkRateLimit(supabase: SupabaseClient): Promise<{ allowed: boolean; remaining: number }> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()

    // Count recent analyses from database
    const { count, error } = await supabase
        .from('ai_rate_limits')
        .select('*', { count: 'exact', head: true })
        .eq('action_type', 'recommendation_analysis')
        .gte('executed_at', oneHourAgo)

    if (error) {
        console.error('[RecomAI] Rate limit check failed:', error)
        // Fail open but log the issue
        return { allowed: true, remaining: MAX_ANALYSES_PER_HOUR }
    }

    const used = count || 0
    const remaining = MAX_ANALYSES_PER_HOUR - used

    if (remaining <= 0) {
        console.warn(`[RecomAI] Rate limit reached: ${used}/${MAX_ANALYSES_PER_HOUR} per hour`)
        return { allowed: false, remaining: 0 }
    }

    return { allowed: true, remaining }
}

async function recordAnalysis(supabase: SupabaseClient): Promise<void> {
    const { error } = await supabase
        .from('ai_rate_limits')
        .insert({ action_type: 'recommendation_analysis' })

    if (error) {
        console.error('[RecomAI] Failed to record analysis:', error)
    }
}

// ==================== Supabase Client ====================

const getSupabase = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) throw new Error('Supabase credentials missing')
    return createClient(url, key)
}

// ==================== Main Analysis Function ====================

export interface AnalysisResult {
    trustProfile: any
    relationships: any[]
    disciplines: string[]
    evidence: any
}

/**
 * Analyzes a post to extract trust vectors, disciplines, and relationships.
 * Includes rate limiting and cost optimization.
 */
export async function analyzePostForRecommendations(
    postId: string,
    title: string,
    content: string,
    tags: string[] = [],
    options: { force?: boolean } = {}
): Promise<AnalysisResult | null> {
    try {
        const supabase = getSupabase()

        // 1. Check rate limit
        const rateCheck = await checkRateLimit(supabase)
        if (!rateCheck.allowed) {
            console.log(`[RecomAI] Skipping analysis due to rate limit. Remaining: ${rateCheck.remaining}`)
            return null
        }

        // 2. Check if already analyzed (skip unless forced)
        if (!options.force) {
            const { data: existing } = await supabase
                .from('trust_profiles')
                .select('id, updated_at')
                .eq('content_id', postId)
                .eq('content_type', 'post')
                .single()

            if (existing) {
                const lastUpdate = new Date(existing.updated_at)
                const hoursSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60)

                // Skip if analyzed within the last 24 hours
                if (hoursSinceUpdate < 24) {
                    console.log(`[RecomAI] Skipping: Post already analyzed ${hoursSinceUpdate.toFixed(1)}h ago`)
                    return null
                }
            }
        }

        // 3. Check API key
        const apiKey = process.env.OPENAI_API_KEY
        if (!apiKey) {
            console.error('[RecomAI] OPENAI_API_KEY is missing')
            return null
        }

        console.log(`[RecomAI] Analyzing: ${title} (${postId})`)

        // 4. Fetch context posts (limited for cost)
        const { data: recentPosts } = await supabase
            .from('posts')
            .select('id, title, content, tags')
            .eq('status', 'published')
            .neq('id', postId)
            .order('created_at', { ascending: false })
            .limit(MAX_CONTEXT_POSTS)

        const recentPostsText = recentPosts?.map(p =>
            `ID: ${p.id}\nTitle: ${p.title}\nContent: ${p.content.slice(0, MAX_CONTEXT_CONTENT_LENGTH)}...`
        ).join('\n---\n') || 'No recent posts.'

        // 5. Truncate content for cost efficiency
        const truncatedContent = content.length > MAX_CONTENT_LENGTH
            ? content.slice(0, MAX_CONTENT_LENGTH) + '...[truncated]'
            : content

        // 6. Optimized prompt (shorter, focused)
        const systemPrompt = `Analyze Syrian conflict research. Output JSON:
{
  "trust_profile": { "t1_source_score": 0-100, "t2_method_score": 0-100, "t3_proximity_type": "on_site"|"remote"|"inferred", "t3_proximity_score": 0-100, "t4_conflict_phase": "pre_conflict"|"active_conflict"|"de_escalation"|"early_reconstruction"|"active_reconstruction" },
  "disciplines": ["string"],
  "evidence": { "evidence_type": "field_survey"|"satellite_imagery"|"academic_paper"|"ngo_assessment"|"news_article"|"expert_commentary", "evidence_tier": "primary"|"secondary"|"derived"|"interpretive" },
  "relationships": [ { "target_id": "uuid", "relationship": "contradicts"|"supports"|"same_site", "detail": "string" } ]
}`

        const userPrompt = `Post: "${title}"\nTags: ${tags.join(', ')}\nContent: ${truncatedContent}\n\nContext posts:\n${recentPostsText}`

        // 7. Make API call with cost controls
        console.log(`[RecomAI] Calling ${OPENAI_MODEL}...`)
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: OPENAI_MODEL,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                response_format: { type: 'json_object' },
                max_tokens: MAX_TOKENS,
                temperature: 0.3 // Lower temperature for more consistent output
            })
        })

        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`OpenAI API Error: ${response.status} ${errorText}`)
        }

        // Record successful API call for rate limiting
        await recordAnalysis(supabase)

        const data = await response.json()
        const analysis = JSON.parse(data.choices[0].message.content || '{}')

        // Log token usage for cost monitoring
        if (data.usage) {
            console.log(`[RecomAI] Tokens used: ${data.usage.total_tokens} (input: ${data.usage.prompt_tokens}, output: ${data.usage.completion_tokens})`)
        }

        // 8. Store results
        const { error: trustError } = await supabase
            .from('trust_profiles')
            .upsert({
                content_id: postId,
                content_type: 'post',
                ...analysis.trust_profile,
                updated_at: new Date().toISOString()
            }, { onConflict: 'content_id,content_type' })

        if (trustError) console.error('[RecomAI] Trust Profile Error:', trustError)

        if (analysis.disciplines?.length > 0) {
            const disciplineInserts = analysis.disciplines.map((d: string, i: number) => ({
                content_id: postId,
                content_type: 'post',
                discipline: d,
                is_primary: i === 0
            }))
            await supabase.from('content_disciplines').upsert(disciplineInserts, { onConflict: 'content_id,content_type,discipline' })
        }

        if (analysis.evidence) {
            await supabase.from('content_evidence').upsert({
                content_id: postId,
                content_type: 'post',
                ...analysis.evidence
            }, { onConflict: 'content_id,content_type' })
        }

        if (analysis.relationships?.length > 0) {
            const relationshipInserts = analysis.relationships.map((r: any) => ({
                source_id: postId,
                source_type: 'post',
                target_id: r.target_id,
                target_type: 'post',
                relationship: r.relationship,
                relationship_detail: r.detail,
                detected_by: 'ai',
                confidence: 0.8
            }))
            await supabase.from('content_relationships').upsert(
                relationshipInserts,
                { onConflict: 'source_id,source_type,target_id,target_type,relationship' }
            )
        }

        console.log(`[RecomAI] ✅ Analysis complete for ${postId}`)
        return analysis

    } catch (error) {
        console.error('[RecomAI] ❌ Error:', error)
        return null
    }
}

/**
 * Get current rate limit status (database-backed)
 */
export async function getRateLimitStatus(): Promise<{ used: number; limit: number; remaining: number }> {
    try {
        const supabase = getSupabase()
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()

        const { count, error } = await supabase
            .from('ai_rate_limits')
            .select('*', { count: 'exact', head: true })
            .eq('action_type', 'recommendation_analysis')
            .gte('executed_at', oneHourAgo)

        if (error) {
            console.error('[RecomAI] Rate limit status check failed:', error)
            return { used: 0, limit: MAX_ANALYSES_PER_HOUR, remaining: MAX_ANALYSES_PER_HOUR }
        }

        const used = count || 0
        return {
            used,
            limit: MAX_ANALYSES_PER_HOUR,
            remaining: Math.max(0, MAX_ANALYSES_PER_HOUR - used)
        }
    } catch (error) {
        console.error('[RecomAI] Rate limit status error:', error)
        return { used: 0, limit: MAX_ANALYSES_PER_HOUR, remaining: MAX_ANALYSES_PER_HOUR }
    }
}
