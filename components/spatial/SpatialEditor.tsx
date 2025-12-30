'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { MapPin, Search, Trash2, Circle as CircleIcon, Pentagon, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import dynamic from 'next/dynamic'
import { detectPatterns, type DetectedPattern } from '@/lib/patternDetector'
import { AwarenessFlag } from './AwarenessFlag'
import type { GovernorateFeature } from '@/lib/spatialQueries'

// Fix Leaflet's default marker icon issue with bundlers
const fixLeafletIcons = async () => {
    if (typeof window === 'undefined') return

    const L = (await import('leaflet')).default
    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    })
}

// Dynamic imports for Leaflet components (SSR-safe)
const MapContainer = dynamic(
    () => import('react-leaflet').then((mod) => mod.MapContainer),
    { ssr: false }
)
const TileLayer = dynamic(
    () => import('react-leaflet').then((mod) => mod.TileLayer),
    { ssr: false }
)
const Marker = dynamic(
    () => import('react-leaflet').then((mod) => mod.Marker),
    { ssr: false }
)
const Circle = dynamic(
    () => import('react-leaflet').then((mod) => mod.Circle),
    { ssr: false }
)
const Polygon = dynamic(
    () => import('react-leaflet').then((mod) => mod.Polygon),
    { ssr: false }
)

// Syria center and bounds
const SYRIA_CENTER: [number, number] = [35.0, 38.0]
const SYRIA_BOUNDS: [[number, number], [number, number]] = [
    [32.0, 35.5],
    [37.5, 42.5]
]

interface GeoJSONGeometry {
    type: 'Point' | 'Polygon' | 'Circle'
    coordinates: number[] | number[][] | number[][][]
    radius?: number
}

interface SpatialEditorProps {
    value?: string | null
    geometry?: GeoJSONGeometry | null
    onChange: (placeName: string, geometry?: GeoJSONGeometry) => void
    className?: string
}

interface NominatimResult {
    place_id: number
    lat: string
    lon: string
    display_name: string
    boundingbox: string[]
}

// Click handler component that uses useMapEvents
const MapClickHandler = dynamic(
    () => Promise.resolve(function MapClickHandlerInner({
        onClick,
        enabled,
        drawMode
    }: {
        onClick: (lat: number, lng: number) => void
        enabled: boolean
        drawMode: string
    }) {
        const { useMapEvents: useMapEventsHook } = require('react-leaflet')

        useMapEventsHook({
            click: (e: any) => {
                if (enabled && e.latlng) {
                    onClick(e.latlng.lat, e.latlng.lng)
                }
            }
        })

        return null
    }),
    { ssr: false }
)

// Map center/zoom controller component
const MapViewController = dynamic(
    () => Promise.resolve(function MapViewControllerInner({
        center,
        zoom,
        bounds
    }: {
        center?: [number, number]
        zoom?: number
        bounds?: [[number, number], [number, number]]
    }) {
        const { useMap } = require('react-leaflet')
        const map = useMap()

        useEffect(() => {
            if (!map) return

            if (bounds) {
                map.fitBounds(bounds, { padding: [50, 50], animate: true, maxZoom: 15 })
            } else if (center && zoom) {
                map.setView(center, zoom, { animate: true })
            }
        }, [center, zoom, bounds, map])

        return null
    }),
    { ssr: false }
)

export function SpatialEditor({
    value,
    geometry,
    onChange,
    className = ''
}: SpatialEditorProps) {
    const t = useTranslations('Spatial')
    const [mounted, setMounted] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<NominatimResult[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [showResults, setShowResults] = useState(false)
    const [drawMode, setDrawMode] = useState<'none' | 'marker' | 'circle' | 'polygon'>('none')
    const [currentGeometry, setCurrentGeometry] = useState<GeoJSONGeometry | null>(geometry || null)
    const [mapCenter, setMapCenter] = useState<[number, number]>(SYRIA_CENTER)
    const [mapZoom, setMapZoom] = useState(6)
    const [mapBounds, setMapBounds] = useState<[[number, number], [number, number]] | null>(null)
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const [polygonPoints, setPolygonPoints] = useState<[number, number][]>([])
    const [circleRadius, setCircleRadius] = useState(5000) // Default 5km

    // Pattern detection preview state
    const [governorates, setGovernorates] = useState<GovernorateFeature[]>([])
    const [detectedPatterns, setDetectedPatterns] = useState<DetectedPattern[]>([])
    const [dismissedPatterns, setDismissedPatterns] = useState<Set<string>>(new Set())

    useEffect(() => {
        setMounted(true)
        fixLeafletIcons()

        // Load governorates for pattern detection
        fetch('/data/syria-governorates-polygons.json')
            .then(res => res.json())
            .then(data => {
                const arabicNames: Record<string, string> = {
                    'Damascus': 'دمشق', 'Aleppo': 'حلب', 'Rural Damascus': 'ريف دمشق',
                    'Homs': 'حمص', 'Hama': 'حماة', 'Lattakia': 'اللاذقية', 'Tartus': 'طرطوس',
                    'Idleb': 'إدلب', 'Ar-Raqqa': 'الرقة', 'Deir-ez-Zor': 'دير الزور',
                    'Al-Hasakeh': 'الحسكة', "Dar'a": 'درعا', 'As-Sweida': 'السويداء', 'Quneitra': 'القنيطرة'
                }
                const features = data.features.map((f: { properties: { shapeName: string }; geometry: { type: string; coordinates: number[] | number[][][] } }) => ({
                    name: f.properties.shapeName,
                    name_ar: arabicNames[f.properties.shapeName] || f.properties.shapeName,
                    type: 'governorate' as const,
                    geometry: f.geometry
                }))
                setGovernorates(features)
            })
            .catch(err => console.error('Failed to load governorates:', err))
    }, [])

    // Run pattern detection when geometry or governorates change
    useEffect(() => {
        if (!currentGeometry || governorates.length === 0) {
            setDetectedPatterns([])
            return
        }

        // Only run sync detection (P2, P3, P4) - no need for async in editor preview
        const patterns = detectPatterns(currentGeometry, governorates, undefined)
        setDetectedPatterns(patterns)
    }, [currentGeometry, governorates])

    useEffect(() => {
        if (geometry) {
            setCurrentGeometry(geometry)

            // Don't auto-move map while user is drawing
            if (drawMode !== 'none') return

            if (geometry.type === 'Point') {
                setMapBounds(null)
                setMapCenter([geometry.coordinates[1] as number, geometry.coordinates[0] as number])
                setMapZoom(12)
            } else if (geometry.type === 'Circle') {
                setMapBounds(null)
                setMapCenter([geometry.coordinates[1] as number, geometry.coordinates[0] as number])
                setMapZoom(12)
            } else if (geometry.type === 'Polygon' && Array.isArray(geometry.coordinates)) {
                // Calculate bounds of polygon (handle both simple and nested GeoJSON polygons)
                const rawCoords = geometry.coordinates
                let coords: number[][] = []

                if (rawCoords.length > 0) {
                    // Check nesting level and extract points
                    if (Array.isArray(rawCoords[0]) && Array.isArray((rawCoords[0] as any)[0])) {
                        // It's number[][][] (GeoJSON Polygon ring)
                        coords = (rawCoords as number[][][])[0]
                    } else {
                        // It's number[][] (Simple array of points)
                        coords = rawCoords as number[][]
                    }
                }

                if (coords.length > 0) {
                    const lats = coords.map(c => c[1])
                    const lngs = coords.map(c => c[0])
                    const minLat = Math.min(...lats)
                    const maxLat = Math.max(...lats)
                    const minLng = Math.min(...lngs)
                    const maxLng = Math.max(...lngs)

                    // Extend bounds slightly for better visibility
                    const latPad = (maxLat - minLat) * 0.05
                    const lngPad = (maxLng - minLng) * 0.05

                    setMapBounds([
                        [minLat - latPad, minLng - lngPad],
                        [maxLat + latPad, maxLng + lngPad]
                    ])
                }
            }
        }
    }, [geometry, drawMode])

    // Nominatim search with debounce
    const searchPlaces = useCallback(async (query: string) => {
        if (!query.trim() || query.length < 3) {
            setSearchResults([])
            setShowResults(false)
            return
        }

        setIsSearching(true)
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?` +
                `q=${encodeURIComponent(query + ' Syria')}&` +
                `format=json&limit=5&addressdetails=1&` +
                `viewbox=35.5,32.0,42.5,37.5&bounded=1`,
                { headers: { 'Accept-Language': 'en,ar' } }
            )
            const data: NominatimResult[] = await response.json()
            setSearchResults(data)
            setShowResults(data.length > 0)
        } catch (error) {
            console.error('Nominatim search failed:', error)
            setSearchResults([])
        } finally {
            setIsSearching(false)
        }
    }, [])

    const handleSearchInput = useCallback((query: string) => {
        setSearchQuery(query)
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current)
        }
        searchTimeoutRef.current = setTimeout(() => {
            searchPlaces(query)
        }, 400)
    }, [searchPlaces])

    const selectResult = useCallback((result: NominatimResult) => {
        const lat = parseFloat(result.lat)
        const lng = parseFloat(result.lon)
        const parts = result.display_name.split(',')
        const placeName = parts.slice(0, 2).join(',').trim()

        const geo: GeoJSONGeometry = {
            type: 'Point',
            coordinates: [lng, lat]
        }

        setCurrentGeometry(geo)
        setMapCenter([lat, lng])
        setMapZoom(12)
        setSearchQuery(placeName)
        setShowResults(false)
        onChange(placeName, geo)
    }, [onChange])

    // Handle map click for drawing
    const handleMapClick = useCallback((lat: number, lng: number) => {
        if (drawMode === 'none') return

        if (drawMode === 'marker') {
            const geo: GeoJSONGeometry = {
                type: 'Point',
                coordinates: [lng, lat]
            }
            setCurrentGeometry(geo)
            setMapCenter([lat, lng])
            const placeName = value || `${lat.toFixed(4)}, ${lng.toFixed(4)}`
            onChange(placeName, geo)
            setDrawMode('none')
        } else if (drawMode === 'circle') {
            const geo: GeoJSONGeometry = {
                type: 'Circle',
                coordinates: [lng, lat],
                radius: circleRadius
            }
            setCurrentGeometry(geo)
            setMapCenter([lat, lng])
            const placeName = value || `${lat.toFixed(4)}, ${lng.toFixed(4)}`
            onChange(placeName, geo)
            setDrawMode('none')
        } else if (drawMode === 'polygon') {
            // Add point to polygon
            const newPoints: [number, number][] = [...polygonPoints, [lng, lat]]
            setPolygonPoints(newPoints)

            // Need at least 3 points to form a polygon - show in-progress
            if (newPoints.length >= 3) {
                const geo: GeoJSONGeometry = {
                    type: 'Polygon',
                    coordinates: [newPoints] // Wrap in array to make it a ring (GeoJSON standard)
                }
                setCurrentGeometry(geo)
                const placeName = value || t('customRegion')
                onChange(placeName, geo)
            }
        }
    }, [drawMode, onChange, value, polygonPoints, t, circleRadius])

    // Finish polygon drawing
    const finishPolygon = useCallback(() => {
        if (polygonPoints.length >= 3) {
            const geo: GeoJSONGeometry = {
                type: 'Polygon',
                coordinates: [polygonPoints] // Wrap in array
            }
            setCurrentGeometry(geo)
            const placeName = value || t('customRegion')
            onChange(placeName, geo)
        }
        setPolygonPoints([])
        setDrawMode('none')
    }, [polygonPoints, value, onChange, t])

    const clearGeometry = useCallback(() => {
        setCurrentGeometry(null)
        setSearchQuery('')
        setPolygonPoints([])
        setMapBounds(null) // Reset bounds
        onChange('', undefined)
    }, [onChange])

    if (!mounted) {
        return (
            <div className={`bg-gray-100 dark:bg-dark-surface rounded-xl animate-pulse flex items-center justify-center h-64 ${className}`}>
                <MapPin className="w-8 h-8 text-gray-400" />
            </div>
        )
    }

    return (
        <div className={`space-y-3 ${className}`}>
            {/* Search Bar */}
            <div className="relative">
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => handleSearchInput(e.target.value)}
                            onFocus={() => searchResults.length > 0 && setShowResults(true)}
                            placeholder={t('searchPlaceholder')}
                            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface text-text dark:text-dark-text placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                        {isSearching && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        )}
                    </div>
                </div>

                {/* Search Results Dropdown */}
                {showResults && searchResults.length > 0 && (
                    <div className="absolute z-20 w-full mt-1 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {searchResults.map((result) => (
                            <button
                                key={result.place_id}
                                type="button"
                                onClick={() => selectResult(result)}
                                className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 dark:hover:bg-dark-bg border-b border-gray-100 dark:border-dark-border last:border-b-0 transition-colors"
                            >
                                <div className="flex items-start gap-2">
                                    <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                    <span className="text-text dark:text-dark-text line-clamp-2">
                                        {result.display_name}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Drawing Tools */}
            <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-text-light dark:text-dark-text-muted">
                    {t('drawTools')}:
                </span>
                <Button
                    type="button"
                    variant={drawMode === 'marker' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => { setDrawMode(drawMode === 'marker' ? 'none' : 'marker'); setPolygonPoints([]) }}
                    className="h-8"
                >
                    <MapPin className="w-3.5 h-3.5 mr-1" />
                    {t('point')}
                </Button>
                <Button
                    type="button"
                    variant={drawMode === 'circle' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => { setDrawMode(drawMode === 'circle' ? 'none' : 'circle'); setPolygonPoints([]) }}
                    className="h-8"
                >
                    <CircleIcon className="w-3.5 h-3.5 mr-1" />
                    {t('radius')}
                </Button>
                <Button
                    type="button"
                    variant={drawMode === 'polygon' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => { setDrawMode(drawMode === 'polygon' ? 'none' : 'polygon'); setPolygonPoints([]) }}
                    className="h-8"
                >
                    <Pentagon className="w-3.5 h-3.5 mr-1" />
                    {t('region')}
                </Button>
                {drawMode === 'polygon' && polygonPoints.length >= 3 && (
                    <Button
                        type="button"
                        variant="default"
                        size="sm"
                        onClick={finishPolygon}
                        className="h-8 bg-green-600 hover:bg-green-700"
                    >
                        ✓ {t('finishRegion')}
                    </Button>
                )}
                {currentGeometry && (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={clearGeometry}
                        className="h-8 text-red-500 hover:text-red-600 hover:border-red-300"
                    >
                        <Trash2 className="w-3.5 h-3.5 mr-1" />
                        {t('clear')}
                    </Button>
                )}
                {drawMode !== 'none' && (
                    <span className="text-xs text-primary dark:text-primary-light animate-pulse">
                        {drawMode === 'polygon'
                            ? (polygonPoints.length < 3 ? t('clickToDrawRegion') : t('clickToAddMorePoints'))
                            : t('clickToPlace')}
                    </span>
                )}
            </div>

            {/* Radius slider for circle mode */}
            {(drawMode === 'circle' || currentGeometry?.type === 'Circle') && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-dark-bg rounded-lg">
                    <span className="text-xs font-medium text-text-light dark:text-dark-text-muted whitespace-nowrap">
                        {t('radiusSize')}:
                    </span>
                    <input
                        type="range"
                        min="1000"
                        max="50000"
                        step="1000"
                        value={currentGeometry?.type === 'Circle' ? (currentGeometry.radius || 5000) : circleRadius}
                        onChange={(e) => {
                            const newRadius = parseInt(e.target.value)
                            setCircleRadius(newRadius)
                            // Update existing circle geometry
                            if (currentGeometry?.type === 'Circle') {
                                const updatedGeo = { ...currentGeometry, radius: newRadius }
                                setCurrentGeometry(updatedGeo)
                                onChange(value || '', updatedGeo)
                            }
                        }}
                        className="flex-1 h-2 bg-gray-200 dark:bg-dark-border rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <span className="text-xs font-semibold text-primary min-w-[4rem] text-right">
                        {((currentGeometry?.type === 'Circle' ? (currentGeometry.radius || 5000) : circleRadius) / 1000).toFixed(0)} km
                    </span>
                </div>
            )}

            {/* Map */}
            <div className="relative h-64 rounded-xl overflow-hidden border border-gray-200 dark:border-dark-border">
                <MapContainer
                    center={mapCenter}
                    zoom={mapZoom}
                    maxBounds={SYRIA_BOUNDS}
                    minZoom={5}
                    maxZoom={16}
                    scrollWheelZoom={true}
                    style={{ height: '100%', width: '100%' }}
                    className={`z-0 ${drawMode !== 'none' ? 'cursor-crosshair' : ''}`}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {/* Auto-center map on geometry changes */}
                    <MapViewController center={mapCenter} zoom={mapZoom} bounds={mapBounds || undefined} />

                    {/* Render current geometry */}
                    {currentGeometry?.type === 'Point' && (
                        <Marker
                            position={[
                                currentGeometry.coordinates[1] as number,
                                currentGeometry.coordinates[0] as number
                            ]}
                        />
                    )}
                    {currentGeometry?.type === 'Circle' && (
                        <Circle
                            center={[
                                currentGeometry.coordinates[1] as number,
                                currentGeometry.coordinates[0] as number
                            ]}
                            radius={currentGeometry.radius || 5000}
                            pathOptions={{
                                color: '#1A3D40',
                                fillColor: '#4AA3A5',
                                fillOpacity: 0.2,
                                weight: 2
                            }}
                        />
                    )}
                    {currentGeometry?.type === 'Polygon' && (
                        <Polygon
                            positions={(() => {
                                const coords = currentGeometry.coordinates as any[]
                                // Handle both simple and standard GeoJSON (nested)
                                if (coords.length > 0 && Array.isArray(coords[0]) && Array.isArray(coords[0][0])) {
                                    // number[][][] -> Extract first ring
                                    return (coords[0] as number[][]).map(c => [c[1], c[0]] as [number, number])
                                }
                                // number[][]
                                return (coords as number[][]).map(c => [c[1], c[0]] as [number, number])
                            })()}
                            pathOptions={{
                                color: '#1A3D40',
                                fillColor: '#4AA3A5',
                                fillOpacity: 0.2,
                                weight: 2
                            }}
                        />
                    )}
                    {/* In-progress polygon points */}
                    {drawMode === 'polygon' && polygonPoints.length > 0 && polygonPoints.length < 3 && (
                        <>
                            {polygonPoints.map((point, idx) => (
                                <Marker key={idx} position={[point[1], point[0]]} />
                            ))}
                        </>
                    )}

                    {/* Click handler */}
                    <MapClickHandler
                        onClick={handleMapClick}
                        enabled={drawMode !== 'none'}
                        drawMode={drawMode}
                    />
                </MapContainer>
            </div>

            {/* Current location display */}
            {(value || currentGeometry) && (
                <div className="flex items-center gap-2 px-3 py-2 bg-primary/5 dark:bg-primary/10 rounded-lg text-sm">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="text-text dark:text-dark-text font-medium">
                        {value || t('customLocation')}
                    </span>
                    {currentGeometry && (
                        <span className="text-text-light dark:text-dark-text-muted">
                            ({currentGeometry.type === 'Point' ? t('point') : currentGeometry.type === 'Circle' ? t('radius') : t('region')})
                        </span>
                    )}
                </div>
            )}

            {/* Pattern Detection Preview */}
            {detectedPatterns.length > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-text-light dark:text-dark-text-muted">
                        <Info className="w-3.5 h-3.5" />
                        <span>{t('patternPreview') || 'Spatial observations (preview)'}</span>
                    </div>
                    <AwarenessFlag patterns={detectedPatterns} />
                </div>
            )}
        </div>
    )
}
