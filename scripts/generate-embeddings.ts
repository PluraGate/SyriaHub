/**
 * Generate embeddings for existing posts
 * Run with: npx tsx scripts/generate-embeddings.ts
 */

import { config } from 'dotenv'
config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

// Initialize clients
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})

interface Post {
    id: string
    title: string
    content: string
    tags: string[] | null
    created_at: string
}

async function generateEmbedding(text: string): Promise<number[]> {
    const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text.slice(0, 8000) // Limit to avoid token limits
    })
    return response.data[0].embedding
}

async function processPost(post: Post): Promise<boolean> {
    try {
        // Create embedding text: title + content + tags
        const embeddingText = [
            post.title,
            post.content,
            post.tags?.join(' ') || ''
        ].join('\n\n')

        // Generate embedding
        const embedding = await generateEmbedding(embeddingText)

        // Store in database
        const { error } = await supabase
            .from('content_embeddings')
            .upsert({
                content_id: post.id,
                content_type: 'post',
                embedding: `[${embedding.join(',')}]`,
                embedded_text: embeddingText.slice(0, 5000),
                embedding_model: 'text-embedding-3-small',
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'content_id,content_type'
            })

        if (error) {
            console.error(`Error storing embedding for ${post.id}:`, error)
            return false
        }

        return true
    } catch (error) {
        console.error(`Error processing post ${post.id}:`, error)
        return false
    }
}

async function createTrustProfile(post: Post): Promise<void> {
    // Create a basic trust profile for existing posts
    const { error } = await supabase
        .from('trust_profiles')
        .upsert({
            content_id: post.id,
            content_type: 'post',
            // Default scores
            t1_source_score: 50,
            t1_author_known: true,
            t2_method_score: 50,
            t3_proximity_score: 30, // Assume remote/inferred
            t3_proximity_type: 'inferred',
            t4_temporal_score: calculateTemporalScore(post.created_at),
            t4_data_timestamp: post.created_at,
            t5_validation_score: 50,
            updated_at: new Date().toISOString()
        }, {
            onConflict: 'content_id,content_type'
        })

    if (error) {
        console.error(`Error creating trust profile for ${post.id}:`, error)
    }
}

function calculateTemporalScore(createdAt: string): number {
    const now = new Date()
    const created = new Date(createdAt)
    const daysSince = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)

    if (daysSince < 30) return 100
    if (daysSince < 90) return 80
    if (daysSince < 180) return 70
    if (daysSince < 365) return 60
    if (daysSince < 730) return 40
    return 30
}

async function main() {
    console.log('🚀 Starting embedding generation...')
    console.log('='.repeat(50))

    // Fetch all published posts
    const { data: posts, error } = await supabase
        .from('posts')
        .select('id, title, content, tags, created_at')
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

    console.log(`Found ${posts.length} posts to process.\n`)

    let successCount = 0
    let failCount = 0

    for (let i = 0; i < posts.length; i++) {
        const post = posts[i]
        const progress = `[${i + 1}/${posts.length}]`

        process.stdout.write(`${progress} Processing "${post.title.slice(0, 40)}..."`)

        // Generate embedding
        const success = await processPost(post)

        // Create trust profile
        await createTrustProfile(post)

        if (success) {
            successCount++
            console.log(' ✅')
        } else {
            failCount++
            console.log(' ❌')
        }

        // Rate limiting: 60 requests per minute for OpenAI
        if (i < posts.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1100))
        }
    }

    console.log('\n' + '='.repeat(50))
    console.log(`✅ Successfully processed: ${successCount}`)
    console.log(`❌ Failed: ${failCount}`)
    console.log('🎉 Embedding generation complete!')
}

main().catch(console.error)
