/**
 * Resource Slug Generator
 * 
 * Generates canonical, URL-safe slugs for resources following the pattern:
 * [type]-[discipline]-[short-title]-[YYYYMMDD]-[hash6]
 * 
 * Design principles:
 * - Deterministic: Same inputs always produce same output
 * - Immutable: Once generated, slugs never change
 * - Human-readable: Slugs are meaningful to humans
 * - System-safe: UUIDs remain the source of truth
 */

export interface SlugInput {
    /** Resource type: dataset, paper, tool, media, template */
    resourceType: string
    /** Primary discipline/category */
    discipline: string
    /** User-provided or auto-generated short title */
    shortTitle: string
    /** Date of creation (defaults to now) */
    date?: Date
    /** Resource UUID (used to derive hash) */
    uuid: string
}

export interface SlugResult {
    /** Full canonical slug */
    slug: string
    /** Sanitized short title (for storage) */
    shortTitle: string
    /** 6-character hash derived from UUID */
    hash: string
    /** Date string in YYYYMMDD format */
    dateString: string
}

/**
 * Valid resource types
 */
export const VALID_RESOURCE_TYPES = ['dataset', 'paper', 'tool', 'media', 'template'] as const
export type ResourceType = typeof VALID_RESOURCE_TYPES[number]

/**
 * Sanitizes a string for use in a URL slug
 * - Converts to lowercase
 * - Removes special characters (Unicode-safe)
 * - Replaces spaces with dashes
 * - Collapses multiple dashes
 * - Trims to max length
 */
export function sanitizeForSlug(input: string, maxLength: number = 50): string {
    if (!input || typeof input !== 'string') return ''

    return input
        .toLowerCase()
        .normalize('NFD')                           // Decompose Unicode
        .replace(/[\u0300-\u036f]/g, '')             // Remove diacritics
        .replace(/[^\p{L}\p{N}\s-]/gu, '')           // Keep letters, numbers, spaces, dashes
        .trim()
        .replace(/\s+/g, '-')                        // Spaces to dashes
        .replace(/-+/g, '-')                         // Collapse multiple dashes
        .substring(0, maxLength)
        .replace(/^-+|-+$/g, '')                     // Trim leading/trailing dashes
}

/**
 * Generates a short title from a longer title
 * Uses deterministic heuristics to create a clean, readable identifier
 */
export function generateShortTitle(userTitle: string): string {
    if (!userTitle || typeof userTitle !== 'string') return ''

    // Common words to remove for brevity
    const stopWords = new Set([
        'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
        'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
        'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
        'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need',
        'draft', 'version', 'v1', 'v2', 'v3', 'final', 'copy', 'updated'
    ])

    // Split into words, filter, and rejoin
    const words = userTitle
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s]/gu, ' ')  // Replace special chars with spaces
        .split(/\s+/)
        .filter(word => word.length > 1 && !stopWords.has(word))
        .slice(0, 6)  // Max 6 meaningful words

    return sanitizeForSlug(words.join(' '), 50)
}

/**
 * Extracts a 6-character hash from a UUID
 * Uses the last 6 characters (most unique part of UUID)
 */
export function extractHashFromUUID(uuid: string): string {
    if (!uuid || typeof uuid !== 'string') {
        throw new Error('UUID is required for hash generation')
    }

    // Remove dashes and take last 6 characters
    const cleaned = uuid.replace(/-/g, '')

    if (cleaned.length < 6) {
        throw new Error('Invalid UUID format')
    }

    return cleaned.slice(-6).toLowerCase()
}

/**
 * Formats a date as YYYYMMDD
 */
export function formatDateForSlug(date: Date = new Date()): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}${month}${day}`
}

/**
 * Validates a resource type
 */
export function isValidResourceType(type: string): type is ResourceType {
    return VALID_RESOURCE_TYPES.includes(type as ResourceType)
}

/**
 * Sanitizes a discipline string for use in slug
 */
export function sanitizeDiscipline(discipline: string): string {
    if (!discipline || typeof discipline !== 'string') return 'general'

    // Map common discipline variations to canonical forms
    const disciplineMap: Record<string, string> = {
        'cultural heritage': 'heritage',
        'cultural-heritage': 'heritage',
        'legal': 'law',
        'legal studies': 'law',
        'human rights': 'rights',
        'human-rights': 'rights',
        'urban planning': 'urban',
        'urban-planning': 'urban',
        'data science': 'data',
        'data-science': 'data',
        'public health': 'health',
        'public-health': 'health',
        'political science': 'politics',
        'political-science': 'politics',
        'environmental science': 'environment',
        'environmental-science': 'environment',
    }

    const lower = discipline.toLowerCase()
    const mapped = disciplineMap[lower] || lower

    return sanitizeForSlug(mapped, 20)
}

/**
 * Generates a complete resource slug
 * 
 * Format: [type]-[discipline]-[short-title]-[YYYYMMDD]-[hash6]
 * 
 * @example
 * generateResourceSlug({
 *   resourceType: 'dataset',
 *   discipline: 'Heritage',
 *   shortTitle: 'Damascus Population Survey',
 *   uuid: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
 * })
 * // Returns: { slug: 'dataset-heritage-damascus-population-survey-20260105-567890', ... }
 */
export function generateResourceSlug(input: SlugInput): SlugResult {
    const { resourceType, discipline, shortTitle, date = new Date(), uuid } = input

    // Validate resource type
    const type = isValidResourceType(resourceType) ? resourceType : 'resource'

    // Sanitize components
    const sanitizedDiscipline = sanitizeDiscipline(discipline)
    const sanitizedShortTitle = sanitizeForSlug(shortTitle, 50) || generateShortTitle(shortTitle)
    const dateString = formatDateForSlug(date)
    const hash = extractHashFromUUID(uuid)

    // Build slug
    const parts = [type, sanitizedDiscipline, sanitizedShortTitle, dateString, hash]
        .filter(Boolean)

    const slug = parts.join('-')

    return {
        slug,
        shortTitle: sanitizedShortTitle,
        hash,
        dateString
    }
}

/**
 * Validates a slug format
 * Returns true if the slug follows the expected pattern
 */
export function isValidSlug(slug: string): boolean {
    if (!slug || typeof slug !== 'string') return false

    // Pattern: type-discipline-title-YYYYMMDD-hash6
    const pattern = /^[a-z]+-[a-z]+-[a-z0-9-]+-\d{8}-[a-f0-9]{6}$/
    return pattern.test(slug)
}

/**
 * Parses a slug into its components
 * Returns null if the slug is invalid
 */
export function parseSlug(slug: string): {
    type: string
    discipline: string
    shortTitle: string
    date: string
    hash: string
} | null {
    if (!isValidSlug(slug)) return null

    const parts = slug.split('-')
    const hash = parts.pop()!
    const date = parts.pop()!
    const type = parts.shift()!
    const discipline = parts.shift()!
    const shortTitle = parts.join('-')

    return { type, discipline, shortTitle, date, hash }
}
