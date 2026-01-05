import { NextRequest, NextResponse } from 'next/server'

/**
 * AI Short Title Suggestion API
 * 
 * Uses GPT-4o-mini (~$0.15/1M input tokens) to suggest clean, URL-friendly
 * short titles from user-provided resource titles.
 * 
 * The AI suggests but never decides - users always have final control.
 */

const OPENAI_MODEL = 'gpt-4o-mini'

const SYSTEM_PROMPT = `You are a research librarian helping organize Syrian research archives. 
Your task is to create a short, URL-friendly identifier (slug) from a resource title.

Rules:
1. Output ONLY the slug, nothing else
2. Use lowercase letters, numbers, and hyphens only
3. Maximum 50 characters
4. Remove filler words (the, a, an, of, for, etc.)
5. Remove version indicators (v1, draft, final, copy)
6. Keep the most meaningful 3-5 words
7. Preserve geographic references (damascus, aleppo, idlib)
8. Preserve year if mentioned
9. Use hyphens between words

Examples:
- "The 2024 Humanitarian Aid Distribution Report for Northern Syria (Draft v2)" → "humanitarian-aid-distribution-northern-syria-2024"
- "Survey of Cultural Heritage Sites in Damascus Old City" → "heritage-sites-damascus-old-city"
- "Syrian Population Census Data - Final Copy" → "population-census-data"
- "تقرير المساعدات الإنسانية لعام 2024" → "humanitarian-aid-report-2024"`

export async function POST(request: NextRequest) {
    try {
        const { title, resourceType, discipline } = await request.json()

        if (!title || typeof title !== 'string') {
            return NextResponse.json(
                { error: 'Title is required' },
                { status: 400 }
            )
        }

        // Rate limiting: Check if user is authenticated
        // Note: In production, add proper rate limiting middleware

        const apiKey = process.env.OPENAI_API_KEY
        if (!apiKey) {
            console.error('[SuggestTitle] OPENAI_API_KEY is missing')
            // Fallback to deterministic generation
            return NextResponse.json({
                suggestion: fallbackGenerate(title),
                source: 'fallback'
            })
        }

        // Build context-aware prompt
        const contextHints = []
        if (resourceType) contextHints.push(`Resource type: ${resourceType}`)
        if (discipline) contextHints.push(`Discipline: ${discipline}`)

        const userMessage = contextHints.length > 0
            ? `Title: "${title}"\n${contextHints.join('\n')}`
            : `Title: "${title}"`

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: OPENAI_MODEL,
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    { role: 'user', content: userMessage }
                ],
                max_tokens: 60,
                temperature: 0.3, // Low temperature for consistency
            }),
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error(`[SuggestTitle] OpenAI API Error: ${response.status} ${errorText}`)
            // Fallback on error
            return NextResponse.json({
                suggestion: fallbackGenerate(title),
                source: 'fallback'
            })
        }

        const data = await response.json()
        const suggestion = data.choices?.[0]?.message?.content?.trim()

        if (!suggestion) {
            return NextResponse.json({
                suggestion: fallbackGenerate(title),
                source: 'fallback'
            })
        }

        // Sanitize AI output (safety check)
        const sanitized = sanitizeSlug(suggestion)

        return NextResponse.json({
            suggestion: sanitized,
            source: 'ai'
        })

    } catch (error) {
        console.error('[SuggestTitle] Error:', error)
        return NextResponse.json(
            { error: 'Failed to generate suggestion' },
            { status: 500 }
        )
    }
}

/**
 * Fallback deterministic generation when AI is unavailable
 */
function fallbackGenerate(title: string): string {
    const stopWords = new Set([
        'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
        'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were',
        'draft', 'version', 'v1', 'v2', 'v3', 'final', 'copy', 'updated'
    ])

    const words = title
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s]/gu, ' ')
        .split(/\s+/)
        .filter(word => word.length > 1 && !stopWords.has(word))
        .slice(0, 5)

    return sanitizeSlug(words.join('-'))
}

/**
 * Ensures output is a valid slug
 */
function sanitizeSlug(input: string): string {
    return input
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 50)
}
