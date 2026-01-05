/**
 * Pattern Detection Engine
 * 
 * Implements spatial patterns with confidence scoring.
 * Patterns suggest questions, not answers.
 */

import {
    Point,
    Polygon,
    GovernorateFeature,
    haversineDistance,
    findSpanningGovernorates,
    temporalRelevance,
    calculateBbox,
    pointInPolygon
} from '@/lib/spatialQueries'

// Pattern IDs following the spec
export type PatternId = 'P1' | 'P2' | 'P3' | 'P4' | 'P5'

// Pattern detection result
export interface DetectedPattern {
    id: PatternId
    name: string
    name_ar: string
    message: string      // Plain language, uses "may/could"
    message_ar: string
    confidence: number
    metadata?: Record<string, unknown>
}

// Pattern configuration
interface PatternConfig {
    id: PatternId
    name: string
    name_ar: string
    message: string
    message_ar: string
    enabled: boolean
}

// Pattern definitions - plain language, no jargon
const PATTERNS: Record<PatternId, PatternConfig> = {
    P1: {
        id: 'P1',
        name: 'Network bottleneck',
        name_ar: 'اختناق الشبكة',
        message: 'This area may have limited route access',
        message_ar: 'قد تكون هذه المنطقة ذات وصول محدود للطرق',
        enabled: true // Uses OSM Overpass API
    },
    P2: {
        id: 'P2',
        name: 'Service coverage question',
        name_ar: 'سؤال حول تغطية الخدمات',
        message: 'Service availability in this governorate could warrant further inquiry',
        message_ar: 'قد يستدعي توفر الخدمات في هذه المحافظة مزيداً من البحث',
        enabled: true // Enabled with conservative detection
    },
    P3: {
        id: 'P3',
        name: 'Cross-boundary',
        name_ar: 'عبر الحدود الإدارية',
        message: 'This region spans multiple administrative areas',
        message_ar: 'تمتد هذه المنطقة عبر مناطق إدارية متعددة',
        enabled: true // First to implement
    },
    P4: {
        id: 'P4',
        name: 'Access discontinuity',
        name_ar: 'انقطاع الوصول',
        message: 'Administrative boundaries may not reflect physical access patterns',
        message_ar: 'قد لا تعكس الحدود الإدارية أنماط الوصول الفعلي',
        enabled: true // Second to implement
    },
    P5: {
        id: 'P5',
        name: 'Aid activity pattern',
        name_ar: 'نمط نشاط المساعدات',
        message: 'This area could benefit from reviewing aid coverage patterns',
        message_ar: 'قد تستفيد هذه المنطقة من مراجعة أنماط تغطية المساعدات',
        enabled: true // Uses SyriaHub post data
    }
}

// Confidence calculation inputs
interface ConfidenceInputs {
    patternMatch: boolean  // Binary: detected or not (0 or 1)
    dataCompleteness: number  // 0-1: how complete is the required data
    temporalRelevance: number  // 0-1: how current is the data
    sourceTrust: number  // 0-1: normalized trust score of sources
}

// Confidence threshold - below this, return nothing (silent)
const CONFIDENCE_THRESHOLD = 0.6

/**
 * Calculate confidence score
 * Weights: pattern_match 40%, data_completeness 30%, temporal_relevance 20%, source_trust 10%
 */
export function calculateConfidence(inputs: ConfidenceInputs): number {
    const patternScore = inputs.patternMatch ? 1 : 0 // Binary, no soft matches

    return (
        patternScore * 0.4 +
        inputs.dataCompleteness * 0.3 +
        inputs.temporalRelevance * 0.2 +
        inputs.sourceTrust * 0.1
    )
}

/**
 * Detect P3: Boundary spill-over
 * Deterministic, low data dependency
 */
export function detectBoundarySpillover(
    geometry: { type: string; coordinates: number[] | number[][] | number[][][] },
    governorates: GovernorateFeature[],
    temporalDate?: Date | string | null
): DetectedPattern | null {
    const config = PATTERNS.P3
    if (!config.enabled) return null

    // Guard against malformed inputs
    if (!geometry || typeof geometry !== 'object' || !geometry.type || !geometry.coordinates) {
        return null
    }

    const spanningGovs = findSpanningGovernorates(geometry, governorates)

    // Pattern detected if geometry spans 2+ governorates
    const patternMatch = spanningGovs.length >= 2

    if (!patternMatch) return null

    const confidence = calculateConfidence({
        patternMatch: true,
        dataCompleteness: governorates.length > 0 ? 1 : 0,
        temporalRelevance: temporalRelevance(temporalDate || null),
        sourceTrust: 0.8 // OSM admin boundaries are reasonably trusted
    })

    if (confidence < CONFIDENCE_THRESHOLD) return null

    return {
        id: config.id,
        name: config.name,
        name_ar: config.name_ar,
        message: config.message,
        message_ar: config.message_ar,
        confidence,
        metadata: {
            governorates: spanningGovs
        }
    }
}

/**
 * Detect P4: Access discontinuity
 * Checks if distance to admin center differs significantly from nearest access point
 */
export function detectAccessDiscontinuity(
    point: Point,
    governorates: GovernorateFeature[],
    temporalDate?: Date | string | null
): DetectedPattern | null {
    const config = PATTERNS.P4
    if (!config.enabled) return null

    // Find the containing governorate
    let containingGov: GovernorateFeature | null = null
    let minDistance = Infinity

    for (const gov of governorates) {
        if (!gov.geometry) continue
        if (gov.geometry.type === 'Point' && Array.isArray(gov.geometry.coordinates) && gov.geometry.coordinates.length >= 2) {
            const coords = gov.geometry.coordinates as any[]
            const govCenter: Point = {
                lng: coords[0],
                lat: coords[1]
            }
            const dist = haversineDistance(point, govCenter)
            if (dist < minDistance) {
                minDistance = dist
                containingGov = gov
            }
        }
    }

    if (!containingGov) return null

    // Pattern detected if point is far from its governorate center (>50km)
    // but close to another governorate center (<30km)
    let closerToOther = false
    const NEAR_THRESHOLD = 30 // km
    const FAR_THRESHOLD = 50 // km

    for (const gov of governorates) {
        if (gov.name === containingGov.name) continue
        if (!gov.geometry) continue
        if (gov.geometry.type === 'Point' && Array.isArray(gov.geometry.coordinates) && gov.geometry.coordinates.length >= 2) {
            const coords = gov.geometry.coordinates as any[]
            const govCenter: Point = {
                lng: coords[0],
                lat: coords[1]
            }
            const dist = haversineDistance(point, govCenter)
            if (dist < NEAR_THRESHOLD && minDistance > FAR_THRESHOLD) {
                closerToOther = true
                break
            }
        }
    }

    if (!closerToOther) return null

    const confidence = calculateConfidence({
        patternMatch: true,
        dataCompleteness: 0.8, // We have basic admin data
        temporalRelevance: temporalRelevance(temporalDate || null),
        sourceTrust: 0.7
    })

    if (confidence < CONFIDENCE_THRESHOLD) return null

    return {
        id: config.id,
        name: config.name,
        name_ar: config.name_ar,
        message: config.message,
        message_ar: config.message_ar,
        confidence,
        metadata: {
            distanceToAssignedCenter: minDistance,
            nearestGovernorate: containingGov.name
        }
    }
}

// Large governorates by area (km²) - may have service coverage questions
// These are governorates known for large rural areas
const LARGE_GOVERNORATES = new Set([
    'Deir-ez-Zor',    // ~33,060 km²
    'Al-Hasakeh',     // ~23,334 km²
    'Homs',           // ~42,223 km²
    'Ar-Raqqa',       // ~19,616 km²
    'Rural Damascus'  // ~18,032 km²
])

/**
 * Detect P2: Service coverage question
 * Conservative detection - only flags points in large, sparse governorates
 * Framing: suggests inquiry, not conclusion
 */
export function detectServiceCoverageQuestion(
    point: Point,
    governorates: GovernorateFeature[],
    temporalDate?: Date | string | null
): DetectedPattern | null {
    const config = PATTERNS.P2
    if (!config.enabled) return null

    // Find which governorate contains this point (using centroid proximity as fallback)
    let containingGov: GovernorateFeature | null = null
    let minDistance = Infinity

    for (const gov of governorates) {
        // Guard against malformed governorate data
        if (!gov.geometry) continue
        // For polygon geometries, check containment
        if (gov.geometry.type === 'Polygon') {
            const polygon: Polygon = {
                coordinates: gov.geometry.coordinates as number[][][],
                bbox: calculateBbox(gov.geometry.coordinates as number[][][])
            }
            if (pointInPolygon(point, polygon)) {
                containingGov = gov
                break
            }
        }
        // Fallback: use centroid distance for point geometries
        if (gov.geometry.type === 'Point' && Array.isArray(gov.geometry.coordinates) && gov.geometry.coordinates.length >= 2) {
            const coords = gov.geometry.coordinates as any[]
            const govCenter: Point = {
                lng: coords[0],
                lat: coords[1]
            }
            const dist = haversineDistance(point, govCenter)
            if (dist < minDistance) {
                minDistance = dist
                containingGov = gov
            }
        }
    }

    if (!containingGov) return null

    // Only flag if point is in a known large governorate
    const isLargeGovernorate = LARGE_GOVERNORATES.has(containingGov.name)

    if (!isLargeGovernorate) return null

    const confidence = calculateConfidence({
        patternMatch: true,
        dataCompleteness: 0.6, // We don't have actual POI data yet
        temporalRelevance: temporalRelevance(temporalDate || null),
        sourceTrust: 0.6 // Conservative - this is heuristic-based
    })

    if (confidence < CONFIDENCE_THRESHOLD) return null

    return {
        id: config.id,
        name: config.name,
        name_ar: config.name_ar,
        message: config.message,
        message_ar: config.message_ar,
        confidence,
        metadata: {
            governorate: containingGov.name,
            reason: 'large_governorate'
        }
    }
}

/**
 * Run all enabled pattern detectors
 */
export function detectPatterns(
    geometry: { type: string; coordinates: number[] | number[][] | number[][][] } | null,
    governorates: GovernorateFeature[],
    temporalDate?: Date | string | null
): DetectedPattern[] {
    if (!geometry) return []

    const detected: DetectedPattern[] = []

    // P3: Boundary spill-over
    const p3 = detectBoundarySpillover(geometry, governorates, temporalDate)
    if (p3) detected.push(p3)

    // P4: Access discontinuity (only for point geometries)
    if (geometry.type === 'Point' && Array.isArray(geometry.coordinates) && geometry.coordinates.length >= 2) {
        const coords = geometry.coordinates as any[]
        const point: Point = {
            lng: coords[0],
            lat: coords[1]
        }
        const p4 = detectAccessDiscontinuity(point, governorates, temporalDate)
        if (p4) detected.push(p4)

        // P2: Service coverage question (only for point geometries)
        const p2 = detectServiceCoverageQuestion(point, governorates, temporalDate)
        if (p2) detected.push(p2)
    }

    // Sort by confidence (highest first)
    return detected.sort((a, b) => b.confidence - a.confidence)
}

/**
 * Detect P1: Network bottleneck (async - requires Overpass API)
 * Checks road network connectivity around a point
 */
export async function detectNetworkBottleneck(
    point: Point,
    temporalDate?: Date | string | null
): Promise<DetectedPattern | null> {
    const config = PATTERNS.P1
    if (!config.enabled) return null

    try {
        // Dynamic import to avoid bundling issues on server
        const { analyzeRoadNetwork } = await import('@/lib/overpassClient')
        const analysis = await analyzeRoadNetwork(point.lat, point.lng, 15)

        if (!analysis.hasLimitedAccess) return null

        const confidence = calculateConfidence({
            patternMatch: true,
            dataCompleteness: analysis.roadCount > 0 ? 0.9 : 0.5,
            temporalRelevance: temporalRelevance(temporalDate || null),
            sourceTrust: 0.85 // OSM data is well-trusted
        })

        if (confidence < CONFIDENCE_THRESHOLD) return null

        return {
            id: config.id,
            name: config.name,
            name_ar: config.name_ar,
            message: config.message,
            message_ar: config.message_ar,
            confidence,
            metadata: {
                roadCount: analysis.roadCount,
                primaryRoads: analysis.primaryRoads,
                totalLengthKm: analysis.totalLengthKm
            }
        }
    } catch (error) {
        console.error('P1 detection failed:', error)
        return null
    }
}

// Humanitarian-related keywords for P5 detection
const HUMANITARIAN_KEYWORDS = [
    'aid', 'humanitarian', 'relief', 'refugee', 'displacement',
    'food', 'shelter', 'medical', 'health', 'assistance',
    'ngo', 'un', 'unhcr', 'unicef', 'wfp', 'icrc'
]

/**
 * Detect P5: Aid activity pattern (async - queries SyriaHub posts)
 * Checks for humanitarian content concentration in an area
 */
export async function detectAidActivityPattern(
    point: Point,
    postCount: number,
    hasHumanitarianPosts: boolean,
    temporalDate?: Date | string | null
): Promise<DetectedPattern | null> {
    const config = PATTERNS.P5
    if (!config.enabled) return null

    // Pattern detected if area has few or no humanitarian posts
    // but is in a known underserved region
    const isUnderserved = !hasHumanitarianPosts && postCount < 5

    if (!isUnderserved) return null

    const confidence = calculateConfidence({
        patternMatch: true,
        dataCompleteness: 0.7, // Based on available post data
        temporalRelevance: temporalRelevance(temporalDate || null),
        sourceTrust: 0.75 // Internal data
    })

    if (confidence < CONFIDENCE_THRESHOLD) return null

    return {
        id: config.id,
        name: config.name,
        name_ar: config.name_ar,
        message: config.message,
        message_ar: config.message_ar,
        confidence,
        metadata: {
            postCount,
            hasHumanitarianContent: hasHumanitarianPosts
        }
    }
}

/**
 * Check if text contains humanitarian keywords
 */
export function containsHumanitarianKeywords(text: string): boolean {
    const lowerText = text.toLowerCase()
    return HUMANITARIAN_KEYWORDS.some(kw => lowerText.includes(kw))
}

/**
 * Run async pattern detectors (P1, P5) 
 * These require API calls and should be called separately from sync detection
 */
export async function detectPatternsAsync(
    geometry: { type: string; coordinates: number[] | number[][] | number[][][] } | null,
    postCount: number = 0,
    hasHumanitarianPosts: boolean = false,
    temporalDate?: Date | string | null
): Promise<DetectedPattern[]> {
    if (!geometry) return []
    if (geometry.type === 'Point' && Array.isArray(geometry.coordinates) && geometry.coordinates.length >= 2) {
        const coords = geometry.coordinates as any[]
        const point: Point = {
            lng: coords[0],
            lat: coords[1]
        }
        const detected: DetectedPattern[] = []

        // P1: Network bottleneck (async)
        try {
            const p1 = await detectNetworkBottleneck(point, temporalDate)
            if (p1) detected.push(p1)
        } catch (e) {
            console.error('P1 detection error:', e)
        }

        // P5: Aid activity pattern
        const p5 = await detectAidActivityPattern(point, postCount, hasHumanitarianPosts, temporalDate)
        if (p5) detected.push(p5)

        return detected.sort((a, b) => b.confidence - a.confidence)
    }

    return []
}

/**
 * Get pattern by ID (for translations)
 */
export function getPatternConfig(id: PatternId): PatternConfig | undefined {
    return PATTERNS[id]
}

/**
 * Check if any patterns are enabled
 */
export function hasEnabledPatterns(): boolean {
    return Object.values(PATTERNS).some(p => p.enabled)
}

/**
 * Get list of humanitarian keywords for UI display
 */
export function getHumanitarianKeywords(): string[] {
    return [...HUMANITARIAN_KEYWORDS]
}
