'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { MapPin, ChevronDown, ChevronUp, Info } from 'lucide-react'
import { SpatialMap } from './SpatialMap'
import { AwarenessFlag } from './AwarenessFlag'
import { detectPatterns, type DetectedPattern } from '@/lib/patternDetector'
import type { GovernorateFeature } from '@/lib/spatialQueries'

interface SpatialContextCardProps {
    spatialCoverage?: string | null
    spatialGeometry?: {
        type: string
        coordinates: number[] | number[][] | number[][][]
    } | null
    temporalStart?: string | null
    temporalEnd?: string | null
    className?: string
}

// Cache for governorate data
let governoratesCache: GovernorateFeature[] | null = null

export function SpatialContextCard({
    spatialCoverage,
    spatialGeometry,
    temporalStart,
    temporalEnd,
    className = ''
}: SpatialContextCardProps) {
    const t = useTranslations('Spatial')
    const [isExpanded, setIsExpanded] = useState(true)
    const [patterns, setPatterns] = useState<DetectedPattern[]>([])
    const [governorates, setGovernorates] = useState<GovernorateFeature[]>([])

    // Load governorate data once
    useEffect(() => {
        if (governoratesCache) {
            setGovernorates(governoratesCache)
            return
        }

        // Arabic names mapping for geoBoundaries data
        const arabicNames: Record<string, string> = {
            'Damascus': 'دمشق',
            'Aleppo': 'حلب',
            'Rural Damascus': 'ريف دمشق',
            'Homs': 'حمص',
            'Hama': 'حماة',
            'Lattakia': 'اللاذقية',
            'Tartus': 'طرطوس',
            'Idleb': 'إدلب',
            'Ar-Raqqa': 'الرقة',
            'Deir-ez-Zor': 'دير الزور',
            'Al-Hasakeh': 'الحسكة',
            "Dar'a": 'درعا',
            'As-Sweida': 'السويداء',
            'Quneitra': 'القنيطرة'
        }

        fetch('/data/syria-governorates-polygons.json')
            .then(res => res.json())
            .then(data => {
                const features = data.features.map((f: { properties: { shapeName: string; shapeISO: string }; geometry: { type: string; coordinates: number[] | number[][][] } }) => ({
                    name: f.properties.shapeName,
                    name_ar: arabicNames[f.properties.shapeName] || f.properties.shapeName,
                    type: 'governorate' as const,
                    geometry: f.geometry
                }))
                governoratesCache = features
                setGovernorates(features)
            })
            .catch(err => console.error('Failed to load governorate data:', err))
    }, [])

    // Run pattern detection when geometry or governorates change
    useEffect(() => {
        if (!spatialGeometry || governorates.length === 0) {
            setPatterns([])
            return
        }

        const detected = detectPatterns(
            spatialGeometry,
            governorates,
            temporalStart || temporalEnd
        )
        setPatterns(detected)
    }, [spatialGeometry, governorates, temporalStart, temporalEnd])

    // Don't render if no spatial data (text or geometry)
    if (!spatialCoverage && !spatialGeometry) {
        return null
    }

    // Format temporal range
    const formatDate = (dateStr: string) => {
        try {
            return new Date(dateStr).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short'
            })
        } catch {
            return dateStr
        }
    }

    const temporalRange = temporalStart || temporalEnd
        ? `${temporalStart ? formatDate(temporalStart) : '...'} – ${temporalEnd ? formatDate(temporalEnd) : t('present')}`
        : null

    return (
        <div className={`bg-white dark:bg-dark-surface rounded-2xl border border-gray-200 dark:border-dark-border overflow-hidden ${className}`}>
            {/* Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-dark-bg/50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-primary" />
                    </div>
                    <div className="text-left">
                        <h3 className="font-semibold text-sm text-text dark:text-dark-text">
                            {t('spatialContext')}
                        </h3>
                        <p className="text-xs text-text-light dark:text-dark-text-muted">
                            {spatialCoverage}
                            {temporalRange && ` · ${temporalRange}`}
                        </p>
                    </div>
                </div>
                {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-text-light dark:text-dark-text-muted" />
                ) : (
                    <ChevronDown className="w-5 h-5 text-text-light dark:text-dark-text-muted" />
                )}
            </button>

            {/* Map Content */}
            {isExpanded && (
                <div className="px-4 pb-4 space-y-3">
                    <SpatialMap
                        spatialCoverage={spatialCoverage}
                        spatialGeometry={spatialGeometry}
                        height="220px"
                        showLayerToggle={true}
                        interactive={true}
                    />

                    {/* Awareness Flags (if any patterns detected) */}
                    {patterns.length > 0 && (
                        <AwarenessFlag patterns={patterns} />
                    )}

                    {/* Subtle info footer */}
                    <div className="flex items-start gap-2 text-xs text-text-light dark:text-dark-text-muted">
                        <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                        <p>{t('contextNote')}</p>
                    </div>
                </div>
            )}
        </div>
    )
}
