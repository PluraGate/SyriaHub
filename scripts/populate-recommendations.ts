/**
 * Prime the Recommendation System
 * Analyzes existing published posts to generate trust profiles and relationships.
 * Run with: npx tsx scripts/populate-recommendations.ts
 */

import { config } from 'dotenv'
config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

console.log('Env Check:', {
    url: !!supabaseUrl,
    key: !!supabaseServiceKey,
    openai: !!process.env.OPENAI_API_KEY
})

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function analyzePost(postId: string, title: string, content: string, tags: string[] = []) {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) throw new Error('OPENAI_API_KEY missing')

    console.log(`[RecomAI] Analyzing: ${title}`)

    // Get context
    const { data: recentPosts } = await supabase
        .from('posts')
        .select('id, title, content, tags')
        .eq('status', 'published')
        .neq('id', postId)
        .order('created_at', { ascending: false })
        .limit(10)

    const recentPostsText = recentPosts?.map(p => `ID: ${p.id}\nTitle: ${p.title}\nContent: ${p.content.slice(0, 300)}...`).join('\n\n---\n\n') || 'None.'

    const systemPrompt = `Analyze research content and output JSON:
{
  "trust_profile": { "t1_source_score": 0-100, "t1_institution": "string", "t2_method_score": 0-100, "t2_method_described": bool, "t2_reproducible": bool, "t3_proximity_type": "on_site"|"remote"|"inferred", "t3_proximity_score": 0-100, "t4_conflict_phase": "active_conflict"|..., "t4_is_time_sensitive": bool },
  "disciplines": ["arch", ...],
  "evidence": { "evidence_type": "field_survey"|..., "evidence_tier": "primary"|... },
  "relationships": [ { "target_id": "uuid", "relationship": "contradicts"|"supports"|..., "detail": "string" } ]
}`

    const userPrompt = `POST:\nTitle: ${title}\nContent: ${content}\n\nCONTEXT:\n${recentPostsText}`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
            response_format: { type: 'json_object' }
        })
    })

    if (!response.ok) throw new Error(`API Error: ${response.status}`)
    const data = await response.json()
    const analysis = JSON.parse(data.choices[0].message.content)

    // Store metadata
    await supabase.from('trust_profiles').upsert({ content_id: postId, content_type: 'post', ...analysis.trust_profile })

    if (analysis.disciplines?.length) {
        await supabase.from('content_disciplines').upsert(analysis.disciplines.map((d: any) => ({ content_id: postId, content_type: 'post', discipline: d })))
    }

    if (analysis.evidence) {
        await supabase.from('content_evidence').upsert({ content_id: postId, content_type: 'post', ...analysis.evidence })
    }

    if (analysis.relationships?.length) {
        await supabase.from('content_relationships').upsert(analysis.relationships.map((r: any) => ({
            source_id: postId, source_type: 'post', target_id: r.target_id, target_type: 'post',
            relationship: r.relationship, relationship_detail: r.detail, detected_by: 'ai'
        })))
    }

    return analysis
}

async function main() {
    console.log('🚀 Priming Recommendation System...')
    console.log('='.repeat(50))

    // 1. Fetch all published posts
    const { data: posts, error } = await supabase
        .from('posts')
        .select('id, title, content, tags')
        .eq('status', 'published')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching posts:', error)
        process.exit(1)
    }

    if (!posts || posts.length === 0) {
        console.log('No posts found to process.')
        process.exit(0)
    }

    console.log(`Found ${posts.length} posts to process.`)

    let successCount = 0
    let failCount = 0

    for (let i = 0; i < posts.length; i++) {
        const post = posts[i]
        console.log(`\n[${i + 1}/${posts.length}] Processing: ${post.title}`)

        try {
            const result = await analyzePost(post.id, post.title, post.content, post.tags || [])
            if (result) {
                successCount++
                console.log('✅ Analysis successful')
            } else {
                failCount++
                console.log('❌ Analysis failed')
            }
        } catch (err) {
            failCount++
            console.log('❌ Unexpected error:', err)
        }

        // Add small delay to avoid hitting OpenAI rate limits too hard
        if (i < posts.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000))
        }
    }

    console.log('\n' + '='.repeat(50))
    console.log('🎉 Population Complete!')
    console.log(`✅ Success: ${successCount}`)
    console.log(`❌ Failed: ${failCount}`)
    console.log('='.repeat(50))
}

main().catch(console.error)
