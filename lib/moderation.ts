/**
 * Content Moderation Module
 * Integrates AI-powered moderation using OpenAI Moderation API
 * with fallback to manual review for edge cases
 */

export interface ModerationResult {
  flagged: boolean
  categories: {
    hate?: boolean
    'hate/threatening'?: boolean
    harassment?: boolean
    'harassment/threatening'?: boolean
    'self-harm'?: boolean
    'self-harm/intent'?: boolean
    'self-harm/instructions'?: boolean
    sexual?: boolean
    'sexual/minors'?: boolean
    violence?: boolean
    'violence/graphic'?: boolean
  }
  categoryScores: {
    hate?: number
    'hate/threatening'?: number
    harassment?: number
    'harassment/threatening'?: number
    'self-harm'?: number
    'self-harm/intent'?: number
    'self-harm/instructions'?: number
    sexual?: number
    'sexual/minors'?: number
    violence?: number
    'violence/graphic'?: number
  }
  details?: string[]
}

export interface PlagiarismCheckResult {
  isPlagiarized: boolean
  similarityScore: number
  sources?: string[]
  details?: string
}

/**
 * Check content using OpenAI Moderation API
 */
export async function moderateContentWithOpenAI(
  text: string
): Promise<ModerationResult> {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    console.warn('OpenAI API key not configured, skipping AI moderation')
    return {
      flagged: false,
      categories: {},
      categoryScores: {},
      details: ['AI moderation disabled - API key not configured'],
    }
  }

  try {
    const response = await fetch('https://api.openai.com/v1/moderations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        input: text,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const data = await response.json()
    const result = data.results[0]

    return {
      flagged: result.flagged,
      categories: result.categories,
      categoryScores: result.category_scores,
      details: result.flagged
        ? Object.entries(result.categories)
          .filter(([_, flagged]) => flagged)
          .map(([category]) => category)
        : undefined,
    }
  } catch (error) {
    console.error('OpenAI moderation error:', error)
    // Fail open - don't block content if moderation service is down
    return {
      flagged: false,
      categories: {},
      categoryScores: {},
      details: ['Moderation service error - content allowed by default'],
    }
  }
}

/**
 * Check content using Perspective API (Google)
 * This is a fallback/alternative to OpenAI
 */
export async function moderateContentWithPerspective(
  text: string
): Promise<ModerationResult> {
  const apiKey = process.env.PERSPECTIVE_API_KEY

  if (!apiKey) {
    console.warn('Perspective API key not configured, skipping moderation')
    return {
      flagged: false,
      categories: {},
      categoryScores: {},
      details: ['Perspective API disabled - API key not configured'],
    }
  }

  try {
    const response = await fetch(
      `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comment: { text },
          requestedAttributes: {
            TOXICITY: {},
            SEVERE_TOXICITY: {},
            IDENTITY_ATTACK: {},
            INSULT: {},
            PROFANITY: {},
            THREAT: {},
          },
        }),
      }
    )

    if (!response.ok) {
      throw new Error(`Perspective API error: ${response.statusText}`)
    }

    const data = await response.json()
    const attributes = data.attributeScores

    // Convert Perspective scores to OpenAI-like format
    const toxicityScore = attributes.TOXICITY?.summaryScore?.value || 0
    const severeToxicityScore =
      attributes.SEVERE_TOXICITY?.summaryScore?.value || 0
    const threatScore = attributes.THREAT?.summaryScore?.value || 0
    const identityAttackScore =
      attributes.IDENTITY_ATTACK?.summaryScore?.value || 0

    // Flag if any score is above threshold (0.7 is commonly used)
    const threshold = 0.7
    const flagged =
      toxicityScore > threshold ||
      severeToxicityScore > threshold ||
      threatScore > threshold ||
      identityAttackScore > threshold

    return {
      flagged,
      categories: {
        harassment: toxicityScore > threshold,
        'harassment/threatening': severeToxicityScore > threshold,
        violence: threatScore > threshold,
        hate: identityAttackScore > threshold,
      },
      categoryScores: {
        harassment: toxicityScore,
        'harassment/threatening': severeToxicityScore,
        violence: threatScore,
        hate: identityAttackScore,
      },
      details: flagged
        ? [
          toxicityScore > threshold && 'Toxic language detected',
          severeToxicityScore > threshold && 'Severe toxicity detected',
          threatScore > threshold && 'Threatening content detected',
          identityAttackScore > threshold && 'Identity attack detected',
        ].filter(Boolean) as string[]
        : undefined,
    }
  } catch (error) {
    console.error('Perspective API error:', error)
    return {
      flagged: false,
      categories: {},
      categoryScores: {},
      details: ['Perspective API error - content allowed by default'],
    }
  }
}

/**
 * Main moderation function - tries OpenAI first, falls back to Perspective
 */
export async function moderateContent(
  text: string
): Promise<ModerationResult> {
  // Try OpenAI first (more comprehensive)
  const openAIResult = await moderateContentWithOpenAI(text)

  // If OpenAI is configured and returned a result, use it
  if (openAIResult.details?.[0] !== 'AI moderation disabled - API key not configured') {
    return openAIResult
  }

  // Otherwise try Perspective API
  const perspectiveResult = await moderateContentWithPerspective(text)

  // If Perspective is configured, use it
  if (perspectiveResult.details?.[0] !== 'Perspective API disabled - API key not configured') {
    return perspectiveResult
  }

  // If neither is configured, return safe default
  return {
    flagged: false,
    categories: {},
    categoryScores: {},
    details: ['No moderation APIs configured - content allowed by default'],
  }
}

/**
 * Generate a human-readable warning message based on moderation results
 */
export function generateModerationWarning(result: ModerationResult): string {
  if (!result.flagged) {
    return ''
  }

  const flaggedCategories = result.details || []

  if (flaggedCategories.length === 0) {
    return 'Your content may violate community guidelines.'
  }

  const categoryNames = flaggedCategories.map((cat) => {
    // Convert category names to human-readable format
    return cat
      .split('/')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' / ')
  })

  return `Your content was flagged for: ${categoryNames.join(', ')}. Please review our community guidelines and ensure your content is respectful and appropriate.`
}

/**
 * Semantic Plagiarism Detection
 * Uses pgvector embeddings to find similar content, then uses AI only for high-match cases
 */
export async function checkPlagiarism(
  text: string,
  title?: string
): Promise<PlagiarismCheckResult> {
  // Skip very short content
  if (text.length < 100) {
    return { isPlagiarized: false, similarityScore: 0, details: 'Content too short for plagiarism check' }
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    console.warn('[Plagiarism] OpenAI API key not configured, skipping check')
    return { isPlagiarized: false, similarityScore: 0, details: 'Plagiarism API not configured' }
  }

  try {
    // 1. Generate embedding for the new content
    const embeddingText = `${title || ''}\n\n${text}`.slice(0, 8000)
    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({ model: 'text-embedding-3-small', input: embeddingText })
    })

    if (!embeddingResponse.ok) {
      console.error('[Plagiarism] Embedding generation failed')
      return { isPlagiarized: false, similarityScore: 0, details: 'Embedding generation failed' }
    }

    const embeddingData = await embeddingResponse.json()
    const embedding = embeddingData.data[0].embedding

    // 2. Search for similar content in database using pgvector
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return { isPlagiarized: false, similarityScore: 0, details: 'Database not configured' }
    }

    // Call the RPC for similarity matching
    const rpcResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/match_content_embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({
        query_embedding: `[${embedding.join(',')}]`,
        match_threshold: 0.7, // Only consider 70%+ similar content
        match_count: 3
      })
    })

    if (!rpcResponse.ok) {
      console.warn('[Plagiarism] Similarity search failed, RPC may not be deployed')
      return { isPlagiarized: false, similarityScore: 0, details: 'Similarity search unavailable' }
    }

    const matches = await rpcResponse.json()

    if (!matches || matches.length === 0) {
      return { isPlagiarized: false, similarityScore: 0, details: 'No similar content found' }
    }

    // 3. Get the highest similarity score
    const topMatch = matches[0]
    const similarityScore = topMatch.similarity

    // If similarity is high (>85%), use AI to confirm if it's actually plagiarism
    if (similarityScore > 0.85) {
      const aiCheckResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are a plagiarism detector. Compare the two texts and determine if the NEW text is plagiarized from the EXISTING text. Consider: direct copying, paraphrasing without attribution, and structural similarity. Respond with JSON: {"isPlagiarized": boolean, "reason": "string"}' },
            { role: 'user', content: `EXISTING TEXT:\n${topMatch.embedded_text?.slice(0, 2000) || 'N/A'}\n\nNEW TEXT:\n${text.slice(0, 2000)}` }
          ],
          response_format: { type: 'json_object' },
          max_tokens: 200
        })
      })

      if (aiCheckResponse.ok) {
        const aiData = await aiCheckResponse.json()
        const aiResult = JSON.parse(aiData.choices[0].message.content || '{}')
        return {
          isPlagiarized: aiResult.isPlagiarized || false,
          similarityScore,
          sources: [topMatch.content_id],
          details: aiResult.reason || `${Math.round(similarityScore * 100)}% similar to existing content`
        }
      }
    }

    // For moderate similarity (70-85%), flag but don't block
    return {
      isPlagiarized: similarityScore > 0.9, // Only consider >90% as definite plagiarism
      similarityScore,
      sources: matches.map((m: any) => m.content_id),
      details: `${Math.round(similarityScore * 100)}% similar to existing research content`
    }

  } catch (error) {
    console.error('[Plagiarism] Check failed:', error)
    return { isPlagiarized: false, similarityScore: 0, details: 'Plagiarism check encountered an error' }
  }
}


/**
 * Comprehensive content check - runs both moderation and plagiarism detection
 */
export async function checkContent(
  text: string,
  title?: string
): Promise<{
  moderation: ModerationResult
  plagiarism: PlagiarismCheckResult
  shouldBlock: boolean
  warnings: string[]
}> {
  const [moderation, plagiarism] = await Promise.all([
    moderateContent(text),
    checkPlagiarism(text, title),
  ])

  const warnings: string[] = []

  if (moderation.flagged) {
    warnings.push(generateModerationWarning(moderation))
  }

  if (plagiarism.isPlagiarized) {
    warnings.push(
      `Potential plagiarism detected (${Math.round(plagiarism.similarityScore * 100)}% similarity). Please ensure you properly cite all sources.`
    )
  }

  // Block content if moderation flagged OR high plagiarism score
  const shouldBlock = moderation.flagged || plagiarism.similarityScore > 0.8

  return {
    moderation,
    plagiarism,
    shouldBlock,
    warnings,
  }
}
