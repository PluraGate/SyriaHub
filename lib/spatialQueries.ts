/**
 * Spatial Query Utilities
 * 
 * Pure functions for geometry operations used in pattern detection.
 * Source: OSM admin boundaries (version pinned in syria-governorates.json)
 */

// Types
export interface Point {
    lat: number
    lng: number
}

export interface BoundingBox {
    minLat: number
    maxLat: number
    minLng: number
    maxLng: number
}

export interface Polygon {
    coordinates: number[][][] // GeoJSON polygon format: [[[lng, lat], ...]]
    bbox?: BoundingBox
}

export interface GovernorateFeature {
    name: string
    name_ar: string
    type: 'governorate'
    geometry: {
        type: 'Point' | 'Polygon'
        coordinates: number[] | number[][][]
    }
    bbox?: BoundingBox
}

// Earth radius in kilometers
const EARTH_RADIUS_KM = 6371

/**
 * Calculate haversine distance between two points
 * @returns Distance in kilometers
 */
export function haversineDistance(p1: Point, p2: Point): number {
    const toRad = (deg: number) => (deg * Math.PI) / 180

    const dLat = toRad(p2.lat - p1.lat)
    const dLng = toRad(p2.lng - p1.lng)

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(p1.lat)) * Math.cos(toRad(p2.lat)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return EARTH_RADIUS_KM * c
}

/**
 * Check if a point is inside a bounding box (quick rejection)
 */
export function pointInBbox(point: Point, bbox: BoundingBox): boolean {
    return (
        point.lat >= bbox.minLat &&
        point.lat <= bbox.maxLat &&
        point.lng >= bbox.minLng &&
        point.lng <= bbox.maxLng
    )
}

/**
 * Calculate bounding box from polygon coordinates
 */
export function calculateBbox(coordinates: number[][][]): BoundingBox {
    if (!coordinates || !coordinates[0] || coordinates[0].length === 0) {
        return { minLat: 0, maxLat: 0, minLng: 0, maxLng: 0 }
    }
    const ring = coordinates[0] // Outer ring
    const validCoords = ring.filter(c => Array.isArray(c) && c.length >= 2)
    const lngs = validCoords.map(c => c[0])
    const lats = validCoords.map(c => c[1])

    return {
        minLat: Math.min(...lats),
        maxLat: Math.max(...lats),
        minLng: Math.min(...lngs),
        maxLng: Math.max(...lngs)
    }
}

/**
 * Ray casting algorithm for point-in-polygon test
 * @returns true if point is inside polygon
 */
export function pointInPolygon(point: Point, polygon: Polygon): boolean {
    // Quick rejection using bounding box
    if (polygon.bbox && !pointInBbox(point, polygon.bbox)) {
        return false
    }

    const ring = polygon.coordinates[0] // Outer ring
    if (!ring || ring.length === 0) return false

    let inside = false

    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        const p1 = ring[i]
        const p2 = ring[j]
        if (!p1 || !p2) continue

        const xi = p1[0], yi = p1[1] // lng, lat
        const xj = p2[0], yj = p2[1]

        const intersect = ((yi > point.lat) !== (yj > point.lat)) &&
            (point.lng < (xj - xi) * (point.lat - yi) / (yj - yi) + xi)

        if (intersect) inside = !inside
    }

    return inside
}

/**
 * Calculate centroid of a polygon
 */
export function polygonCentroid(polygon: Polygon): Point {
    const ring = polygon.coordinates?.[0]
    if (!ring || ring.length === 0) return { lat: 0, lng: 0 }

    const validCoords = ring.filter(c => Array.isArray(c) && c.length >= 2)
    if (validCoords.length === 0) return { lat: 0, lng: 0 }

    let latSum = 0
    let lngSum = 0

    for (const coord of validCoords) {
        lngSum += coord[0]
        latSum += coord[1]
    }

    return {
        lat: latSum / validCoords.length,
        lng: lngSum / validCoords.length
    }
}

/**
 * Check if two polygons intersect (simplified check using bbox overlap + edge crossing)
 */
export function polygonsIntersect(p1: Polygon, p2: Polygon): boolean {
    // Quick rejection: check bbox overlap first
    if (p1.bbox && p2.bbox) {
        if (p1.bbox.maxLat < p2.bbox.minLat || p1.bbox.minLat > p2.bbox.maxLat ||
            p1.bbox.maxLng < p2.bbox.minLng || p1.bbox.minLng > p2.bbox.maxLng) {
            return false
        }
    }

    // Check if any vertex of p1 is inside p2 or vice versa
    const ring1 = p1.coordinates?.[0]
    const ring2 = p2.coordinates?.[0]

    if (ring1) {
        for (const coord of ring1) {
            if (Array.isArray(coord) && coord.length >= 2) {
                if (pointInPolygon({ lat: coord[1], lng: coord[0] }, p2)) {
                    return true
                }
            }
        }
    }

    if (ring2) {
        for (const coord of ring2) {
            if (Array.isArray(coord) && coord.length >= 2) {
                if (pointInPolygon({ lat: coord[1], lng: coord[0] }, p1)) {
                    return true
                }
            }
        }
    }

    return false
}

/**
 * Find which governorate(s) contain a given point
 * @param point - The point to check
 * @param governorates - Array of governorate features with polygon geometries
 * @returns Array of matching governorate names (usually 1, but could be 0 or multiple for edge cases)
 */
export function findContainingGovernorates(
    point: Point,
    governorates: GovernorateFeature[]
): string[] {
    const matches: string[] = []

    for (const gov of governorates) {
        if (gov.geometry.type === 'Polygon') {
            const polygon: Polygon = {
                coordinates: gov.geometry.coordinates as number[][][],
                bbox: gov.bbox
            }
            if (pointInPolygon(point, polygon)) {
                matches.push(gov.name)
            }
        } else if (gov.geometry.type === 'Point' && Array.isArray(gov.geometry.coordinates)) {
            // Fallback for point data: use proximity (within ~30km)
            const coords = gov.geometry.coordinates as number[]
            if (coords.length >= 2) {
                const govPoint: Point = {
                    lng: coords[0],
                    lat: coords[1]
                }
                if (haversineDistance(point, govPoint) < 30) {
                    matches.push(gov.name)
                }
            }
        }
    }

    return matches
}

/**
 * Check if a geometry spans multiple governorates (P3: Boundary spill-over)
 * @param geometry - The geometry to check (polygon or circle)
 * @param governorates - Array of governorate features
 * @returns Array of governorate names the geometry intersects
 */
export function findSpanningGovernorates(
    geometry: { type: string; coordinates: number[] | number[][] | number[][][] },
    governorates: GovernorateFeature[]
): string[] {
    if (geometry.type === 'Point' && Array.isArray(geometry.coordinates) && geometry.coordinates.length >= 2) {
        const point: Point = {
            lng: (geometry.coordinates as number[])[0],
            lat: (geometry.coordinates as number[])[1]
        }
        return findContainingGovernorates(point, governorates)
    }

    if (geometry.type === 'Polygon') {
        const polygon: Polygon = {
            coordinates: geometry.coordinates as number[][][],
            bbox: calculateBbox(geometry.coordinates as number[][][])
        }

        const matches: string[] = []
        for (const gov of governorates) {
            if (gov.geometry.type === 'Polygon') {
                const govPolygon: Polygon = {
                    coordinates: gov.geometry.coordinates as number[][][],
                    bbox: gov.bbox
                }
                if (polygonsIntersect(polygon, govPolygon)) {
                    matches.push(gov.name)
                }
            }
        }
        return matches
    }

    // Circle: check if circle intersects multiple governorates
    // (simplified: check center + edge points)
    if (geometry.type === 'Circle' && Array.isArray(geometry.coordinates) && geometry.coordinates.length >= 2) {
        const center: Point = {
            lng: (geometry.coordinates as number[])[0],
            lat: (geometry.coordinates as number[])[1]
        }
        // For circles, just check the center point for now
        // Full circle-polygon intersection is complex
        return findContainingGovernorates(center, governorates)
    }

    return []
}

/**
 * Calculate temporal relevance score (0-1)
 * More recent data gets higher scores
 * @param dataDate - Date of the data
 * @param maxAgeDays - Data older than this gets 0 score (default: 2 years)
 */
export function temporalRelevance(
    dataDate: Date | string | null,
    maxAgeDays: number = 730
): number {
    if (!dataDate) return 0.5 // Unknown date = middle score

    const date = typeof dataDate === 'string' ? new Date(dataDate) : dataDate
    const now = new Date()
    const ageMs = now.getTime() - date.getTime()
    const ageDays = ageMs / (1000 * 60 * 60 * 24)

    if (ageDays <= 0) return 1 // Future date = current
    if (ageDays >= maxAgeDays) return 0.1 // Very old but not zero

    // Linear decay
    return 1 - (ageDays / maxAgeDays) * 0.9
}

// Default nearby search radius in km (conservative per design rules)
export const DEFAULT_NEARBY_RADIUS_KM = 10
