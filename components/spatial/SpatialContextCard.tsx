'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { MapPin, ChevronDown, ChevronUp, Info } from 'lucide-react'
import { SpatialMap } from './SpatialMap'

interface SpatialContextCardProps {
    spatialCoverage?: string | null
    temporalStart?: string | null
    temporalEnd?: string | null
    className?: string
}

export function SpatialContextCard({
    spatialCoverage,
    temporalStart,
    temporalEnd,
    className = ''
}: SpatialContextCardProps) {
    const t = useTranslations('Spatial')
    const [isExpanded, setIsExpanded] = useState(true)

    // Don't render if no spatial data
    if (!spatialCoverage) {
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
                <div className="px-4 pb-4">
                    <SpatialMap
                        spatialCoverage={spatialCoverage}
                        height="220px"
                        showLayerToggle={true}
                        interactive={true}
                    />

                    {/* Subtle info footer */}
                    <div className="mt-3 flex items-start gap-2 text-xs text-text-light dark:text-dark-text-muted">
                        <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                        <p>{t('contextNote')}</p>
                    </div>
                </div>
            )}
        </div>
    )
}
