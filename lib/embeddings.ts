import { createClient } from '@supabase/supabase-js'

/**
 * Shared Embedding Utility for SyriaHub
 * Handles generation and storage of content embeddings
 */

const getSupabase = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) throw new Error('Supabase credentials missing')
    return createClient(url, key)
}

/**
 * Generate an embedding for a given text using OpenAI
 */
export async function generateEmbedding(text: string): Promise<number[]> {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) throw new Error('OPENAI_API_KEY is missing')

    const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'text-embedding-3-small',
            input: text.slice(0, 8000) // OpenAI limit
        })
    })

    if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`OpenAI Embedding Error: ${response.status} ${errorText}`)
    }

    const data = await response.json()
    return data.data[0].embedding
}

/**
 * Calculate similarity between new content and existing database content
 */
export async function findSimilarContent(embedding: number[], options: { limit?: number, threshold?: number } = {}) {
    const supabase = getSupabase()
    const { limit = 5, threshold = 0.5 } = options

    // Using pgvector cosine similarity (<=> is cosine distance, so 1 - distance is similarity)
    // We expect a stored procedure or can use raw RPC if implemented
    const { data, error } = await supabase.rpc('match_content_embeddings', {
        query_embedding: `[${embedding.join(',')}]`,
        match_threshold: threshold,
        match_count: limit
    })

    if (error) {
        console.error('[Embeddings] Similarity Search Error:', error)
        return []
    }

    return data || []
}

/**
 * Store an embedding for a piece of content
 */
export async function storeContentEmbedding(postId: string, title: string, content: string, tags: string[] = []) {
    const supabase = getSupabase()
    const embeddingText = `${title}\n\n${content}\n\n${tags.join(' ')}`

    try {
        const embedding = await generateEmbedding(embeddingText)

        const { error } = await supabase
            .from('content_embeddings')
            .upsert({
                content_id: postId,
                content_type: 'post',
                embedding: `[${embedding.join(',')}]`,
                embedded_text: embeddingText.slice(0, 5000),
                embedding_model: 'text-embedding-3-small',
                updated_at: new Date().toISOString()
            }, { onConflict: 'content_id,content_type' })

        if (error) throw error
        return true
    } catch (err) {
        console.error('[Embeddings] Failed to store embedding:', err)
        return false
    }
}
