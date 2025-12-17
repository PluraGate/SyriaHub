/**
 * Session Context Manager
 * 
 * Manages session-bounded research context for epistemic recommendations.
 * No long-term persistence - expires when tab closes or user resets.
 */

export interface ResearchTrailItem {
    postId: string
    title: string
    viewedAt: Date
    tags: string[]
}

export interface SessionContext {
    sessionId: string
    researchTrail: ResearchTrailItem[]
    activeFilters: string[]
    createdAt: Date
}

const SESSION_KEY = 'syriahub_research_context'
const ONBOARDING_KEY = 'syriahub_epistemic_onboarding_shown'

/**
 * Generate a unique session ID
 */
function generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Get the current session context from sessionStorage
 */
export function getSessionContext(): SessionContext {
    if (typeof window === 'undefined') {
        return {
            sessionId: generateSessionId(),
            researchTrail: [],
            activeFilters: [],
            createdAt: new Date()
        }
    }

    const stored = sessionStorage.getItem(SESSION_KEY)
    if (stored) {
        try {
            const parsed = JSON.parse(stored)
            return {
                ...parsed,
                createdAt: new Date(parsed.createdAt),
                researchTrail: parsed.researchTrail.map((item: any) => ({
                    ...item,
                    viewedAt: new Date(item.viewedAt)
                }))
            }
        } catch {
            // Invalid data, reset
        }
    }

    // Create new context
    const newContext: SessionContext = {
        sessionId: generateSessionId(),
        researchTrail: [],
        activeFilters: [],
        createdAt: new Date()
    }
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(newContext))
    return newContext
}

/**
 * Add a post to the research trail
 */
export function addToResearchTrail(post: { id: string; title: string; tags: string[] }): void {
    if (typeof window === 'undefined') return

    const context = getSessionContext()

    // Check if already in trail (avoid duplicates)
    if (context.researchTrail.some(item => item.postId === post.id)) {
        // Move to end of trail
        context.researchTrail = context.researchTrail.filter(item => item.postId !== post.id)
    }

    context.researchTrail.push({
        postId: post.id,
        title: post.title,
        viewedAt: new Date(),
        tags: post.tags
    })

    // Limit trail length (keep last 20)
    if (context.researchTrail.length > 20) {
        context.researchTrail = context.researchTrail.slice(-20)
    }

    sessionStorage.setItem(SESSION_KEY, JSON.stringify(context))
}

/**
 * Get post IDs from the current research trail
 */
export function getTrailPostIds(): string[] {
    const context = getSessionContext()
    return context.researchTrail.map(item => item.postId)
}

/**
 * Reset the session context (epistemic reset)
 */
export function resetSessionContext(): void {
    if (typeof window === 'undefined') return

    sessionStorage.removeItem(SESSION_KEY)
}

/**
 * Check if onboarding has been shown this session
 */
export function hasSeenOnboarding(): boolean {
    if (typeof window === 'undefined') return true
    return sessionStorage.getItem(ONBOARDING_KEY) === 'true'
}

/**
 * Mark onboarding as shown
 */
export function markOnboardingShown(): void {
    if (typeof window === 'undefined') return
    sessionStorage.setItem(ONBOARDING_KEY, 'true')
}

/**
 * Get research trail summary for display
 */
export function getTrailSummary(): {
    totalViewed: number
    disciplines: string[]
    sessionDuration: string
} {
    const context = getSessionContext()

    // Extract unique disciplines from tags
    const allTags = context.researchTrail.flatMap(item => item.tags)
    const disciplines = [...new Set(allTags)].slice(0, 5)

    // Calculate session duration
    const now = new Date()
    const duration = now.getTime() - context.createdAt.getTime()
    const minutes = Math.floor(duration / 60000)
    const sessionDuration = minutes < 60
        ? `${minutes}m`
        : `${Math.floor(minutes / 60)}h ${minutes % 60}m`

    return {
        totalViewed: context.researchTrail.length,
        disciplines,
        sessionDuration
    }
}
