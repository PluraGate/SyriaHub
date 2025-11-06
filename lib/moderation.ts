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
 * Placeholder for plagiarism detection
 * To be implemented with services like Copyscape, Turnitin API, or custom solution
 */
export async function checkPlagiarism(
  text: string,
  title?: string
): Promise<PlagiarismCheckResult> {
  // TODO: Integrate with plagiarism detection service
  // Options:
  // 1. Copyscape API: https://www.copyscape.com/apidocumentation.php
  // 2. Turnitin API: https://www.turnitin.com/
  // 3. Custom solution using embeddings + similarity search
  // 4. iThenticate API for academic content
  
  console.log('Plagiarism check called for text (length:', text.length, ')')
  
  // For now, return placeholder result
  return {
    isPlagiarized: false,
    similarityScore: 0,
    details: 'Plagiarism detection not yet implemented - feature coming soon',
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
