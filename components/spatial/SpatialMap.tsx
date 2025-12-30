'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { MapPin, Layers, X, Maximize2, Minimize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

// Dynamic import for Leaflet (SSR-safe)
import dynamic from 'next/dynamic'
import { useMemo } from 'react'

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
const Popup = dynamic(
    () => import('react-leaflet').then((mod) => mod.Popup),
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
                map.fitBounds(bounds, { padding: [20, 20], animate: true, maxZoom: 15 })
            } else if (center && zoom) {
                map.setView(center, zoom, { animate: true })
            }
        }, [center, zoom, bounds, map])

        return null
    }),
    { ssr: false }
)

// Syria governorate coordinates for ghost-highlighting
const SYRIA_LOCATIONS: Record<string, { lat: number; lng: number; radius: number }> = {
    'damascus': { lat: 33.5138, lng: 36.2765, radius: 15000 },
    'دمشق': { lat: 33.5138, lng: 36.2765, radius: 15000 },
    'aleppo': { lat: 36.2022, lng: 37.1343, radius: 25000 },
    'حلب': { lat: 36.2022, lng: 37.1343, radius: 25000 },
    'homs': { lat: 34.7333, lng: 36.7167, radius: 20000 },
    'حمص': { lat: 34.7333, lng: 36.7167, radius: 20000 },
    'hama': { lat: 35.1333, lng: 36.7500, radius: 15000 },
    'حماة': { lat: 35.1333, lng: 36.7500, radius: 15000 },
    'latakia': { lat: 35.5167, lng: 35.7833, radius: 15000 },
    'اللاذقية': { lat: 35.5167, lng: 35.7833, radius: 15000 },
    'tartus': { lat: 34.9000, lng: 35.8833, radius: 12000 },
    'طرطوس': { lat: 34.9000, lng: 35.8833, radius: 12000 },
    'idlib': { lat: 35.9333, lng: 36.6333, radius: 20000 },
    'إدلب': { lat: 35.9333, lng: 36.6333, radius: 20000 },
    'raqqa': { lat: 35.9500, lng: 39.0167, radius: 18000 },
    'الرقة': { lat: 35.9500, lng: 39.0167, radius: 18000 },
    'deir ez-zor': { lat: 35.3333, lng: 40.1333, radius: 20000 },
    'deir ezzor': { lat: 35.3333, lng: 40.1333, radius: 20000 },
    'دير الزور': { lat: 35.3333, lng: 40.1333, radius: 20000 },
    'al-hasakah': { lat: 36.5000, lng: 40.7500, radius: 18000 },
    'hasakah': { lat: 36.5000, lng: 40.7500, radius: 18000 },
    'الحسكة': { lat: 36.5000, lng: 40.7500, radius: 18000 },
    'daraa': { lat: 32.6167, lng: 36.1000, radius: 15000 },
    'درعا': { lat: 32.6167, lng: 36.1000, radius: 15000 },
    'as-suwayda': { lat: 32.7000, lng: 36.5667, radius: 12000 },
    'suwayda': { lat: 32.7000, lng: 36.5667, radius: 12000 },
    'السويداء': { lat: 32.7000, lng: 36.5667, radius: 12000 },
    'quneitra': { lat: 33.1264, lng: 35.8200, radius: 10000 },
    'القنيطرة': { lat: 33.1264, lng: 35.8200, radius: 10000 },
    'rural damascus': { lat: 33.5000, lng: 36.5000, radius: 30000 },
    'rif dimashq': { lat: 33.5000, lng: 36.5000, radius: 30000 },
    'ريف دمشق': { lat: 33.5000, lng: 36.5000, radius: 30000 },
}

// Syria center and bounds
const SYRIA_CENTER: [number, number] = [35.0, 38.0]
const SYRIA_BOUNDS: [[number, number], [number, number]] = [
    [32.0, 35.5],
    [37.5, 42.5]
]

interface SpatialMapProps {
    spatialCoverage?: string | null
    spatialGeometry?: {
        type: string
        coordinates: number[] | number[][] | number[][][]
    } | null
    className?: string
    height?: string
    showLayerToggle?: boolean
    interactive?: boolean
}

export function SpatialMap({
    spatialCoverage,
    spatialGeometry,
    className = '',
    height = '280px',
    showLayerToggle = true,
    interactive = true
}: SpatialMapProps) {
    const t = useTranslations('Spatial')
    const [mounted, setMounted] = useState(false)
    const [showOSM, setShowOSM] = useState(true)
    const [expanded, setExpanded] = useState(false)

    // Parse spatial coverage to find matching location
    const matchedLocation = spatialCoverage
        ? Object.entries(SYRIA_LOCATIONS).find(([key]) =>
            spatialCoverage.toLowerCase().includes(key.toLowerCase())
        )?.[1]
        : null

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional SSR hydration pattern
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <div
                className={`bg-gray-100 dark:bg-dark-surface rounded-xl animate-pulse flex items-center justify-center ${className}`}
                style={{ height }}
            >
                <MapPin className="w-8 h-8 text-gray-400" />
            </div>
        )
    }

    const mapContent = (
        <div className="relative" style={{ height: expanded ? '70vh' : height }}>
            <MapContainer
                center={matchedLocation ? [matchedLocation.lat, matchedLocation.lng] : SYRIA_CENTER}
                zoom={matchedLocation ? 10 : 6}
                maxBounds={SYRIA_BOUNDS}
                minZoom={5}
                maxZoom={15}
                scrollWheelZoom={interactive}
                dragging={interactive}
                zoomControl={interactive}
                style={{ height: '100%', width: '100%', borderRadius: '0.75rem' }}
                className="z-0"
            >
                {/* Base tile layer - OpenStreetMap */}
                {showOSM && (
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                )}

                {/* Auto-focus controller */}
                <MapViewController
                    center={matchedLocation ? [matchedLocation.lat, matchedLocation.lng] : SYRIA_CENTER}
                    zoom={matchedLocation ? 10 : 6}
                    bounds={(() => {
                        if (spatialGeometry?.type === 'Polygon' && spatialGeometry.coordinates) {
                            const coords = spatialGeometry.coordinates as any[]
                            let points: number[][] = []

                            // Handle standard GeoJSON number[][][] and simple number[][]
                            if (coords.length > 0) {
                                if (Array.isArray(coords[0]) && Array.isArray(coords[0][0])) {
                                    points = coords[0] as number[][]
                                } else {
                                    points = coords as number[][]
                                }
                            }

                            if (points.length > 0) {
                                const lats = points.map(c => c[1])
                                const lngs = points.map(c => c[0])
                                const minLat = Math.min(...lats)
                                const maxLat = Math.max(...lats)
                                const minLng = Math.min(...lngs)
                                const maxLng = Math.max(...lngs)

                                // Add 5% padding (reduced from 10%)
                                const latPad = (maxLat - minLat) * 0.05
                                const lngPad = (maxLng - minLng) * 0.05

                                return [
                                    [minLat - latPad, minLng - lngPad],
                                    [maxLat + latPad, maxLng + lngPad]
                                ] as [[number, number], [number, number]]
                            }
                        } else if (spatialGeometry?.type === 'Circle' && spatialGeometry.coordinates) {
                            // Focus on circle with padding equivalent to radius
                            const lat = spatialGeometry.coordinates[1] as number
                            const lng = spatialGeometry.coordinates[0] as number
                            // Rough approximation: 1 degree approx 111km
                            const radiusDeg = ((spatialGeometry as any).radius || 5000) / 111000
                            const pad = radiusDeg * 1.5
                            return [
                                [lat - pad, lng - pad],
                                [lat + pad, lng + pad]
                            ] as [[number, number], [number, number]]
                        } else if (spatialGeometry?.type === 'Point' && spatialGeometry.coordinates) {
                            // Focus on point
                            const lat = spatialGeometry.coordinates[1] as number
                            const lng = spatialGeometry.coordinates[0] as number
                            const pad = 0.05 // rough "zoom level 12-13" equivalent box
                            return [
                                [lat - pad, lng - pad],
                                [lat + pad, lng + pad]
                            ] as [[number, number], [number, number]]
                        }

                        return undefined
                    })()}
                />

                {/* Fallback neutral tiles */}
                {!showOSM && (
                    <TileLayer
                        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    />
                )}

                {matchedLocation && (
                    <Circle
                        center={[matchedLocation.lat, matchedLocation.lng]}
                        radius={matchedLocation.radius}
                        pathOptions={{
                            color: '#1A3D40',
                            fillColor: '#4AA3A5',
                            fillOpacity: 0.15,
                            weight: 2,
                            dashArray: '5, 5'
                        }}
                    />
                )}

                {/* Render saved geometry */}
                {spatialGeometry && spatialGeometry.type === 'Point' && spatialGeometry.coordinates && spatialGeometry.coordinates.length >= 2 && (
                    <Marker position={[spatialGeometry.coordinates[1] as number, spatialGeometry.coordinates[0] as number]} />
                )}
                {spatialGeometry && spatialGeometry.type === 'Polygon' && spatialGeometry.coordinates && (
                    <Polygon
                        positions={(() => {
                            const coords = spatialGeometry.coordinates as any[]
                            if (!coords || coords.length === 0) return []

                            // Check for standard GeoJSON (number[][][]) - Array of rings
                            if (Array.isArray(coords[0]) && Array.isArray(coords[0][0])) {
                                return (coords[0] as number[][]).map(c => [c[1], c[0]] as [number, number])
                            }
                            // Check for simple Polygon (number[][]) - Array of points
                            else if (Array.isArray(coords[0]) && typeof coords[0][0] === 'number') {
                                return (coords as number[][]).map(c => [c[1], c[0]] as [number, number])
                            }

                            return []
                        })()}
                        pathOptions={{
                            color: '#1A3D40',
                            fillColor: '#4AA3A5',
                            fillOpacity: 0.2,
                            weight: 2
                        }}
                    />
                )}
                {spatialGeometry && (spatialGeometry as any).radius && spatialGeometry.coordinates && spatialGeometry.coordinates.length >= 2 && (
                    <Circle
                        center={[spatialGeometry.coordinates[1] as number, spatialGeometry.coordinates[0] as number]}
                        radius={(spatialGeometry as any).radius}
                        pathOptions={{
                            color: '#1A3D40',
                            fillColor: '#4AA3A5',
                            fillOpacity: 0.2,
                            weight: 2
                        }}
                    />
                )}
            </MapContainer>

            {/* Layer Toggle */}
            {showLayerToggle && (
                <div className="absolute top-3 right-3 z-10 flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowOSM(!showOSM)}
                        className="bg-white/90 dark:bg-dark-surface/90 backdrop-blur-sm shadow-sm"
                    >
                        <Layers className="w-4 h-4 mr-1" />
                        {showOSM ? 'OSM' : 'Light'}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setExpanded(!expanded)}
                        className="bg-white/90 dark:bg-dark-surface/90 backdrop-blur-sm shadow-sm"
                    >
                        {expanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </Button>
                </div>
            )}

            {/* Location Label */}
            {spatialCoverage && (
                <div className="absolute bottom-3 left-3 z-10 px-3 py-1.5 bg-white/90 dark:bg-dark-surface/90 backdrop-blur-sm rounded-lg shadow-sm text-sm font-medium text-text dark:text-dark-text flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    {spatialCoverage}
                </div>
            )}
        </div>
    )

    return (
        <div className={className}>
            {expanded ? (
                <Dialog open={expanded} onOpenChange={setExpanded}>
                    <DialogContent className="max-w-4xl p-0 overflow-hidden">
                        <DialogHeader className="p-4 pb-0">
                            <DialogTitle className="flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-primary" />
                                {t('spatialContext')}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="p-4 pt-2">
                            {mapContent}
                        </div>
                    </DialogContent>
                </Dialog>
            ) : (
                mapContent
            )}
        </div>
    )
}
