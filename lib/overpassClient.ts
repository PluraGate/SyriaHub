/**
 * OSM Overpass API Client
 * 
 * Provides queries for road network analysis in Syria.
 * Used for P1: Network bottleneck pattern detection.
 */

const OVERPASS_API_URL = 'https://overpass-api.de/api/interpreter'

// Road types to consider for network analysis
const ROAD_TYPES = [
    'motorway', 'trunk', 'primary', 'secondary', 'tertiary',
    'motorway_link', 'trunk_link', 'primary_link', 'secondary_link'
]

export interface RoadSegment {
    id: number
    type: string
    name?: string
    coordinates: [number, number][]  // [lng, lat][]
}

export interface NetworkAnalysisResult {
    roadCount: number
    totalLengthKm: number
    primaryRoads: number
    hasLimitedAccess: boolean  // True if area has few connecting roads
    message?: string
}

/**
 * Build Overpass QL query for roads in a bounding box
 */
function buildRoadQuery(
    minLat: number,
    minLng: number,
    maxLat: number,
    maxLng: number
): string {
    const roadFilter = ROAD_TYPES.map(t => `["highway"="${t}"]`).join('')

    return `
[out:json][timeout:25];
(
  way${roadFilter}(${minLat},${minLng},${maxLat},${maxLng});
);
out geom;
`
}

/**
 * Query Overpass API for roads in a given area
 */
export async function queryRoadsInArea(
    centerLat: number,
    centerLng: number,
    radiusKm: number = 10
): Promise<RoadSegment[]> {
    // Calculate bounding box from center + radius
    const latDelta = radiusKm / 111  // ~111 km per degree latitude
    const lngDelta = radiusKm / (111 * Math.cos(centerLat * Math.PI / 180))

    const minLat = centerLat - latDelta
    const maxLat = centerLat + latDelta
    const minLng = centerLng - lngDelta
    const maxLng = centerLng + lngDelta

    const query = buildRoadQuery(minLat, minLng, maxLat, maxLng)

    try {
        const response = await fetch(OVERPASS_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `data=${encodeURIComponent(query)}`
        })

        if (!response.ok) {
            console.error('Overpass API error:', response.status)
            return []
        }

        const contentType = response.headers.get('content-type')
        if (!contentType || !contentType.includes('application/json')) {
            console.error('Overpass API returned non-JSON response:', contentType)
            return []
        }

        const data = await response.json()

        // Parse OSM ways into road segments
        const roads: RoadSegment[] = data.elements
            .filter((el: { type: string }) => el.type === 'way')
            .map((way: { id: number; tags?: { highway?: string; name?: string }; geometry?: Array<{ lat: number; lon: number }> }) => ({
                id: way.id,
                type: way.tags?.highway || 'unknown',
                name: way.tags?.name,
                coordinates: way.geometry?.map((g: { lat: number; lon: number }) => [g.lon, g.lat]) || []
            }))

        return roads
    } catch (error) {
        console.error('Overpass API query failed:', error)
        return []
    }
}

/**
 * Analyze road network connectivity
 * Returns analysis result for P1 pattern detection
 */
export async function analyzeRoadNetwork(
    centerLat: number,
    centerLng: number,
    radiusKm: number = 15
): Promise<NetworkAnalysisResult> {
    const roads = await queryRoadsInArea(centerLat, centerLng, radiusKm)

    // Count road types
    const primaryRoads = roads.filter(r =>
        ['motorway', 'trunk', 'primary', 'motorway_link', 'trunk_link', 'primary_link'].includes(r.type)
    ).length

    // Estimate total length (simplified - straight-line segments)
    let totalLengthKm = 0
    for (const road of roads) {
        if (road.coordinates.length < 2) continue
        for (let i = 1; i < road.coordinates.length; i++) {
            const [lng1, lat1] = road.coordinates[i - 1]
            const [lng2, lat2] = road.coordinates[i]
            // Haversine approximation for short segments
            const dLat = (lat2 - lat1) * Math.PI / 180
            const dLng = (lng2 - lng1) * Math.PI / 180
            const a = Math.sin(dLat / 2) ** 2 +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLng / 2) ** 2
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
            totalLengthKm += 6371 * c
        }
    }

    // Heuristic: limited access if <3 primary roads in area
    const hasLimitedAccess = primaryRoads < 3 && roads.length < 10

    return {
        roadCount: roads.length,
        totalLengthKm: Math.round(totalLengthKm * 10) / 10,
        primaryRoads,
        hasLimitedAccess,
        message: hasLimitedAccess
            ? 'This area may have limited route access'
            : undefined
    }
}

/**
 * Check if Overpass API is available (rate limiting check)
 */
export async function checkOverpassAvailability(): Promise<boolean> {
    try {
        const response = await fetch(OVERPASS_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'data=[out:json];out;'
        })
        return response.ok
    } catch {
        return false
    }
}
